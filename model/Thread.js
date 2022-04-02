const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to specific courses that a student takes.
    Some fields are not required in order to support customized courses.
*/
const threadSchema = new Schema({
  plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  resolved: { type: Boolean, default: false },
});

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
