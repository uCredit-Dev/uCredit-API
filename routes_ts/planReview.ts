import {
  returnData,
  errorHandler,
  postNotification,
  forbiddenHandler,
  missingHandler,
  REVIEW_STATUS,
  NOTIF_TYPE
} from "./helperMethods";
import { auth } from "../util/token.js";
import Plans from "../model/Plan.js";
import { PlanReview, PlanReviewStatus } from "../model_ts/PlanReview";
import Users from "../model/User.js";
import nodemailer from "nodemailer";
import express, {Request, Response} from "express";
import dotenv from "dotenv";
import Plan from "../model/Plan.js";

dotenv.config();

const router = express.Router();
// const DEBUG = process.env.DEBUG === "True";
const appPassword = process.env.APP_PASSWORD;

router.post("/api/planReview/request", auth, async (req: any, res: Response) => { // todo: update req type
  const plan_id = req.body.plan_id;
  const reviewee_id = req.body.reviewee_id;
  const reviewee_name = req.body.reviewee_id;
  const reviewer_id = req.body.reviewer_id;
  if (!plan_id || !reviewer_id || !reviewee_id) {
    return missingHandler(res, { plan_id, reviewer_id, reviewee_id });
  }
  if (req.user._id !== reviewee_id) {
    return forbiddenHandler(res);
  }
  try {
    let review = await PlanReview
      .findOne({ reviewer_id, reviewee_id, plan_id })
      .exec();
    if (review) {
      return errorHandler(res, 409, {
        message: "Review request already created.",
      });
    }
    const planReview = {
      reviewee_id: reviewee_id,
      reviewer_id: reviewer_id,
      plan_id: plan_id,
      requestTime: Date.now(),
      status: PlanReviewStatus.PENDING,
    };
    const reviewResponse = await PlanReview.build(planReview);
    await postNotification(
      `${reviewee_name} has requested you to review a plan.`,
      [reviewer_id],
      reviewResponse._id,
      NOTIF_TYPE.PLANREVIEW
    );
    const reviewer = await Users.findById(reviewer_id).exec();
    const reviewee = await Users.findById(reviewee_id).exec();
    if (reviewer === null || reviewee === null) {
      return forbiddenHandler(res);
    }
    await sendReviewMail(
      reviewee.name,
      reviewer.name,
      reviewer.email,
      reviewResponse._id
    );
    returnData(review, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

const confirmPlanReview = async (review, res: Response) => {
  if (!review) {
    errorHandler(res, 404, { message: "planReview not found." });
  } else if (review.status === REVIEW_STATUS.UNDERREVIEW) {
    errorHandler(res, 400, { message: "Reviewer already confirmed." });
  } else {
    review.status = REVIEW_STATUS.UNDERREVIEW;
    await review.save();
    await postNotification(
      `${review.reviewer_id.name} has accepted your plan review request.`,
      [review.reviewee_id],
      review._id,
      NOTIF_TYPE.PLANREVIEW
    );
    returnData(review, res);
  }
};

//reviewer confirms the request, adding the plan id to the whitelisted_plan_ids array, changing the pending status
router.post("/api/planReview/confirm", auth, async (req: any, res: Response) => { // TODO: change req type
  const review_id = req.body.review_id;
  if (!review_id) {
    return missingHandler(res, { review_id });
  }
  try {
    const review = await PlanReview
      .findById(review_id)
      .populate("reviewer_id", "name")
      .exec();
    if (!review) {
      return errorHandler(res, 404, { message: "Review not found." }); 
    } else if (req.user._id !== review.reviewer_id) {
      return forbiddenHandler(res);
    } 
    await confirmPlanReview(review, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

// if (DEBUG) {
router.post("/api/backdoor/planReview/confirm", async (req, res) => {
  const reviewer_id = req.body.reviewer_id;
  if (!reviewer_id) {
    return missingHandler(res, { reviewer_id });
  }
  try {
    const review = await PlanReview
      .findOne({ reviewer_id })
      .populate("reviewer_id", "name")
      .exec();
    await confirmPlanReview(review, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});
// }

/*
  Return a list of reviewrs for the plan with populated reviewer info
*/
router.get("/api/planReview/getReviewers", auth, async (req: any, res: Response) => { // todo: change req type
  const plan_id = req.query.plan_id;
  if (!plan_id) {
    return missingHandler(res, { plan_id });
  }
  try {
    // check that plan belongs to user
    const plan = await Plans.findById(plan_id).exec();
    if (!plan) {
      return errorHandler(res, 404, { message: "Plan not found." }); 
    } 
    const user = await Users.findById(req.user._id).exec();
    if (!user) {
      return forbiddenHandler(res);
    }
    // get plan reviews for given plan
    const reviews = await PlanReview
      .find({ plan_id })
      .populate("reviewer_id", "name email affiliation school grade")
      .exec();
    returnData(reviews, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Return a list of reviewrs for the plan with populated reviewer info
*/
router.get("/api/planReview/plansToReview", auth, async (req: any, res) => { // todo change req type
  const reviewer_id = req.query.reviewer_id;
  if (!reviewer_id) {
    return missingHandler(res, { reviewer_id });
  }
  try {
    // only reviewer can get their plans to review
    const reviewer = await Users.findById(reviewer_id).exec(); 
    if (!reviewer) {
      return errorHandler(res, 404, { message: "Reviewer not found." }); 
    } else if (req.user._id !== reviewer._id) {
      return forbiddenHandler(res);
    }
    const reviews = await PlanReview
      .find({ reviewer_id })
      .populate("reviewee_id", "name email affiliation school grade")
      .exec();
    returnData(reviews, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Return a list of reviewers for the plan with populated reviewer info
*/
router.post("/api/planReview/changeStatus", auth, async (req: any, res) => { // todo: change req type
  const review_id = req.body.review_id;
  const status = req.body.status;
  if (!review_id || !status) {
    return missingHandler(res, { review_id, status });
  }
  if (
    !(
      status === REVIEW_STATUS.REJECTED ||
      status === REVIEW_STATUS.APPROVED ||
      status === REVIEW_STATUS.UNDERREVIEW
    )
  ) {
    return errorHandler(res, 400, {
      message: "Invalid status. Must be APPROVED, REJECTED, or UNDERREVIEW.",
    });
  }
  try {
    const review = await PlanReview.findById(review_id).exec();
    if (!review) {
      return errorHandler(res, 404, { message: "planReview not found." });
    } else if (req.user._id !== review.reviewer_id) {
      return forbiddenHandler(res);
    } else if (review.status === PlanReviewStatus.PENDING) {
      return errorHandler(res, 400, { message: "Review currently pending." });
    }
    const reviewer = await Users.findById(review.reviewer_id).exec();
    const reviewee = await Users.findById(review.reviewee_id).exec();
    if (reviewer === null || reviewee === null) {
      return forbiddenHandler(res);
    }
    review.status = status;
    // send email to review if status UNDERREVIEW
    if (status === PlanReviewStatus.UNDERREVIEW) {
      review.request_time = new Date(Date.now()); // TODO: double check the type for this (number or Date?)
      await sendReviewMail(
        reviewee.name,
        reviewer.name,
        reviewer.email,
        review._id
      );
    }
    review.reviewee_id
    await review.save();
    await postNotification(
      `A plan review status has changed to ${status}.`,
      [review.reviewee_id],
      review_id,
      NOTIF_TYPE.PLANREVIEW
    );
    returnData(review, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

// async..await is not allowed in global scope, must use a wrapper
async function sendReviewMail(revieweeName, reviewerName, email, review_id) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ucreditdev@gmail.com",
      pass: appPassword,
    },
  });
  // send mail with defined transport object
  await transporter.sendMail({
    from: "ucreditdev@gmail.com", // sender address
    to: email, // list of receivers
    subject: `Invitation to Review uCredit Plan from ${revieweeName}`, // Subject line
    html: `<div><p>Hello ${reviewerName},</p><p>You have recieved a request to review ${revieweeName}'s uCredit Plan:</p><p>Please click the following link to accept.</p><p>https://ucredit.me/reviewer/${review_id}</p><p>Best wishes,</p><p>uCredit</p</div>`, // html body
  });
}

router.delete("/api/planReview/removeReview", auth, async (req: any, res) => { // todo change req type
  const review_id = req.query.review_id;
  if (!review_id) {
    return missingHandler(res, { review_id });
  }
  try {
    // only reviewer or reviewee can delete a review
    let review = await PlanReview.findById(review_id).exec();
    if (!review) {
      return errorHandler(res, 404, { message: "Review not found." }); 
    } else if (
      req.user._id !== review.reviewer_id &&
      req.user._id !== review.reviewee_id
    ) {
      return forbiddenHandler(res);
    }
    // delete the review
    review = await PlanReview.findByIdAndDelete(review_id).exec();
    if (review === null) {
      return forbiddenHandler(res);
    }
    await postNotification(
      `A plan review request has been removed.`,
      [review.reviewee_id, review.reviewer_id],
      review_id,
      NOTIF_TYPE.PLANREVIEW
    );
    returnData(review, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
