import mongoose from "mongoose";
const Schema = mongoose.Schema;

/*  
    This model refers to specific courses that a student takes.
    Some fields are not required in order to support customized courses.
*/
const courseSchema = new Schema({
  title: { type: String, required: true },
  term: {
    type: String,
    required: true,
    enum: ["fall", "spring", "summer", "intersession", "All"],
  },
  termOffered: [{ type: String }],
  year: {
    type: String,
    required: true,
  },
  version: { type: String }, //the version of the SIS course
  number: String,
  department: String,
  tags: [{ type: String }],
  areas: { type: String },
  credits: { type: Number, required: true },
  wi: { type: Boolean, default: false },
  taken: { type: Boolean, default: false },
  preReq: { type: Array },
  isPlaceholder: { type: Boolean, default: false },
  isTransfer: { type: Boolean, default: false },
  ratings: Array,
  distribution_ids: [{ type: Schema.Types.ObjectId, ref: "Distribution" }],
  fineReq_ids: [{ type: Schema.Types.ObjectId, ref: "FineRequirement" }],
  year_id: { type: Schema.Types.ObjectId, ref: "Year" },
  plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  user_id: { type: String, required: true },
  level: { type: String, required: true },
  forceSatisfied: { type: String, required: false },
  expireAt: { type: Date, expires: 60 * 60 * 24 },
});

//custom static model functions
courseSchema.statics.findByDistributionId = function (d_id) {
  return this.find({ distribution_ids: d_id });
};

courseSchema.statics.findByPlanId = function (plan_id) {
  return this.find({ plan_id });
};

export default mongoose.model("Course", courseSchema);
