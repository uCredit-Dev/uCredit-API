const { returnData, errorHandler } = require("./helperMethods.js");
const Threads = require("../model/Thread.js");
const Comments = require("../model/Comment.js");

const express = require("express");
const router = express.Router();

/*
  Returns all threads of a plan with comments populated
  Comments of a thread are sorted by timestamp in ascending order
*/
router.get("/api/comment/getByPlan/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  Threads.find({ plan_id })
    .then((threads) => {
      threads = threads.map(async (t) => {
        t.comments = await Comments.find({ thread_id: t._id })
          .populate("commenter_id", "name")
          .sort({ date: 1 })
          .exec();
      });
      returnData(threads, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Create a new comment
*/
router.post("/api/comment", async (req, res) => {
  const comment = req.body.comment;
  //a new comment
  if (!comment.thread_id) {
    const plan_id = comment.plan_id;
    if (!plan_id) {
      errorHandler(res, 400, { message: "Missing plan_id for a new comment." });
    } else {
      const t = await Threads.create({ plan_id }).exec();
      comment.thread_id = t._id;
    }
  }
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
  Comments.findByIdAndDelete(comment_id)
    .then((c) => returnData(c, res))
    .catch((err) => errorHandler(res, 500, err));
});

module.exports = router;
