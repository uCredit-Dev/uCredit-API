const {
  returnData,
  errorHandler,
  postNotification,
} = require("./helperMethods.js");
const planReviews = require("../model/PlanReview.js");
const nodemailer = require("nodemailer");

const express = require("express");
const router = express.Router();
const DEBUG = process.env.DEBUG === "True";

router.post("/api/planReview/request", async (req, res) => {
  const plan_id = req.body.plan_id;
  const reviewee_id = req.body.reviewee_id;
  const reviewee_name = req.body.reviewee_id;
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
        .then((review) => {
          postNotification(
            `${reviewee_name} has requested you to review a plan.`,
            [reviewer_id],
            review._id,
            "PLANREVIEW"
          );
          sendReviewMail(reviewee_id, reviewer_id, plan_id);
          returnData(review, res);
        })
        .catch((err) => errorHandler(res, 500, err));
    }
  }
});

const confirmPlanReview = (review, res) => {
  if (!review) {
    errorHandler(res, 404, { message: "planReview not found." });
  } else if (review.status === "UNDERREVIEW") {
    errorHandler(res, 400, { message: "Reviewer already confirmed." });
  } else {
    review.status = "UNDERREVIEW";
    review.save();
    postNotification(
      `${review.reviewer_id.name} has accepted your plan review request.`,
      [review.reviewee_id],
      review._id,
      "PLANREVIEW"
    );
    returnData(review, res);
  }
};

//reviewer confirms the request, adding the plan id to the whitelisted_plan_ids array, changing the pending status
router.post("/api/planReview/confirm", (req, res) => {
  const review_id = req.body.review_id;
  if (!review_id) {
    errorHandler(res, 400, {
      message: "Missing review_id in request body.",
    });
  }
  planReviews
    .findById(review_id)
    .populate("reviewer_id", "name")
    .then((review) => {
      confirmPlanReview(review, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

// if (DEBUG) {
router.post("/api/backdoor/planReview/confirm", (req, res) => {
  const reviewer_id = req.body.reviewer_id;
  planReviews
    .findOne({ reviewer_id })
    .populate("reviewer_id", "name")
    .then((review) => {
      confirmPlanReview(review, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});
// }

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

/*
  Return a list of reviewers for the plan with populated reviewer info
*/
router.post("/api/planReview/changeStatus", (req, res) => {
  const review_id = req.body.review_id;
  const status = req.body.status;
  if (
    !(
      status === "REJECTED" ||
      status === "APPROVED" ||
      status === "UNDERREVIEW"
    )
  ) {
    errorHandler(res, 400, {
      message: "Invalid status. Must be APPROVED, REJECTED, or UNDERREVIEW.",
    });
  }
  planReviews
    .findById(review_id)
    .then((review) => {
      if (!review) {
        errorHandler(res, 404, { message: "planReview not found." });
      } else if (review.status === "PENDING") {
        errorHandler(res, 400, { message: "Review currently pending." });
      } else {
        review.status = status;
        if (status === "UNDERREVIEW") review.requestTime = Date.now();
        review.save();
        sendReviewMail(review.reviewee_id, review.reviewer_id, review.plan_id);
        postNotification(
          `A plan review status has changed to ${status}.`,
          [review.reviewee_id],
          review_id,
          "PLANREVIEW"
        );
        returnData(review, res);
      }
    })
    .catch((err) => errorHandler(res, 500, err));
});

// async..await is not allowed in global scope, must use a wrapper
async function sendReviewMail(reviewee_id, reviewer_id, plan_id) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: "ucreditdev@gmail.com",
      clientId:
        "258377223314-218vsftjcq46a2l43e81hesoo4unmdjg.apps.googleusercontent.com",
      clientSecret: "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",
      refreshToken:
        "1//04imE9pIG-khOCgYIARAAGAQSNwF-L9IrTuI4rKvAo2l8oPA0_HIZhUB98vmO0pvH__GOqn7n3bvNK-s-DcQcaFBr-77OdcsOtj4",
      accessToken:
        "ya29.A0AVA9y1sHpW6M88rODXcxlIA7CLXZzT6wyk8Co9HLo8-Da7--qGXnnXJaIDBpB6uUM1BIKa9Jt0VXtorob7HwBTQjHaINxz0uHON0pDgVFdc9CwKNc46DCNJFo5DvthPzvAPnJlCIh2a0G_zL8mHIX_cLZbJ5YUNnWUtBVEFTQVRBU0ZRRTY1ZHI4TDFnMmlYVVhpZGpYNW9SdW5EWFUtdw0163",
      expires: 1484314697598,
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: "uCredit", // sender address
    to: `${reviewer_id}@jh.edu`, // list of receivers
    subject: `Invitation to Review uCredit Plan from ${reviewee_id}`, // Subject line
    html: `<div><p>Hello ${reviewer_id},</p><p>You have recieved a request to review ${reviewee_id}'s uCredit Plan:</p><p>Please click the following link to accept.</p><p>https://ucredit.me/reviewer/${plan_id}</p><p>Best wishes,</p><p>uCredit</p</div>`, // html body
  });
}

router.delete("/api/planReview/removeReview", (req, res) => {
  const review_id = req.query.review_id;
  planReviews
    .findByIdAndDelete(review_id)
    .then((review) => {
      postNotification(
        `A plan review request has been removed.`,
        [review.reviewee_id, review.reviewer_id],
        review_id,
        "PLANREVIEW"
      );
      returnData(review, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

module.exports = router;
