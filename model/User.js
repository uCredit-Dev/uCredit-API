const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: { type: String }, //JHED ID
  name: { type: String },
  email: { type: String },
  affiliation: { type: String }, //STUDENT, FACULTY or STAFF
  school: { type: String },
  grade: { type: String }, //AE UG Sophomore
<<<<<<< HEAD
  plan_ids: [{ type: Schema.Types.ObjectId, ref: "Plan", default: [] }],
=======
  plan_ids: [{ type: Schema.Types.ObjectId, ref: "Plan" }],
  whitelisted_plan_ids: [
    { type: Schema.Types.ObjectId, ref: "Plan", default: [] },
  ],
>>>>>>> parent of b5c25f9 (Merge pull request #27 from uCredit-Dev/iter-02-dockerize)
});

const User = mongoose.model("User", userSchema);

module.exports = User;
