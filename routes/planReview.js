const { returnData, errorHandler } = require("./helperMethods.js");
const planReviews = require("../model/PlanReview.js");

const express = require("express");
const router = express.Router();

router.post("/api/planReview/request", async (req, res) => {
  const plan_id = req.body.plan_id;
  const reviewee_id = req.body.reviewee_id;
  const reviewer_id = req.body.reviewer_id;
<<<<<<< HEAD
  if (!plan_id || !reviewer_id || !reviewee_id) {
    errorHandler(res, 400, {
      message:
        "Missing plan_id, reviewee_id or reviewer_id in the request body.",
=======
  if (!plan_id || !reviewer_id) {
    errorHandler(res, 400, {
      message: "Missing plan_id or reviewer_id in the request body.",
>>>>>>> parent of b5c25f9 (Merge pull request #27 from uCredit-Dev/iter-02-dockerize)
    });
  } else {
    const review = await planReviews
      .findOne({ reviewer_id, reviewee_id, plan_id })
      .exec();
    if (review) {
      errorHandler(res, 409, {
        message: "Review request already created.",
      });
    } else {
      const planReview = {
        reviewee_id,
        reviewer_id,
        plan_id,
        requestTime: Date.now(),
        status: "PENDING",
      };
      planReviews
        .create(planReview)
        .then((review) => returnData(review, res))
        .catch((err) => errorHandler(res, 500, err));
    }
  }
<<<<<<< HEAD
});

//reviewer confirms the request, adding the plan id to the whitelisted_plan_ids array, changing the pending status
router.post("/api/planReview/confirm", (req, res) => {
  const review_id = req.body.review_id;
  if (!review_id) {
    errorHandler(res, 400, {
      message: "Missing review_id in request body.",
    });
  }
  planReviews.findById(review_id).then((review) => {
    if (!review) {
      errorHandler(res, 404, { message: "planReview not found." });
    } else if (review.status === "ACCEPTED") {
      errorHandler(res, 400, { message: "Reviewer already confirmed." });
    } else {
      review.status = "ACCEPTED";
      review.save();
      returnData(review, res);
    }
  });
});

/*
  Return a list of reviewrs for the plan with populated reviewer info
*/
router.get("/api/planReview/getReviewers", (req, res) => {
  const plan_id = req.query.plan_id;
  planReviews
    .find({ plan_id })
    .populate("reviewer_id", "name email affiliation school grade")
    .then((reviews) => returnData(reviews, res))
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Return a list of reviews of the reviewer with populated reviewee info
*/
router.get("/api/planReview/plansToReview", (req, res) => {
  const reviewer_id = req.query.reviewer_id;
  planReviews
    .find({ reviewer_id })
    .populate("reviewee_id", "name email affiliation school grade")
    .then((reviews) => returnData(reviews, res))
    .catch((err) => errorHandler(res, 500, err));
});

router.delete("/api/planReview/removeReview", (req, res) => {
  const review_id = req.query.review_id;
  planReviews
    .findByIdAndDelete(review_id)
    .then((review) => returnData(review, res))
    .catch((err) => errorHandler(res, 500, err));

=======
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
>>>>>>> parent of b5c25f9 (Merge pull request #27 from uCredit-Dev/iter-02-dockerize)
});

module.exports = router;
