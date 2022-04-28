//all routes related to retrieve, add, update, delete courses
const { addSampleUsers } = require("../data/userSamples.js");
const { addSampleDistributions } = require("../data/distributionSamples.js");
const { addSampleCourses } = require("../data/courseSamples.js");
const {
  returnData,
  errorHandler,
  distributionCreditUpdate,
} = require("./helperMethods.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");
const years = require("../model/Year.js");

const express = require("express");
const router = express.Router();
/*
router.get("/api/addSamples", (req, res) => {
  addSampleUsers(users).catch((err) => errorHandler(res, 500, err));
  addSampleDistributions(distributions).catch((err) =>
    errorHandler(res, 500, err)
  );
  addSampleCourses(courses).catch((err) => errorHandler(res, 500, err));
});*/

//return all courses of the user's plan
router.get("/api/coursesByPlan/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  courses
    .findByPlanId(plan_id)
    .then((retrievedCourses) => returnData(retrievedCourses, res))
    .catch((err) => errorHandler(res, 400, err));
});

//if distribution_id is not found data field would be an empty array
router.get("/api/coursesByDistribution/:distribution_id", (req, res) => {
  const d_id = req.params.distribution_id;
  courses
    .findByDistributionId(d_id)
    .then((retrievedCourses) => returnData(retrievedCourses, res))
    .catch((err) => errorHandler(res, 400, err));
});

router.get("/api/courses/:course_id", (req, res) => {
  const c_id = req.params.course_id;
  courses
    .findById(c_id)
    .then((course) => returnData(course, res))
    .catch((err) => errorHandler(res, 400, err));
});

//get courses in a plan by term. provide plan id, year, and term
router.get("/api/coursesByTerm/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  const year = req.query.year;
  const term = req.query.term;
  years
    .findOne({ plan_id, name: year })
    .populate({ path: "courses", match: term })
    .then((retrievedYear) => {
      returnData(retrievedYear.courses, res);
    })
    .catch((err) => errorHandler(res, 400, err));
  // plans
  //   .findCoursesByTerm(plan_id, year, term)
  //   .then((courses) => returnData(courses, res))
  //   .catch((err) => errorHandler(res, 400, err));
});

//add course, need to provide course info as json object in request body
//distribution field is also updated
router.post("/api/courses", async (req, res) => {
  const course = req.body;
  //console.log("course is ", course);
  await plans
    .findById(course.plan_id)
    .then((plan) => {
      //console.log(plan);
      course.distribution_ids.forEach((id) => {
        if (!plan.distribution_ids.includes(id)) {
          errorHandler(res, 400, {
            message: "Invalid combination of plan_id and distribution_ids.",
          });
        }
      });
    })
    .catch((err) => {
      //console.log("here", err);
      errorHandler(res, 500, err);
    });
  courses
    .create(course)
    .then((retrievedCourse) => {
      retrievedCourse.distribution_ids.forEach((id) => {
        distributions
          .findByIdAndUpdate(
            id,
            { $push: { courses: retrievedCourse._id } },
            { new: true, runValidators: true }
          )
          .then((distribution) =>
            distributionCreditUpdate(distribution, retrievedCourse, true)
          )
          .catch((err) => {
            console.log("or here", err);
            errorHandler(res, 500, err);
          });
      });
      //add course id to user plan's year array
      let query = {};
      query[retrievedCourse.year] = retrievedCourse._id; //e.g. { freshman: id }
      plans.findByIdAndUpdate(retrievedCourse.plan_id, { $push: query }).exec();
      years
        .findByIdAndUpdate(retrievedCourse.year_id, {
          $push: { courses: retrievedCourse._id },
        })
        .exec();
      returnData(retrievedCourse, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

//switch the "taken" status of a course, need to provide status in req body
//update distribution credits accordingly
router.patch("/api/courses/changeStatus/:course_id", (req, res) => {
  const c_id = req.params.course_id;
  const taken = req.body.taken;
  if (typeof taken !== "boolean") {
    errorHandler(res, 400, { message: "Invalid taken status." });
  } else {
    courses
      .findByIdAndUpdate(c_id, { taken }, { new: true, runValidators: true })
      .then((course) => {
        course.distribution_ids.forEach((id) => {
          distributions.findById(id).then((distribution) => {
            if (taken) {
              distribution.current += course.credits;
            } else {
              distribution.current -= course.credits;
            }
            distribution.save();
          });
        });
        returnData(course, res);
      })
      .catch((err) => {
        console.log("here is error\n" + err);
        errorHandler(res, 404, err);
      });
  }
});

// Updates course
router.patch("/api/courses/dragged", (req, res) => {
  const c_id = req.body.courseId;
  const newYear_id = req.body.newYear;
  const oldYear_id = req.body.oldYear;
  const newTerm = req.body.newTerm;
  if (!(newYear_id || oldYear_id || c_id || newTerm)) {
    errorHandler(res, 400, {
      message:
        "One of these is undefined: new year id is " +
        newYear_id +
        ", old year id is " +
        oldYear_id +
        ", courseId is " +
        c_id +
        ", new term is " +
        newTerm,
    });
  } else {
    years
      .findByIdAndUpdate(
        oldYear_id,
        { $pull: { courses: c_id } },
        { new: true, runValidators: true }
      )
      .then(() => console.log("course_id deleted from old year."))
      .catch((err) => errorHandler(res, 500, err));

    years
      .findByIdAndUpdate(
        newYear_id,
        { $push: { courses: c_id } },
        { new: true, runValidators: true }
      )
      .then((y) => {
        console.log("course_id added to new year.");
        courses
          .findByIdAndUpdate(
            c_id,
            {
              year: y.name,
              year_id: y._id,
              term: newTerm.toLowerCase(),
              version:
                newTerm + " " + (newTerm === "Fall" ? y.year : y.year + 1),
            },
            { new: true, runValidators: true }
          )
          .then((c) => returnData(c, res))
          .catch((err) => errorHandler(res, 500, err));
      })
      .catch((err) => errorHandler(res, 500, err));
  }
});

//change course's distribution, need to provide distribution_ids in req body
//!!!does not update credit for the distributions!!! need to consider whether the user can change or not
/*
router.patch("/api/courses/changeDistribution/:course_id"),
  (req, res) => {
    const c_id = req.params.course_id;
    const distribution_ids = req.body.distribution;
    if (typeof distribution !== "array") {
      errorHandler(res, 400, { message: "Invalid distribution." });
    } else {
      courses
        .findByIdAndUpdate(
          c_id,
          { distribution_ids },
          { new: true, runValidators: true }
        )
        .then((course) => returnData(course, res))
        .catch((err) => errorHandler(res, 404, err));
    }
  };
*/

//delete a course given course id
//update associated distribution credits
router.delete("/api/courses/:course_id", (req, res) => {
  const c_id = req.params.course_id;
  courses
    .findByIdAndDelete(c_id)
    .then((course) => {
      course.distribution_ids.forEach((id) => {
        distributions
          .findByIdAndUpdate(
            id,
            { $pull: { courses: c_id } },
            { new: true, runValidators: true }
          )
          .then((distribution) =>
            distributionCreditUpdate(distribution, course, false)
          )
          .catch((err) => errorHandler(res, 500, err));
      });
      //delete course id to user's year array
      let query = {};
      query[course.year] = course._id; //e.g. { freshman: id }
      plans.findByIdAndUpdate(course.plan_id, { $pull: query }).exec();
      years
        .findById(course.year_id)
        .then((y) => {
          const yearArr = y.courses;
          const index = yearArr.indexOf(course._id);
          if (index !== -1) {
            yearArr.splice(index, 1);
            years
              .findByIdAndUpdate(
                course.year_id,
                { courses: yearArr },
                { new: true, runValidators: true }
              )
              .exec();
          }
        })
        .catch((err) => errorHandler(res, 404, err));
      returnData(course, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

module.exports = router;
