const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to a user plan.
    A user can have multiple plans for different combination of majors.
*/
const planSchema = new Schema({
  name: { type: String, required: true },
  majors: { type: [String] },
  year_ids: [{ type: Schema.Types.ObjectId, ref: "Year" }],
  distribution_ids: [{ type: Schema.Types.ObjectId, ref: "Distribution" }],
  carts: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
  user_id: { type: String, required: true },
  expireAt: { type: Date },
});

//return the user's courses of a specific term(e.g. sophomore spring in plan 1)
// planSchema.statics.findCoursesByTerm = async function (plan_id, year, term) {
//   const plan = await this.findOne({ _id: plan_id })
//     .populate({
//       path: years,
//       match: { name: year },
//       populate: { path: "courses", match: { term } },
//     })
//     .exec();
//   return plan.years;
// };

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;
