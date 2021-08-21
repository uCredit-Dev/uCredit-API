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
  wi: { type: Boolean, required: false },
  required: { type: Number, required: true },
  planned: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  satisfied: { type: Boolean, default: false },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  user_id: { type: String, required: true },
  plan_id: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  expireAt: { type: Date },
});

distributionSchema.statics.findByName = function (name, user_id) {
  return this.find({ name, user_id });
};

distributionSchema.statics.removeCourse = function (course_id, user_id) {};

distributionSchema.statics.modifyCredits = function (field, value, user_id) {};

const Distribution = mongoose.model("Distribution", distributionSchema);

module.exports = Distribution;
