const { returnData, errorHandler } = require("./helperMethods.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");

const express = require("express");
const router = express.Router();

router.post("/api/planReview/addReviewer", (req, res) => {
  const plan_id = req.body.plan_id;
  const reviewer_id = req.body.reviewer_id;
  if (!plan_id || !reviewer_id) {
    errorHandler(res, 400, {
      message: "Missing plan_id or reviewer_id in the request body.",
    });
  }
  plans
    .findById(plan_id)
    .then((plan) => {
      if (plan.reviewers.indexOf(reviewer_id) < 0) {
        //add reviwer_id to the plan
        plan.reviewers.push(reviewer_id);
        //add plan_id to reviewer's doc
        users
          .findById(reviewer_id)
          .then((user) => {
            user.whitelisted_plan_ids.push(plan_id);
            user.save();
          })
          .catch((err) => errorHandler);
        plan.save();
      } else {
        errorHandler(res, 400, {
          message: "Reviewer already added for this plan.",
        });
      }
      returnData(plan, res);
    })
    .catch((err) => errorHandler(err));
});

router.delete("/api/planReview/removeReviewer", (req, res) => {
  const plan_id = req.body.plan_id;
  const reviewer_id = req.body.reviewer_id;
  plans
    .findById(plan_id)
    .then((plan) => {
      const reviewer_index = plan.reviewers.indexOf(reviewer_id);
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
