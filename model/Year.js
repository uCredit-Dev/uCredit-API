const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const yearSchema = new Schema({
  name: { type: String }, //freshman
  year: { type: Number }, //e.g. 2019
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  plan_id: [{ type: Schema.Types.ObjectId, ref: "Plan", required: true }],
  user_id: { type: String, required: true },
});

const Year = mongoose.model("Year", yearSchema);

module.exports = Year;
