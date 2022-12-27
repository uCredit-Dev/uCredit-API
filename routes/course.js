//all routes related to retrieve, add, update, delete courses
import {
  returnData,
  errorHandler,
  distributionCreditUpdate,
  forbiddenHandler,
} from "./helperMethods.js";
import courses from "../model/Course.js";
import distributions from "../model/Distribution.js";
import plans from "../model/Plan.js";
import years from "../model/Year.js";
import { auth } from "../util/token.js";
import express from "express";

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
router.get("/api/coursesByPlan/:plan_id", auth, (req, res) => {
  const plan_id = req.params.plan_id;
  // verify that plan belongs to request user
  plans.findById(plan_id).then((plan) => {
    if (req.user._id !== plan.user_id) {
      return forbiddenHandler(res);
    }
  });
  // return courses associated with plan
  courses
    .findByPlanId(plan_id)
    .then((retrievedCourses) => returnData(retrievedCourses, res))
    .catch((err) => errorHandler(res, 400, err));
});

//if distribution_id is not found data field would be an empty array
router.get("/api/coursesByDistribution/:distribution_id", auth, (req, res) => {
  const d_id = req.params.distribution_id;
  // verify that distribution belongs to request user
  distributions.findById(d_id).then((dist) => {
    if (req.user._id !== dist.user_id) {
      return forbiddenHandler(res);
    }
  });
  // return courses associated with distribution
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

// get courses in a plan by term. provide plan id, year, and term
router.get("/api/coursesByTerm/:plan_id", auth, (req, res) => {
  const plan_id = req.params.plan_id;
  const year = req.query.year;
  const term = req.query.term;
  years
    .findOne({ plan_id, name: year })
    .populate({ path: "courses", match: term })
    .then((retrievedYear) => {
      // verify that year belongs to request user
      if (req.user._id !== retrievedYear.user_id) {
        forbiddenHandler(res);
      } else {
        returnData(retrievedYear.courses, res);
      }
    })
    .catch((err) => errorHandler(res, 400, err));
});

//add course, need to provide course info as json object in request body
//distribution field is also updated
router.post("/api/courses", auth, async (req, res) => {
  const course = req.body;
  if (course.user_id !== req.user._id) {
    return forbiddenHandler(res);
  }
  await plans
    .findById(course.plan_id)
    .then((plan) => {
      course.distribution_ids.forEach((id) => {
        if (!plan.distribution_ids.includes(id))
          errorHandler(res, 400, {
            message: "Invalid combination of plan_id and distribution_ids.",
          });
      });
    })
    .catch((err) => {
      errorHandler(res, 500, err);
    });
  courses
    .create(course)
    .then(async (retrievedCourse) => {
      for (let id of retrievedCourse.distribution_ids) {
        const distribution = await distributions.findByIdAndUpdate(
          id,
          { $push: { courses: retrievedCourse._id } },
          { new: true, runValidators: true }
        );
        await distributionCreditUpdate(distribution, retrievedCourse, true);
      }

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
router.patch("/api/courses/changeStatus/:course_id", auth, async (req, res) => {
  const c_id = req.params.course_id;
  const taken = req.body.taken;
  // verify that course belongs to user

  const course = await courses.findById(c_id);
  courses.findById(c_id).then((course) => {
    if (req.user._id !== course.user_id) {
      return forbiddenHandler(res);
    }
  });
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
        errorHandler(res, 404, err);
      });
  }
});

// Updates course
router.patch("/api/courses/dragged", auth, (req, res) => {
  const c_id = req.body.courseId;
  const newYear_id = req.body.newYear;
  const oldYear_id = req.body.oldYear;
  const newTerm = req.body.newTerm;
  // verify that course belongs to user
  courses.findById(c_id).then((course) => {
    if (req.user._id !== course.user_id) {
      return forbiddenHandler(res);
    }
  });
  // raise error if required param is undefined
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
    // remove course from old year
    years
      .findByIdAndUpdate(
        oldYear_id,
        { $pull: { courses: c_id } },
        { new: true, runValidators: true }
      )
      .catch((err) => errorHandler(res, 500, err));
    // add course to new year
    years
      .findByIdAndUpdate(
        newYear_id,
        { $push: { courses: c_id } },
        { new: true, runValidators: true }
      )
      .then((y) => {
        // update course document with new year
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
router.delete("/api/courses/:course_id", auth, (req, res) => {
  const c_id = req.params.course_id;
  // verify that course belongs to req user
  courses.findById(c_id).then((course) => {
    if (req.user._id !== course.user_id) {
      return forbiddenHandler(res);
    }
  });
  // delete course and update distributions
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

export default router;
