const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to specific courses that a student takes.
    Some fields are not required in order to support customized courses.
*/
const threadSchema = new Schema({
  plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  location_type: {
    type: String,
    enum: ["Course", "Semester", "Year", "Plan", "Distribution"],
    required: true,
  },
  location_id: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: true }],
});

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
