const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const yearSchema = new Schema({
  name: { type: String, required: true }, //freshman
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  user_id: { type: String, required: true },
  expireAt: { type: Date },
  year: { type: Number, required: true },
});

const Year = mongoose.model("Year", yearSchema);

module.exports = Year;
