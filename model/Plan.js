import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/*  
    This model refers to a user plan.
    A user can have multiple plans for different combination of majors.
*/
const planSchema = new Schema({
  name: { type: String, required: true },
  major_ids: [{ type: String, required: true }],
  year_ids: [{ type: Schema.Types.ObjectId, ref: 'Year' }],
  user_id: { type: String, required: true },
  expireAt: { type: Date, expires: 60 * 60 * 24 },
}, 
{timestamps: true});

export default mongoose.model('Plan', planSchema);
