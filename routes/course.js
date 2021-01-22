//all routes related to retrieve, update, delete courses
const { addSampleUsers } = require("../data/userSamples.js");
const { addSampleDistributions } = require("../data/distributionSamples.js");
const { addSampleCourses } = require("../data/courseSamples.js");
const { returnData, errorHandler } = require("./helperMethods.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const users = require("../model/User.js");

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/api/addSamples", (req, res) => {
  addSampleUsers(users).catch((err) => errorHandler(res, 500, err));
  addSampleDistributions(distributions).catch((err) =>
    errorHandler(res, 500, err)
  );
  addSampleCourses(courses).catch((err) => errorHandler(res, 500, err));
});

//if distribution_id is not found data field would be an empty array
router.get("/api/courses/distribution/:distribution_id", (req, res) => {
  const d_id = req.params.distribution_id;
  courses
    .findByDistributionId(d_id)
    .exec()
    .then((courses) => returnData(courses, res))
    .catch((err) => errorHandler(res, 500, err));
});

router.get("/api/courses/:course_id", (req, res) => {
  const c_id = req.params.course_id;
  courses
    .findById(c_id)
    .exec()
    .then((course) => returnData(course, res))
    .catch((err) => errorHandler(res, 500, err));
});

//get courses by term. provide user id, year, and term
router.get("/api/courses", (req, res) => {
  const user_id = req.query.user_id;
  const year = req.query.year;
  const term = req.query.term;
  users
    .findCoursesByTerm(user_id, year, term)
    .then((courses) => returnData(courses, res))
    .catch((err) => errorHandler(res, 500, err));
});

//add course, need to provide course info as json object in request body
router.post("/api/courses", async (req, res) => {
  const course = req.body;
  const user = await users
    .findById(course.user_id)
    .exec()
    .then((user) => {
      course.distribution_ids.forEach((id) => {
        if (!user.distributions.includes(id)) {
          errorHandler(res, 400, {
            message: "invalid combination of user_id and distribution_ids.",
          });
        }
      });
    })
    .catch((err) => errorHandler(res, 500, err));
  courses
    .create(course)
    .then((course) => returnData(course, res))
    .catch((err) => errorHandler(res, 400, err));
});

//switch the "taken" status of a course, need to provide status in req body
router.patch("/api/courses/:course_id", (req, res) => {
  const c_id = req.params.course_id;
  const taken = req.body.taken;
  if (typeof taken !== "boolean") {
    errorHandler(res, 400, { message: "Invalid taken status." });
  } else {
    courses
      .findByIdAndUpdate(c_id, { taken }, { new: true, runValidators: true })
      .exec()
      .then((course) => returnData(course, res))
      .catch((err) => errorHandler(res, 404, err));
  }
});

//need to check
router.delete("/api/courses/:course_id", (req, res) => {
  const c_id = req.params.course_id;
  courses
    .findByIdAndDelete(c_id)
    .exec()
    .then((course) => returnData(course, res))
    .catch((err) => errorHandler(res, 500, err));
});

module.exports = router;
