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
  number: String,
  department: String,
  tags: [{ type: String }],
  area: String,
  credits: { type: Number, required: true },
  wi: { type: Boolean, default: false },
  taken: { type: Boolean, default: false },
  ratings: Array,
  distribution_ids: [{ type: Schema.Types.ObjectId, ref: "Distribution" }],
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
});

//custom static model functions
courseSchema.statics.findByTerm = function (user_id, term) {
  return this.find({ user_id, term });
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
