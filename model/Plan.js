const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to a user plan.
    A user can have multiple plans for different combination of majors.
*/
const planSchema = new Schema({
  name: { type: String, required: true },
  majors: { type: [String] },
  major_ids: [{ type: Schema.Types.ObjectId, ref: "Major" }],
  year_ids: [{ type: Schema.Types.ObjectId, ref: "Year" }],
  user_id: { type: String, required: true },
  expireAt: { type: Date },
});

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;
