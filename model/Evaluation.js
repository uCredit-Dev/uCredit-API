import mongoose from "mongoose";
const Schema = mongoose.Schema;

const evalSchema = new Schema({
  n: { type: String, required: true },
  num: { type: String, required: true },
  i: { type: Array },
  a: { type: String },
  w: { type: String },
  c: { type: String },
  d: { type: String },
  o: { type: String },
  e: { type: Array },
  rev: { type: Array },
});

export default mongoose.model("Evaluation", evalSchema);
