const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to specific courses that a student takes.
    Some fields are not required in order to support customized courses.
*/
const courseSchema = new Schema({
  title: { type: String, required: true },
  term: { type: String, required: true, enum: ["Fall", "Spring", "Summer"] },
  year: {
    type: String,
    required: true,
    enum: ["Freshmen", "Sophomore", "Junior", "Senior"],
  },
  number: String,
  department: String,
  tags: String,
  area: String,
  credits: { type: Number, required: true },
  wi: { type: Boolean, required: true },
  ratings: Array,
  distribution: { type: Schema.Types.ObjectId, ref: "Distribution" },
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
