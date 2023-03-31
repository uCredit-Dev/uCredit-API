import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/*  
    This model refers to a user plan.
    A user can have multiple plans for different combination of majors.
*/
const planSchema = new Schema({
  name: { type: String, required: true },
  majors: { type: [String] },
  year_ids: [{ type: Schema.Types.ObjectId, ref: 'Year' }],
  distribution_ids: [{ type: Schema.Types.ObjectId, ref: 'Distribution' }],
  user_id: { type: String, required: true },
  expireAt: { type: Date, expires: 60 * 60 * 24 },
});

export default mongoose.model('Plan', planSchema);
