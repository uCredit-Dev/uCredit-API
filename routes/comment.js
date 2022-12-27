import { returnData, errorHandler, forbiddenHandler } from "./helperMethods.js";
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
router.get("/api/thread/getByPlan/:plan_id", auth, (req, res) => {
  const plan_id = req.params.plan_id;
  // verify that plan belongs to request user
  Plans.findById(plan_id).then((plan) => {
    if (plan.user_id !== req.user._id) return forbiddenHandler(res);
  });
  Threads.find({ plan_id })
    .then(async (threads) => {
      for (let i = 0; i < threads.length; i++) {
        threads[i] = {
          ...threads[i]._doc,
          comments: await Comments.find({ thread_id: threads[i]._id })
            .populate("commenter_id", "name")
            .sort({ date: 1 })
            .exec(),
        };
      }
      returnData(threads, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Create a new comment(which results in creating a new thread)
*/
router.post("/api/thread/new", auth, async (req, res) => {
  const thread = req.body.thread;
  const comment = req.body.comment;
  // verify that commenter is request user
  if (req.user._id !== comment.commenter_id) {
    return forbiddenHandler(res);
  }
  Threads.create(thread)
    .then((t) => {
      comment.thread_id = t._id;
      console.log(t);
      Comments.create(comment)
        .then((c) => returnData({ ...t._doc, comments: [c] }, res))
        .catch((err) => {
          console.log(err);
          errorHandler(res, 400, err);
        });
    })
    .catch((err) => {
      console.log(err);
      errorHandler(res, 400, err);
    });
});

/*
  Add a reply to a thread
*/
router.post("/api/thread/reply", auth, async (req, res) => {
  const comment = req.body.comment;
  // verify that commenter is request user
  if (req.user._id !== comment.commenter_id) {
    return forbiddenHandler(res);
  }
  Comments.create(comment)
    .then((c) => returnData(c, res))
    .catch((err) => errorHandler(res, 400, err));
});

/*
  Resolve a thread
*/
router.patch("/api/thread/resolve", auth, (req, res) => {
  const thread_id = req.body.thread_id;
  Threads.findById(thread_id)
    .then((thread) => {
      // verify plan (and thrad) belongs to req user
      Plans.findById(thread.plan_id).then((plan) => {
        if (plan.user_id !== req.user._id) {
          return forbiddenHandler(res);
        }
      });
      // update resolved
      thread.resolved = true;
      thread.save();
      returnData(thread, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Edit a comment
*/
router.patch("/api/comment", auth, (req, res) => {
  const comment_id = req.body.comment_id;
  const message = req.body.message;
  Comments.findById(comment_id)
    .then((comment) => {
      // verify that commenter is request user
      if (req.user._id !== comment.commenter_id) {
        return forbiddenHandler(res);
      }
      // update message
      comment.message = message;
      comment.save();
      returnData(comment, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Delete a comment
*/
router.delete("/api/comment", auth, (req, res) => {
  const comment_id = req.body.comment_id;
  if (!comment_id) errorHandler(res, 400, { message: "Missing comment_id." });
  else {
    Comments.findById(comment_id).then((comment) => {
      // verify that commenter is request user
      if (req.user._id !== comment.commenter_id) {
        return forbiddenHandler(res);
      }
    });
    Comments.findByIdAndDelete(comment_id)
      .then((c) => returnData(c, res))
      .catch((err) => errorHandler(res, 500, err));
  }
});

/*
  Delete a thread and its comments
*/
router.delete("/api/thread", auth, (req, res) => {
  const thread_id = req.body.thread_id;
  if (!thread_id) {
    errorHandler(res, 400, { message: "Missing thread_id." });
  }
  // verify plan (and thrad) belongs to req user
  Threads.findById(thread_id).then((thread) => {
    Plans.findById(thread.plan_id)
      .then((plan) => {
        if (plan.user_id !== req.user._id) {
          return forbiddenHandler(res);
        }
      })
      .catch((err) => errorHandler(res, 500, err));
  });
  // delete thread and its comments
  Threads.findByIdAndDelete(thread_id)
    .then((c) => returnData(c, res))
    .catch((err) => errorHandler(res, 500, err));
  Comments.deleteMany({ thread_id }).exec();
});

export default router;
