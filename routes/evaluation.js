const { returnData, errorHandler } = require("./helperMethods.js");
const evaluation = require("../model/Evaluation.js");
const express = require("express");
const router = express.Router();

//get course evaluations by course number
router.get("/api/evals/:number", (req, res) => {
  const num = req.params.number;
  evaluation
    .findOne({ num })
    .then((review) => returnData(review, res))
    .catch((err) => errorHandler(res, 500, err));
})

module.exports = router;