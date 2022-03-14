const { returnData, errorHandler } = require("./helperMethods.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");

const express = require("express");
const router = express.Router();

router.post("/api/planReview/request", (req, res) => {
  const plan_id = req.body.plan_id;
  const reviewer_id = req.body.reviewer_id;
  if (!plan_id || !reviewer_id) {
    errorHandler(res, 400, {
      message: "Missing plan_id or reviewer_id in the request body.",
    });
  }
  plans
    .findById(plan_id)
    .then(async (plan) => {
      if (plan.reviewers.indexOf(reviewer_id) < 0) {
        //pull up reviewer info
        await users
          .findById(reviewer_id)
          .then((user) => {
            if (!user) {
              errorHandler(res, 404, {
                message: "Reviewer is not registered.",
              });
            }
            //send email
          })
          .catch((err) => errorHandler(res, 500, err));
        const request = {
          user_id: reviewer_id,
          pending: true,
          sentTime: Date.now(),
        };
        plan.reviewers.push(request);
        plan.save();
        returnData(plan.reviewers, res);
      } else {
        errorHandler(res, 409, {
          message: "Reviewer already added for this plan.",
        });
      }
    })
    .catch((err) => errorHandler(res, 400, err));
});

//reviewer confirms the request, adding the plan id to the whitelisted_plan_ids array, changing the pending status
router.post("/api/planReview/confirm", (req, res) => {
  const plan_id = req.body.plan_id;
  const reviewer_id = req.body.reviewer_id;
  if (!plan_id || !reviewer_id) {
    errorHandler(res, 400, {
      message: "Missing plan_id or reviewer_id in the request body.",
    });
  }
  users
    .findById(reviewer_id)
    .then((reviewer) => {
      if (reviewer.whitelisted_plan_ids.indexOf(plan_id) >= 0) {
        errorHandler(res, 409, { message: "Reviewer already confirmed." });
      } else {
        reviewer.whitelisted_plan_ids.push(plan_id);
        reviewer.save();
      }
    })
    .catch((err) => errorHandler(res, 500, err));
  //change the pending status of the request
  plans
    .findById(plan_id)
    .then((plan) => {
      plan.reviewers = plan.reviewers.map((r) => {
        if (r.user_id === reviewer_id) {
          r.pending = false;
        }
        return r;
      });
      plan.save();
      returnData("Reviewer confirmed.", res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

router.delete("/api/planReview/removeReviewer", (req, res) => {
  const plan_id = req.body.plan_id;
  const reviewer_id = req.body.reviewer_id;
  plans
    .findById(plan_id)
    .then((plan) => {
      const reviewer_index = plan.reviewers.findIndex(
        (r) => r.user_id === reviewer_id
      );
      if (reviewer_index >= 0) {
        //remove reviwer_id from the plan
        plan.reviewers.splice(reviewer_index, 1);
        //remove plan_id from reviewer's doc
        users
          .findById(reviewer_id)
          .then((user) => {
            const plan_index = user.whitelisted_plan_ids.indexOf(plan_id);
            user.whitelisted_plan_ids.splice(plan_index, 1);
            user.save();
          })
          .catch((err) => errorHandler(err));
        plan.save();
      } else {
        errorHandler(res, 404, {
          message: "Reviewer does not exist for this plan.",
        });
      }
      returnData(plan, res);
    })
    .catch((err) => errorHandler(err));
});

module.exports = router;
