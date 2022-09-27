const majors = require("../model/Major.js");
const { returnData, errorHandler } = require("./helperMethods.js");
const { allMajors } = require("../data/majors");


const express = require("express");
const router = express.Router();

router.get("/api/majors/all", (req, res) => {
  majors
    .find({})
    .then((major) => returnData(major, res))
    .catch((err) => errorHandler(res, 500, err));
});

router.get("/api/majors/:major_id", (req, res) => {
  const m_id = req.params.major_id;
  majors
    .findById(m_id)
    .then((major) => returnData(major, res))
    .catch((err) => errorHandler(res, 500, err));
});

router.post("/api/majors", async (req, res) => {
  const major = req.body;
  majors
    .create(major)
    .then((major) => {
      returnData(major, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

module.exports = router;
