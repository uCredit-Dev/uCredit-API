//all routes related to retrieve, add, update, delete courses
import {
  returnData,
  errorHandler,
  distributionCreditUpdate,
  forbiddenHandler,
  missingHandler,
  checkDestValid
} from "./helperMethods.js";
import Courses from "../model/Course.js";
import Distributions from "../model/Distribution.js";
import Plans from "../model/Plan.js";
import Years from "../model/Year.js";
import SISCV from "../model/SISCourseV.js"; 
import { auth } from "../util/token.js";
import express from "express";

const router = express.Router();

//return all SIS course versions of the user's plan
router.get("/api/coursesByPlan/:plan_id", auth, async (req, res) => {
  const plan_id = req.params.plan_id;
  // verify that plan belongs to request user 
  try {
    const plan = await Plans.findById(plan_id).exec();
    if (req.user._id !== plan.user_id) {
      return forbiddenHandler(res);
    }
    // return courses associated with plan 
    const data = [];
    const retrievedCourses = await Courses.findByPlanId(plan_id); 
    for (let course of retrievedCourses) {
      // for every 'user course', get SIS version of it 
      const sisCourse = await SISCV.findOne({ number: course.number, title: course.title }); 
      // could be undefined if placeholder course 
      if (sisCourse) data.push(sisCourse);
    }
    returnData(data, res);
  } catch (err) {
    errorHandler(res, 500, err.message); 
  }
});

//if distribution_id is not found data field would be an empty array
router.get("/api/coursesByDistribution/:distribution_id", auth, async (req, res) => {
  const d_id = req.params.distribution_id;
  // verify that distribution belongs to request user
  try {
    const dist = await Distributions.findById(d_id).exec();
    if (req.user._id !== dist.user_id) {
      return forbiddenHandler(res);
    }
    // return courses associated with distribution
    const retrievedCourses = await Courses.findByDistributionId(d_id).exec();
    returnData(retrievedCourses, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

router.get("/api/courses/:course_id", async (req, res) => {
  const c_id = req.params.course_id;
  try {
    const course = await Courses.findById(c_id).exec();
    if (!course) {
      return errorHandler(res, 404, { message: "Course not found" }); 
    } 
    returnData(course, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

// get courses in a plan by term. provide plan id, year, and term
router.get("/api/coursesByTerm/:plan_id", auth, async (req, res) => {
  const plan_id = req.params.plan_id;
  const year = req.query.year;
  const term = req.query.term;
  if (!plan_id || !year || !term) {
    return missingHandler(res, { plan_id, year, term });
  }
  try {
    const retrievedYear = await Years
      .findOne({ plan_id, name: year })
      .populate({ path: "courses", match: { term } })
      .exec();
    if (req.user._id !== retrievedYear.user_id) {
      return forbiddenHandler(res);
    } 
    returnData(retrievedYear.courses, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//add course, need to provide course info as json object in request body
//distribution field is also updated
router.post("/api/courses", auth, async (req, res) => {
  const course = req.body;
  if (!course || Object.keys(course).length == 0) {
    return missingHandler(res, { course });
  }
  if (course.user_id !== req.user._id) {
    return forbiddenHandler(res);
  }
  try {
    // check that course distributions belong to plan
    const plan = await Plans.findById(course.plan_id).exec();
    course.distribution_ids.forEach((id) => {
      if (!plan.distribution_ids.includes(id))
        errorHandler(res, 400, {
          message: "Invalid combination of plan_id and distribution_ids.",
        });
    });
    // create course and update distributiosn
    const retrievedCourse = await Courses.create(course);
    for (let id of retrievedCourse.distribution_ids) {
      const distribution = await Distributions
        .findByIdAndUpdate(
          id,
          { $push: { courses: retrievedCourse._id } },
          { new: true, runValidators: true }
        )
        .exec();
      await distributionCreditUpdate(distribution, retrievedCourse, true);
    }
    // update year with new course
    await Years
      .findByIdAndUpdate(retrievedCourse.year_id, {
        $push: { courses: retrievedCourse._id },
      })
      .exec();
    returnData(retrievedCourse, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//switch the "taken" status of a course, need to provide status in req body
//update distribution credits accordingly
router.patch("/api/courses/changeStatus/:course_id", auth, async (req, res) => {
  const c_id = req.params.course_id;
  const taken = req.body.taken;
  if (typeof taken !== "boolean") {
    return errorHandler(res, 400, { message: "Invalid taken status." });
  }
  try {
    // verify that course belongs to user
    const oldCourse = await Courses.findById(c_id);
    if (!oldCourse) {
      return errorHandler(res, 404, "Course not found."); 
    } else if (req.user._id !== oldCourse.user_id) {
      return forbiddenHandler(res);
    }
    const course = await Courses
      .findByIdAndUpdate(c_id, { taken }, { new: true, runValidators: true })
      .exec();
    for (let id of course.distribution_ids) {
      const distribution = await Distributions.findById(id).exec();
      if (taken) {
        distribution.current += course.credits;
      } else {
        distribution.current -= course.credits;
      }
      await distribution.save();
    }
    returnData(course, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

// Updates course
router.patch("/api/courses/dragged", auth, async (req, res) => {
  const c_id = req.body.courseId;
  const newYear_id = req.body.newYear;
  const oldYear_id = req.body.oldYear;
  const newTerm = req.body.newTerm;
  // raise error if required param is undefined
  if (!newYear_id || !oldYear_id || !c_id || !newTerm) {
    return missingHandler(res, { newYear_id, oldYear_id, c_id, newTerm });
  }
  try {
    // verify that course belongs to user
    const course = await Courses.findById(c_id).exec(); 
    if (!course) {
      return errorHandler(res, 404, "course not found"); 
    } else if (course.user_id !== req.user._id) {
      return forbiddenHandler(res);
    } else {
      const sisCourses = await SISCV.find({ number: course.number, title: course.title }).exec(); 
      // check if course is held at new term!
      if (!checkDestValid(sisCourses, course, newTerm)) {
        return errorHandler(res, 400, { message: "no course this semester" }); 
      }
      // remove course from old year 
      await Years
        .findByIdAndUpdate(
          oldYear_id,
          { $pull: { courses: c_id } },
          { new: true, runValidators: true }
        ).exec(); 
      // add course to new year
      const year = await Years
        .findByIdAndUpdate(
          newYear_id,
          { $push: { courses: c_id } },
          { new: true, runValidators: true }
        ).exec(); 
      const updated = await Courses
        .findByIdAndUpdate(
          c_id,
          {
            year: year.name,
            year_id: year._id,
            term: newTerm.toLowerCase(),
            version:
              newTerm + " " + (newTerm === "Fall" ? year.year : year.year + 1),
          },
          { new: true, runValidators: true }
        ).exec(); 
      returnData(updated, res);
    }
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//delete a course given course id
//update associated distribution credits
router.delete("/api/courses/:course_id", auth, async (req, res) => {
  const c_id = req.params.course_id;
  try {
    // verify that course belongs to req user
    const course = await Courses.findById(c_id).exec();
    if (!course) {
      return errorHandler(res, 404, "Course not found."); 
    } else if (req.user._id !== course.user_id) {
      return forbiddenHandler(res);
    }
    // delete course and update distributions
    await Courses.findByIdAndDelete(c_id).exec();
    await Years
      .findByIdAndUpdate(
        course.year_id,
        { $pull: { courses: course._id }},
        { runValidators: true }
      )
      .exec();
    for (let id of course.distribution_ids) {
      const distribution = await Distributions
        .findByIdAndUpdate(
          id,
          { $pull: { courses: c_id } },
          { new: true, runValidators: true }
        )
        .exec();
      await distributionCreditUpdate(distribution, course, false);
    }
    returnData(course, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
