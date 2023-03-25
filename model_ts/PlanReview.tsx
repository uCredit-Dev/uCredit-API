import mongoose from "mongoose";

/**
 * This model refers to a plan review
 */

export enum PlanReviewStatus {
  PENDING = "PENDING",
  UNDERREVIEW = "UNDER REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

/**
 * Data Transfer Object (DTO) specification for CREATING a new Plan Review
 */
export interface PlanReviewAttrs {
  reviewee_id: String,
  reviewer_id: String,
  plan_id: String,
  status: PlanReviewStatus,
  // TODO (needed?): request_time: Date
};

/**
 * Declare fields in a created PlanReview document
 */
export interface PlanReviewDoc extends mongoose.Document {
  reviewee_id: String,
  reviewer_id: String,
  plan_id: String,
  status: PlanReviewStatus,
  request_time: Date
}

/**
 * Declares a build function to enforce the use of PlanReviewAttrs
 * - use `PlanReview.build()` rather than `new PlanReview()`
 */
interface PlanReviewModel extends mongoose.Model<PlanReviewDoc> {
  build(attrs: PlanReviewAttrs): PlanReviewDoc;
}

const planReviewSchema = new mongoose.Schema ({
  reviewee_id: {
    type: String,
    ref: "User",
    required: true
  },
  reviewer_id: {
    type: String,
    ref: "User",
    required: true
  },
  plan_id: {
    type: String,
    ref: "Plan",
    required: true
  },
  status: {
    type: String,
    enum: PlanReviewStatus,
    required: true
  },
  request_time: {
    type: Date,
    default: Date.now() // Request time is the same as the creation of the request object
  }
})

planReviewSchema.statics.build = (attrs: PlanReviewAttrs) => {
  return new PlanReview(attrs);
}

const PlanReview = mongoose.model<PlanReviewDoc, PlanReviewModel>("PlanReview", planReviewSchema);

export { PlanReview };