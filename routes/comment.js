import {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
} from "./helperMethods.js";
import Plans from "../model/Plan.js";
import Threads from "../model/Thread.js";
import Comments from "../model/Comment.js";
import { auth } from "../util/token.js";
import express from "express";

const router = express.Router();

/*
  Returns all threads of a plan with comments populated
  Comments of a thread are sorted by timestamp in ascending order
*/
router.get("/api/thread/getByPlan/:plan_id", auth, async (req, res) => {
  const plan_id = req.params.plan_id;
  try {
    // verify that plan belongs to request user
    const plan = await Plans.findById(plan_id).exec();
    if (plan.user_id !== req.user._id) return forbiddenHandler(res);
    // get all threads in plan
    const threads = await Threads.find({ plan_id }).exec();
    for (let i = 0; i < threads.length; i++) {
      const comments = await Comments.find({ thread_id: threads[i]._id })
        .populate("commenter_id", "name")
        .sort({ date: 1 })
        .exec();
      threads[i] = {
        ...threads[i]._doc,
        comments,
      };
    }
    returnData(threads, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Create a new comment(which results in creating a new thread)
*/
router.post("/api/thread/new", auth, async (req, res) => {
  const thread = req.body.thread;
  const comment = req.body.comment;
  if (!thread || !comment) {
    return missingHandler(res, { thread, comment });
  }
  // verify that commenter is request user
  if (req.user._id !== comment.commenter_id) {
    return forbiddenHandler(res);
  }
  try {
    const newThread = await Threads.create(thread);
    comment.thread_id = newThread._id;
    const newComment = await Comments.create(comment);
    returnData({ ...newThread._doc, comments: [newComment] }, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Add a reply to a thread
*/
router.post("/api/thread/reply", auth, async (req, res) => {
  const comment = req.body.comment;
  if (!comment) {
    return missingHandler(res, { comment });
  }
  // verify that commenter is request user
  if (req.user._id !== comment.commenter_id) {
    return forbiddenHandler(res);
  }
  try {
    const c = await Comments.create(comment);
    returnData(c, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

/*
  Resolve a thread
*/
router.patch("/api/thread/resolve", auth, async (req, res) => {
  const thread_id = req.body.thread_id;
  if (!thread_id) {
    return missingHandler(res, { thread_id });
  }
  try {
    const thread = await Threads.findById(thread_id).exec();
    // verify plan (and thrad) belongs to req user
    const plan = await Plans.findbyId(thread.plan_id).exec();
    if (plan.user_id !== req.user._id) {
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
router.patch("/api/comment", auth, async (req, res) => {
  const comment_id = req.body.comment_id;
  const message = req.body.message;
  if (!comment_id || !message) {
    return missingHandler(res, { comment_id, message });
  }
  try {
    const comment = await Comments.findById(comment_id).exec();
    // verify that commenter is request user
    if (req.user._id !== comment.commenter_id) {
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
router.delete("/api/comment", auth, async (req, res) => {
  const comment_id = req.body.comment_id;
  if (!comment_id) {
    return missingHandler(res, { comment_id });
  }
  try {
    const toDelete = await Comments.findById(comment_id).exec();
    // verify that commenter is request user
    if (req.user._id !== toDelete.commenter_id) {
      return forbiddenHandler(res);
    }
    const deleted = await Comments.findByIdAndDelete(comment_id).exec();
    returnData(deleted, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/*
  Delete a thread and its comments
*/
router.delete("/api/thread", auth, async (req, res) => {
  const thread_id = req.body.thread_id;
  if (!thread_id) {
    return missingHandler(res, { thread_id });
  }
  try {
    // verify plan (and thread) belongs to req user
    const thread = await Threads.findById(thread_id).exec();
    const plan = await Plans.findById(thread.plan_id).exec();
    if (plan.user_id !== req.user._id) {
      return forbiddenHandler(res);
    }
    // delete thread and its comments
    const deleted = await Threads.findByIdAndDelete(thread_id).exec();
    await Comments.deleteMany({ thread_id }).exec();
    returnData(deleted, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
