const { returnData, errorHandler } = require("./helperMethods.js");
const planReviews = require("../model/PlanReview.js");

const express = require("express");
const router = express.Router();

router.post("/api/planReview/request", async (req, res) => {
  const plan_id = req.body.plan_id;
  const reviewee_id = req.body.reviewee_id;
  const reviewer_id = req.body.reviewer_id;
  if (!plan_id || !reviewer_id || !reviewee_id) {
    errorHandler(res, 400, {
      message:
        "Missing plan_id, reviewee_id or reviewer_id in the request body.",
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
  Return a list of reviewrs for the plan with populated reviewer info
*/
router.get("/api/planReview/plansToReview", (req, res) => {
  const reviewer_id = req.query.reviewer_id;
  planReviews
    .find({ reviewer_id })
    .populate("reviewee_id", "name email affiliation school grade")
    .then((reviews) => returnData(reviews, res))
    .catch((err) => errorHandler(res, 500, err));
});

router.post("/api/planReview/repeatReview", (req, res) => {
  const id = req.body.review_id;
  planReviews.findById(id).then((review) => {
    if (!review) {
      errorHandler(res, 404, { message: "Review not found." });
    } else {
      if (review.status === "PENDING") {
        review.status = "UNDERREVIEW";
        review.requestTime = Date.now();
        review.save();
        // TODO: Create a new notification when this occurs
        returnData(review, res);
      } else {
        errorHandler(res, 404, { message: "Review currently pending." });
      }
    }
  });
});

router.delete("/api/planReview/removeReview", (req, res) => {
  const review_id = req.query.review_id;
  planReviews
    .findByIdAndDelete(review_id)
    .then((review) => returnData(review, res))
    .catch((err) => errorHandler(res, 500, err));
});

module.exports = router;
