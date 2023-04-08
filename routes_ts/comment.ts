import {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
} from "./helperMethods";
import { Plan } from "../model_ts/Plan";
import { Thread } from "../model_ts/Thread";
import { Comment } from "../model_ts/Comment";
import express, { Request, Response } from "express";
import { auth } from "../util_ts/token";

const router = express.Router();

/*
  Returns all threads of a plan with comments populated
  Comments of a thread are sorted by timestamp in ascending order
*/
router.get("/api/comments/getByPlan/:plan_id", auth, async (req: Request, res: Response) => {
  const plan_id = req.params.plan_id;
  try {
    // verify that plan belongs to request user
    const plan = await Plan.findById(plan_id).exec();
    if (!plan) return errorHandler(res, 404, { message: "Plan not found." }); 
    // get all threads in plan
    const threads = await Thread.find({ plan_id }).exec();
    const threads_and_comments: any[] = [];
    for (let i = 0; i < threads.length; i++) {
      const comments = await Comment.find({ thread_id: threads[i]._id })
        .populate("commenter_id", "name")
        .sort({ date: 1 })
        .exec();
      threads_and_comments[i] = {
        ...threads[i],
        comments,
      };
    }
    returnData(threads_and_comments, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Create a new comment(which results in creating a new thread)
*/
router.post("/api/thread/new", auth, async (req: any, res: Response) => {
  const thread = req.body.thread;
  const comment = req.body.comment;
  if (!thread || !comment || Object.keys(thread).length == 0 || Object.keys(comment).length == 0) {
    return missingHandler(res, { thread, comment });
  }
  // verify that commenter is request user
  if (req.user._id !== comment.commenter_id) {
    return forbiddenHandler(res);
  }
  try {
    const newThread = await Thread.create(thread);
    comment.thread_id = newThread._id;
    const newComment = await Comment.create(comment);
    returnData({ ...newThread, comments: [newComment] }, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Add a reply to a thread
*/
router.post("/api/thread/reply", auth, async (req: any, res: Response) => {
  const body = req.body.comment;
  if (!body || Object.keys(body).length == 0) {
    return missingHandler(res, { comment: body });
  }
  // verify that commenter is request user
  if (req.user._id !== body.commenter_id) {
    return forbiddenHandler(res);
  }
  try {
    const comment = await Comment.create(body);
    returnData(comment, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Resolve a thread
*/
router.patch("/api/thread/resolve", auth, async (req: any, res: Response) => {
  const thread_id = req.body.thread_id;
  if (!thread_id) {
    return missingHandler(res, { thread_id });
  }
  try {
    // check that thread exists
    const thread = await Thread.findById(thread_id).exec();
    if (!thread) {
      return errorHandler(res, 404, { message: "Thread not found." }); 
    }
    // only plan owner can resolve?
    const plan = await Plan.findById(thread.plan_id).exec();
    if (plan?.user_id !== req.user._id) {
      return forbiddenHandler(res);
    }
    // update resolved
    thread.resolved = true;
    await thread.save();
    returnData(thread, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Edit a comment
*/
router.patch("/api/comment", auth, async (req: any, res: Response) => {
  const comment_id = req.body.comment_id;
  const message = req.body.message;
  if (!comment_id || !message) {
    return missingHandler(res, { comment_id, message });
  }
  try {
    const comment = await Comment.findById(comment_id).exec();
    // verify that commenter is request user
    if (!comment) {
      return errorHandler(res, 404, { message: "Comment not found." }); 
    } else if (req.user._id !== comment.commenter_id) {
      return forbiddenHandler(res);
    }
    // update message
    comment.message = message;
    await comment.save();
    returnData(comment, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Delete a comment
*/
router.delete("/api/comment", auth, async (req: any, res: Response) => {
  const comment_id = req.body.comment_id;
  if (!comment_id) {
    return missingHandler(res, { comment_id });
  }
  try {
    const toDelete = await Comment.findById(comment_id).exec();
    // verify that commenter is request user
    if (!toDelete) {
      return errorHandler(res, 404, { message: "Comment not found." }); 
    } else if (req.user._id !== toDelete.commenter_id) {
      return forbiddenHandler(res);
    }
    const deleted = await Comment.findByIdAndDelete(comment_id).exec();
    returnData(deleted, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Delete a thread and its comments
*/
router.delete("/api/thread", auth, async (req: any, res: Response) => {
  const thread_id = req.body.thread_id;
  if (!thread_id) {
    return missingHandler(res, { thread_id });
  }
  try {
    // verify that thread exists
    const thread = await Thread.findById(thread_id).exec();
    if (!thread) {
      return errorHandler(res, 404, { message: "Thread not found." }); 
    }
    // verify plan (and thread) belongs to req user
    const plan = await Plan.findById(thread.plan_id).exec();
    if (plan?.user_id !== req.user._id) {
      return forbiddenHandler(res);
    }
    // delete thread and its comments
    const deleted = await Thread.findByIdAndDelete(thread_id).exec();
    await Comment.deleteMany({ thread_id }).exec();
    returnData(deleted, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;