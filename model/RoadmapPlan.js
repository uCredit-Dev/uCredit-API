const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to a user plan that has been posted on the roadmap.
    This is a distinct model from plans that a user has made for themselves
    on the dashboard.
*/
const roadmapPlanSchema = new Schema({
  original: { type: Schema.Types.ObjectId, ref: "Plan" },
  name: { type: String, required: true },
  majors: { type: [String] },
  tags: { type: [String] },
  num_likes: { type: Number, default: 0 },
  year_ids: [{ type: Schema.Types.ObjectId, ref: "Year" }],
  distribution_ids: [{ type: Schema.Types.ObjectId, ref: "Distribution" }],
  user_id: { type: String, required: true },
  expireAt: { type: Date },
  postedAt: { type: Date, default: Date.now, required: true },
  graduatesAt: { type: Date, required: true },
});

const RoadmapPlan = mongoose.model("RoadmapPlan", roadmapPlanSchema);

module.exports = RoadmapPlan;
