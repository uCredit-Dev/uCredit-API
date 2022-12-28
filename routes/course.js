//all routes related to retrieve, add, update, delete courses
import {
  returnData,
  errorHandler,
  distributionCreditUpdate,
  forbiddenHandler,
  missingHandler,
} from "./helperMethods.js";
import courses from "../model/Course.js";
import distributions from "../model/Distribution.js";
import plans from "../model/Plan.js";
import years from "../model/Year.js";
import { auth } from "../util/token.js";
import express from "express";

const router = express.Router();

//return all courses of the user's plan
router.get("/api/coursesByPlan/:plan_id", auth, async (req, res) => {
  const plan_id = req.params.plan_id;
  if (!plan_id) {
    return missingHandler(res, { plan_id });   
  }
  try {
    // verify that plan belongs to request user
    const plan = await plans.findById(plan_id); 
    if (req.user._id !== plan.user_id) {
      return forbiddenHandler(res);
    }
    // return courses associated with plan
    const retrievedCourses = courses.findByPlanId(plan_id); 
    returnData(retrievedCourses, res); 
  } catch (err) {
    errorHandler(res, 400, err); 
  }
});

//if distribution_id is not found data field would be an empty array
router.get("/api/coursesByDistribution/:distribution_id", auth, async (req, res) => {
  const d_id = req.params.distribution_id;
  if (!d_id) {
    return missingHandler(res, { d_id });   
  }
  // verify that distribution belongs to request user
  try {
    const dist = distributions.findById(d_id); 
    if (req.user._id !== dist.user_id) {
      return forbiddenHandler(res);
    }
    // return courses associated with distribution
    const retrievedCourses = await courses.findByDistributionId(d_id); 
    returnData(retrievedCourses, res); 
  } catch (err) {
    errorHandler(res, 400, err); 
  }
});

router.get("/api/courses/:course_id", (req, res) => {
  const c_id = req.params.course_id;
  if (!c_id) {
    return missingHandler(res, { c_id });   
  }
  try {
    const course = courses.findById(c_id); 
    returnData(course, res); 
  } catch (err) {
    errorHandler(res, 400, err); 
  }
});

// get courses in a plan by term. provide plan id, year, and term
router.get("/api/coursesByTerm/:plan_id", auth, (req, res) => {
  const plan_id = req.params.plan_id;
  const year = req.query.year;
  const term = req.query.term;
  if (!plan_id || !year || term) {
    return missingHandler(res, { plan_id, year, term });   
  }
  try {
    const retrievedYear = 
      years
        .findOne({ plan_id, name: year })
        .populate({ path: "courses", match: term }); 
    if (req.user._id !== retrievedYear.user_id) {
      forbiddenHandler(res);
    } else {
      returnData(retrievedYear.courses, res);
    }
  } catch (err) {
    errorHandler(res, 400, err); 
  }
});

//add course, need to provide course info as json object in request body
//distribution field is also updated
router.post("/api/courses", auth, async (req, res) => {
  const course = req.body;
  if (!course) {
    return missingHandler(res, { course });   
  }
  if (course.user_id !== req.user._id) {
    return forbiddenHandler(res);
  }
  try {
    // check that course distributions belong to plan 
    const plan = plans.findById(course.plan_id); 
    course.distribution_ids.forEach((id) => {
      if (!plan.distribution_ids.includes(id))
        errorHandler(res, 400, {
          message: "Invalid combination of plan_id and distribution_ids.",
        });
    });
    // create course and update distributiosn 
    const retrievedCourse = await courses.create(course); 
    for (let id of retrievedCourse.distribution_ids) {
      const distribution = await distributions.findByIdAndUpdate(
        id,
        { $push: { courses: retrievedCourse._id } },
        { new: true, runValidators: true }
      );
      await distributionCreditUpdate(distribution, retrievedCourse, true);
    }
    // update year with new course 
    let query = {};
    query[retrievedCourse.year] = retrievedCourse._id; //e.g. { freshman: id }
    await plans.findByIdAndUpdate(retrievedCourse.plan_id, { $push: query });
    await years.findByIdAndUpdate(retrievedCourse.year_id, {
      $push: { courses: retrievedCourse._id },
    }); 
    returnData(retrievedCourse, res);
  } catch (err) {
    errorHandler(res, 400, err)
  }
});

//switch the "taken" status of a course, need to provide status in req body
//update distribution credits accordingly
router.patch("/api/courses/changeStatus/:course_id", auth, async (req, res) => {
  const c_id = req.params.course_id;
  const taken = req.body.taken;
  if (!c_id ) {
    return missingHandler(res, { c_id });   
  }
  // verify that course belongs to user
  const oldCourse = await courses.findById(c_id);
  if (req.user._id !== oldCourse.user_id) {
    return forbiddenHandler(res);
  }
  if (typeof taken !== "boolean") {
    return errorHandler(res, 400, { message: "Invalid taken status." });
  }
  try {
    const course = await courses.findByIdAndUpdate(c_id, { taken }, { new: true, runValidators: true }); 
    course.distribution_ids.forEach(async (id) => {
      const distribution = await distributions.findById(id); 
      if (taken) {
        distribution.current += course.credits;
      } else {
        distribution.current -= course.credits;
      }
      distribution.save();
    });
    returnData(course, res);
  } catch (err) {
    errorHandler(res, 404, err);
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
  // verify that course belongs to user
  const course = await courses.findById(c_id); 
  if (req.user._id !== course.user_id) {
    return forbiddenHandler(res);
  }
  try {
    // remove course from old year
    await years
    .findByIdAndUpdate(
      oldYear_id,
      { $pull: { courses: c_id } },
      { new: true, runValidators: true }
    ); 
    // add course to new year
    const y = await years
    .findByIdAndUpdate(
      newYear_id,
      { $push: { courses: c_id } },
      { new: true, runValidators: true }
    ); 
    // update course document with new year
    const c = await courses
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
    ); 
    returnData(c, res); 
  } catch (err) {
    errorHandler(res, 500, err)
  }
});

//delete a course given course id
//update associated distribution credits
router.delete("/api/courses/:course_id", auth, async (req, res) => {
  const c_id = req.params.course_id;
  if (!c_id) {
    return missingHandler(res, { c_id }); 
  }
  // verify that course belongs to req user
  const course = await courses.findById(c_id);   
  if (req.user._id !== course.user_id) {
    return forbiddenHandler(res);
  }
  try {
    // delete course and update distributions
    const course = await courses.findByIdAndDelete(c_id); 
    course.distribution_ids.forEach(async (id) => {
      const distribution = await distributions
        .findByIdAndUpdate(
          id,
          { $pull: { courses: c_id } },
          { new: true, runValidators: true }
        ); 
      distributionCreditUpdate(distribution, course, false)
    });    
  } catch (err) {
    errorHandler(res, 500, err)
  }
  try {
    //delete course id to user's year array
    let query = {};
    query[course.year] = course._id; //e.g. { freshman: id }
    await plans.findByIdAndUpdate(course.plan_id, { $pull: query });
    const y = years.findById(course.year_id); 
    const yearArr = y.courses;
    const index = yearArr.indexOf(course._id);
    if (index !== -1) {
      yearArr.splice(index, 1);
      await years
        .findByIdAndUpdate(
          course.year_id,
          { courses: yearArr },
          { runValidators: true }
        ); 
    }
    returnData(course, res);
  } catch (err) {
    errorHandler(res, 404, err)
  }
});

export default router;
