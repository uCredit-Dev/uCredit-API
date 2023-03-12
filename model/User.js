import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: { type: String }, //JHED ID
  name: { type: String },
  email: { type: String },
  affiliation: { type: String }, //STUDENT, FACULTY or STAFF
  school: { type: String },
  grade: { type: String }, //AE UG Sophomore
  plan_ids: [{ type: Schema.Types.ObjectId, ref: 'Plan', default: [] }],
});

export default mongoose.model('User', userSchema);
