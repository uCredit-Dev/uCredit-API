import mongoose from "mongoose";

/*
  Fields needed to create a new Comment.
*/
export interface CommentAttrs {
  commenter_id: mongoose.Schema.Types.ObjectId;
  visible_user_id: mongoose.Schema.Types.ObjectId[];
  message: String;
  date: Date;
}

/*
  Fields needed to update a comment.
*/
export interface UpdateCommentAttrs {
  message: String;
}

/*
  Declare fields in a created Comment document.
*/
export interface CommentDoc extends mongoose.Document {
  commenter_id: mongoose.Schema.Types.ObjectId;
  visible_user_id: mongoose.Schema.Types.ObjectId[];
  thread_id: mongoose.Schema.Types.ObjectId;
  message: string;
  date: Date;
}

interface CommentModel extends mongoose.Model<CommentDoc> {
  build(attrs: CommentAttrs): CommentDoc;
}

/*  
    This model refers to a specific comment(including replies). Every comment belongs to a thread.
*/
const commentSchema = new mongoose.Schema({
  commenter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  visible_user_id: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true,
  },
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
  },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

commentSchema.statics.build = (attrs: CommentAttrs) => {
  return new Comment(attrs);
};

const Comment = mongoose.model<CommentDoc, CommentModel>(
  "Comment",
  commentSchema
);

export { Comment };
