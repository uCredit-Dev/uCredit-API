import mongoose from "mongoose";
const Schema = mongoose.Schema;

/*  
    This model refers to a specific comment(including replies). Every comment belongs to a thread.
*/
const commentSchema = new Schema({
  commenter_id: { type: String, ref: "User", required: true },
  visible_user_id: {
    type: [String],
    ref: "User",
    required: true,
  },
  thread_id: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

export default mongoose.model("Comment", commentSchema);
