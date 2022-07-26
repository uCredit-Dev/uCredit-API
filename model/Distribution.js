const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to distribution requirements set by the specific major.
    Potential names are: overall, humanity, basic science, core, 
    writing-intensive, team, focus-area, etc.
    If a course is an elective, it counts toward the overall category.
    Distribution must belong to a plan.
*/
const distributionSchema = new Schema({
  name: { type: String, required: true },
  required_credits: { type: Number, required: true },
  description: { type: String, required: true },
  criteria: { type: String, required: true },
  min_credits_per_course: { type: Number, required: true },
  user_id: { type: String, required: true },
  plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  major_id: { type: Schema.Types.ObjectId, ref: "Major", required: true },
  fineReq_ids: [{ type: Schema.Types.ObjectId, ref: "FineRequirement" }],
  planned: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  satisfied: { type: Boolean, default: false },
  user_select: { type: Boolean, default: false },
  double_count: [{ type: String }],
  pathing: { type: Number },
  expireAt: { type: Date },
});

distributionSchema.statics.findByName = function (name, user_id) {
  return this.find({ name, user_id });
};

distributionSchema.statics.removeCourse = function (course_id, user_id) {};

distributionSchema.statics.modifyCredits = function (field, value, user_id) {};

const Distribution = mongoose.model("Distribution", distributionSchema);

module.exports = Distribution;
