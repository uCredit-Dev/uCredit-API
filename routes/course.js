//all routes related to retrieve, add, update, delete courses
const { addSampleUsers } = require("../data/userSamples.js");
const { addSampleDistributions } = require("../data/distributionSamples.js");
const { addSampleCourses } = require("../data/courseSamples.js");
const { returnData, errorHandler } = require("./helperMethods.js");
const {
  updateDistribution,
  requirementCreditUpdate,
  checkCriteriaSatisfied,
} = require("./distributionMethods.ts");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const fineRequirements = require("../model/FineRequirement.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");
const years = require("../model/Year.js");

var ObjectId = require("mongodb").ObjectID;
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

// get courses in a plan by term. provide plan id, year, and term
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
});

// add course, need to provide course info as json object in request body
// year, distribution, and fineReq objects updated
router.post("/api/courses", async (req, res) => {
  const courseBody = req.body;
  await courses
    .create(courseBody)
    .then(async (retrievedCourse) => {
      // find year obj and insert course id to array
      await years
        .findOneAndUpdate(
          {
            $and: [
              { plan_id: retrievedCourse.plan_id },
              { name: retrievedCourse.year },
            ],
          },
          { $push: { courses: retrievedCourse._id } },
          { new: true, runValidators: true }
        )
        .then(async (year) => {
          retrievedCourse.year_id = year._id; // set year_id
          await retrievedCourse.save();
        });
      // update plan's distribution objs
      await addCourseToDistributions(retrievedCourse);

      // return up to date course (because modified in helper method)
      const updatedCourse = await courses.findById(retrievedCourse._id).exec();
      const updatedDists = [];
      for (let d_id of updatedCourse.distribution_ids) {
        let dist = await distributions
          .findById(d_id)
          .populate({ path: "fineReq_ids" })
          .then((dist) => {
            updatedDists.push(dist);
          });
      }
      const resp = {
        ...updatedCourse._doc,
        distributions: updatedDists,
      };
      returnData(resp, res);
    })
    .catch((err) => {
      errorHandler(res, 400, err);
    });
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

// delete a course given course id
// update associated distribution credits
router.delete("/api/courses/:course_id", (req, res) => {
  const c_id = ObjectId(req.params.course_id);
  courses
    .findByIdAndDelete(c_id)
    .then(async (course) => {
      // remove course from distributions
      const updatedDists = await removeCourseFromDistribution(course);

      //delete course id from user's year array
      let query = {};
      query[course.year] = course._id; //e.g. { freshman: id }
      plans.findByIdAndUpdate(course.plan_id, { $pull: query }).exec();
      removeCourseFromYear(course);

      // return deleted course with modified distributions
      const resp = {
        ...course,
        distributions: updatedDists,
      };
      returnData(resp, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

async function addCourseToDistributions(course) {
  const plan = await plans.findById(course.plan_id).exec();
  // process distributions by major
  for (let m_id of plan.major_ids) {
    let distSatisfied = undefined; // store first satisfied distribution
    let distDoubleCount = ["All"];
    // process all distributions of current major
    await distributions
      .find({ plan_id: course.plan_id, major_id: m_id })
      .then(async (distObjs) => {
        for (let distObj of distObjs) {
          // check double_count rules
          // check that course can satisfy distribution
          if (
            (distDoubleCount.includes("All") ||
              distDoubleCount.includes(distObj.name)) &&
            checkCriteriaSatisfied(distObj.criteria, course) &&
            course.credits >= distObj.min_credits_per_course
          ) {
            if (distObj.satisfied) {
              // store satisfied distribution
              if (!distSatisfied) distSatisfied = distObj._id;
            } else {
              // add to any unsatisfied distribution
              await updateDistribution(distObj._id, course._id);
              distDoubleCount = distObj.double_count;
            }
          }
        }
      });
    // if course belongs to no distributions and satisfies a satisfied distribution,
    // add id to course but don't update distribution obj
    await courses.findById(course._id).then((updatedCourse) => {
      if (updatedCourse.distribution_ids.length == 0 && distSatisfied) {
        updatedCourse.distribution_ids.push(distSatisfied);
        updatedCourse.save();
      }
    });
  }
}

async function removeCourseFromDistribution(course) {
  let updatedDists = [];
  // remove course from fineReqs
  for (let f_id of course.fineReq_ids) {
    let fine = await fineRequirements.findById(f_id).exec();
    await requirementCreditUpdate(fine, course, false);
  }
  // remove course from distributions
  for (let id of course.distribution_ids) {
    await distributions
      .findById(id)
      .populate("fineReq_ids")
      .then(async (distribution) => {
        await requirementCreditUpdate(distribution, course, false);
        // determine distribution satisfied with pathing
        if (distribution.planned >= distribution.required_credits) {
          if (distribution.pathing) {
            await processPathing(distribution);
          } else {
            let allFinesSatisfied = await checkAllFines(distribution);
            if (allFinesSatisfied) {
              distribution.satisfied = true;
            } else {
              distribution.satisfied = false;
            }
          }
        }
        await distribution.save();
        updatedDists.push(distribution);
      });
  }
  return updatedDists;
}

async function removeCourseFromYear(course) {
  //delete course id from user's year array
  years.findById(course.year_id).then(async (y) => {
    const yearArr = y.courses;
    const index = yearArr.indexOf(course._id);
    if (index !== -1) {
      yearArr.splice(index, 1);
      await years
        .findByIdAndUpdate(
          course.year_id,
          { courses: yearArr },
          { new: true, runValidators: true }
        )
        .exec();
    }
  });
}

module.exports = router;
