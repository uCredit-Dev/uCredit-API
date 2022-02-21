const { returnData, errorHandler } = require("./helperMethods.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");

const express = require("express");
const router = express.Router();

router.post("/api/planReview/addReviewer", (req, res) => {
  const plan_id = req.body.plan_id;
  const reviewer_id = req.body.reviwer_id;
  plans
    .findById(plan_id)
    .then((plan) => {
      if (plan.reviewers.indexOf(reviewer_id) < 0) {
        //add reviwer_id to the plan
        plan.reviewers.push(reviewer_id);
        //add plan_id to reviewer's doc
        users.findById(reviewer_id).then((user) => {
          user.whitelisted_plan_ids.push(plan_id);
          user.save();
        });
      } else {
        errorHandler(res, 400, {
          message: "Reviewer already added for this plan.",
        });
      }
      plan.save();
      returnData(plan, res);
    })
    .catch((err) => errorHandler(err));
});

module.exports = router;
