const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to a plan reivew.
*/
const planReviewSchema = new Schema({
  reviewee_id: { type: String, required: true, ref: "User" },
  reviewer_id: { type: String, required: true, ref: "User" },
  plan_id: { type: String, required: true, ref: "Plan" },
  status: {
    type: String,
    required: true,
    enum: ["PENDING", "UNDERREVIEW", "APPROVED", "REJECTED"],
  },
  requestTime: { type: Date },
});

const PlanReview = mongoose.model("PlanReview", planReviewSchema);

module.exports = PlanReview;
