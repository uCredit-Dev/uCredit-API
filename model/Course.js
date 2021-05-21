const mongoose = require("mongoose");
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
    enum: ["fall", "spring", "summer", "intersession"],
  },
  year: {
    type: String,
    required: true,
    enum: ["freshman", "sophomore", "junior", "senior"],
  },
  number: String,
  department: String,
  tags: [{ type: String }],
  area: String,
  credits: { type: Number, required: true },
  wi: { type: Boolean, default: false },
  taken: { type: Boolean, default: false },
  ratings: Array,
  distribution_ids: [
    { type: Schema.Types.ObjectId, ref: "Distribution", required: true },
  ],
  plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  user_id: { type: String, required: true },
  createdAt: { type: Date, required: false },
});

//custom static model functions
courseSchema.statics.findByDistributionId = function (d_id) {
  return this.find({ distribution_ids: d_id });
};

courseSchema.statics.findByPlanId = function (plan_id) {
  return this.find({ plan_id });
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
