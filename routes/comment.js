const { returnData, errorHandler } = require("./helperMethods.js");
const comment = require("../model/Comment.js");

const express = require("express");
const router = express.Router();

/*
  Returns the comments of a plan with all child comments populated
*/
router.get("/api/comment/getByPlan/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  comment
    .find({ parent_id: plan_id })
    .populate("child_id")
    .then(async (comments) => {
      await processResponse(comments);
      returnData(comments, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

const processResponse = async (comments) => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].child_id) {
      const resp = await comments[i].child_id.populate("user_id");
      if (!resp) {
        errorHandler(res, 500, new Error("Issue with populating"));
      }
      comments[i] = await processResponse([resp])[0];
    }
  }
  return comments;
};

/*
Creates a new comment
*/
router.post("/api/comment/postComment", (req, res) => {
  const newComment = req.body.comment;
  comment
    .create(newComment)
    .then(async (resp) => {
      if (!resp.parent_type === "comment") {
        await comment.findByIdAndUpdate(resp.parent_id, { child_id: resp._id });
      }
      returnData(resp, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

/*
  Updates a comment
*/
router.patch("/api/comemnt/updateComment", (req, res) => {
  const comment_id = req.body.comment_id;
  const content = req.body.content;
  comment
    .findByIdAndUpdate(
      comment_id,
      { comment: content },
      { new: true, runValidators: true }
    )
    .then((comment) => returnData(comment, res))
    .catch((err) => errorHandler(res, 500, err));
});

/*
Deletes a comment
*/
router.delete("/api/comment/deleteComment", (req, res) => {
  const comment_id = req.body.comment_id;
  const resp = await deleteComment(comment_id);
  returnData(resp, res)
});

const deleteComment = async(comment_id) => {
  const resp = comment.findByIdAndDelete(comment_id);
  if (!resp) {
    errorHandler(res, 500, new Error("Comment or comment child not found"));
  }
  if (resp.child_id) {
    await deleteComment(resp.child_id);
  }
  return resp;
};

module.exports = router;
