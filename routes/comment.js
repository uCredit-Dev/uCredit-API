const { returnData, errorHandler } = require("./helperMethods.js");
const Threads = require("../model/Thread.js");
const Comments = require("../model/Comment.js");

const express = require("express");
const router = express.Router();

/*
  Returns all threads of a plan with comments populated
  Comments of a thread are sorted by timestamp in ascending order
*/
router.get("/api/thread/getByPlan/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  console.log(plan_id)
  Threads.find({ plan_id })
    .then(async (threads) => {
      for (let i = 0; i < threads.length; i++) {
        threads[i]= {
          ...threads[i]._doc, 
          comments: await Comments.find({ thread_id: threads[i]._id })
            .populate("commenter_id", "name")
            .sort({ date: 1 })
            .exec()
        }
      }
      returnData(threads, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Create a new comment(which results in creating a new thread)
*/
router.post("/api/thread/new", async (req, res) => {
  const thread = req.body.thread;
  const comment = req.body.comment;
  console.log(thread, comment)
  Threads.create(
    thread,
  )
    .then((t) => {
      comment.thread_id = t._id;
      console.log(t)
      Comments.create(comment)
        .then((c) => returnData(c, res))
        .catch((err) => {
          console.log(err)
          errorHandler(res, 400, err)
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
router.post("/api/thread/reply", async (req, res) => {
  const comment = req.body.comment;
  Comments.create(comment)
    .then((c) => returnData(c, res))
    .catch((err) => errorHandler(res, 400, err));
});

/*
  Resolve a thread
*/
router.patch("/api/thread/resolve", (req, res) => {
  const thread_id = req.body.thread_id;
  Threads.findByIdAndUpdate(
    thread_id,
    { resolved: true },
    { new: true, runValidators: true }
  )
    .then((t) => returnData(t, res))
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Edit a comment
*/
router.patch("/api/comment", (req, res) => {
  const comment_id = req.body.comment_id;
  const message = req.body.message;
  Comments.findByIdAndUpdate(
    comment_id,
    { message },
    { new: true, runValidators: true }
  )
    .then((comment) => returnData(comment, res))
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Delete a comment
*/
router.delete("/api/comment", (req, res) => {
  const comment_id = req.body.comment_id;
  if (!comment_id) {
    errorHandler(res, 400, { message: "Missing comment_id." });
  }
  Comments.findByIdAndDelete(comment_id)
    .then((c) => returnData(c, res))
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Delete a thread and its comments
*/
router.delete("/api/thread", (req, res) => {
  const thread_id = req.body.thread_id;
  if (!thread_id) {
    errorHandler(res, 400, { message: "Missing thread_id." });
  }
  Threads.findByIdAndDelete(thread_id)
    .then((c) => returnData(c, res))
    .catch((err) => errorHandler(res, 500, err));
  Comments.deleteMany({ thread_id }).exec();
});

module.exports = router;
