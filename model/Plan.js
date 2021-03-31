const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to a user plan.
    A user can have multiple plans for different combination of majors.
*/
const planSchema = new Schema({
  name: { type: String, required: true },
  majors: { type: [String] },
  freshman: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  sophomore: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  junior: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  senior: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  distribution_ids: [{ type: Schema.Types.ObjectId, ref: "Distribution" }],
  user_id: { type: String, required: true },
});

//return the user's courses of a specific term(e.g. sophomore spring in plan 1)
planSchema.statics.findCoursesByTerm = async function (plan_id, year, term) {
  const plan = await this.findOne({ _id: plan_id })
    .populate({ path: year, match: { term } })
    .exec();
  return plan[year];
};

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;
