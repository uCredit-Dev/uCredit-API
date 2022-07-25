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

router.post("/api/majors", async (req, res) => {
  const major = req.body;
  majors
    .create(major)
    .then((major) => {
      returnData(major, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

// Once we add all majors to the majors.js file, we can use this code to add all majors to production DB
router.post("/api/majors/all", async (req, res) => {
  for (let m of allMajors) {
    await majors
    .create(m)
    .catch((err) => errorHandler(res, 400, err));
  }
});

module.exports = router;
