const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to specific courses that a student takes.
    Some fields are not required in order to support customized courses.
*/
const commentSchema = new Schema({
  user_id: { ObjectId: { type: Schema.Types.ObjectId, ref: "User" } },
  parent_type: { type: String, required: true },
  parent_id: { type: Schema.Types.ObjectId, required: true },
  child_id: {
    type: Schema.Types.ObjectId | null,
    required: true,
    ref: "Comment",
  },
  comment: { type: String, required: true },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
