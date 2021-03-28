//const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: { type: String, required: true }, //JHED ID
  name: { type: String, required: true },
  email: { type: String, required: true },
  affiliation: { type: String, required: true }, //STUDENT, FACULTY or STAFF
  school: { type: String, require: true },
  grade: { type: String, required: true },
  plan_ids: [{ type: Schema.Types.ObjectId, ref: "Plan" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
