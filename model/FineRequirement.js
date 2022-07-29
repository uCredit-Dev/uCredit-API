const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fineSchema = new Schema({
  description: { type: String, required: true },
  required_credits: { type: Number, required: true },
  criteria: { type: String, required: true },
  plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  major_id: { type: String, required: true },
  distribution_id: {
    type: Schema.Types.ObjectId,
    ref: "Distribution",
    required: true,
  },
  planned: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  satisfied: { type: Boolean, default: false },
  double_count: [{ type: String }],
  expireAt: { type: Date },
});

const FineRequirement = mongoose.model("FineRequirement", fineSchema);

module.exports = FineRequirement;
