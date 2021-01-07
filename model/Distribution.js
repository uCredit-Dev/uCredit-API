const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to distribution requirements set by the specific major.
    Potential names are: overall, humanity, basic science, core, 
    writing-intensive, team, focus-area, etc.
    If a course is an elective, it counts toward the overall category.
*/
const distributionSchema = new Schema({
  name: { type: String, required: true },
  required: { type: Number, required: true },
  planned: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  satisfied: { type: Boolean, defalut: false },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

distributionSchema.statics.findByName = function (name, user_id) {
  return this.find({ name, user_id });
};

distributionSchema.statics.addCourse = function (course_id, user_id) {
  this.update();
};

distributionSchema.statics.removeCourse = function (course_id, user_id) {};

distributionSchema.statics.modifyCredits = function (field, value, user_id) {};

const Distribution = mongoose.model("Distribution", distributionSchema);

module.exports = Distribution;
