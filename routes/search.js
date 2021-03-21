//routes to handle search requests
const express = require("express");
const router = express.Router();
const { returnData, errorHandler } = require("./helperMethods.js");
const SISCourses = require("../model/SISCourse.js");

router.get("/api/search/:query", (req, res) => {
  const query = req.params.query;
  SISCourses.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { number: { $regex: query, $options: "i" } },
    ],
  })
    .then((match) => returnData(match, res))
    .catch((err) => errorHandler(res, 500, err));
});

module.exports = router;
