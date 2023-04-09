//routes related to Year CRUD
import {
  returnData,
  errorHandler,
  distributionCreditUpdate,
  forbiddenHandler,
  missingHandler,
} from "./helperMethods.js";
import { auth } from "../util/token.js";
import Courses from "../model/Course.js";
import Distributions from "../model/Distribution.js";
import Plans from "../model/Plan.js";
import express from "express";
import { Year } from "../model_ts/Year";
import { Distribution } from "../model_ts/Distribution.js";
import { Course } from "../model_ts/Course";

const router = express.Router();

//get years by plan id
router.get("/api/years/:plan_id", auth, async (req, res) => {
  const plan_id = req.params.plan_id;
  try {
    const plan = await Plans.findById(plan_id).populate("year_ids").exec();
    if (plan === null) {
      return forbiddenHandler(res);
    }
    plan.populate("year_ids.courses", () => {
      returnData(plan.year_ids, res);
    });
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//create a new year and add year id to the end of plan's year array
router.post("/api/years", auth, async (req: any, res) => { // todo: change type of req
  const { name, plan_id, user_id, year } = req.body; 
  if (!name || !plan_id || !user_id || isNaN(year)) {
    return missingHandler(res, { name, plan_id, user_id, year })
  }
  if (user_id !== req.user._id) {
    return forbiddenHandler(res);
  }
  try {
    const newYear = await Year.build({
      name: name,
      courses: [],
      plan_id: plan_id,
      user_id: user_id,
      year: year
    });
    await Plans
      .findByIdAndUpdate(
        newYear.plan_id,
        { $push: { year_ids: newYear._id } },
        { new: true, runValidators: true }
      )
      .exec();
    returnData(newYear, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//change the order of the year ids in plan object
router.patch("/api/years/changeOrder", auth, async (req: any, res) => { // todo: update req type
  const year_ids = req.body.year_ids;
  const plan_id = req.body.plan_id;
  if (!year_ids || !plan_id) {
    return missingHandler(res, { year_ids, plan_id });
  }
  try {
    // check that plan belongs to user
    let plan = await Plans.findById(plan_id).exec();
    if (plan === null) {
      return forbiddenHandler(res);
    }
    if (req.user._id !== plan.user_id) {
      return forbiddenHandler(res);
    }
    // update plan
    plan = await Plans
      .findByIdAndUpdate(
        plan_id,
        { year_ids: year_ids },
        { new: true, runValidators: true }
      )
      .exec();
    returnData(plan, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//update the name of the year
router.patch("/api/years/updateName", auth, async (req: any, res) => {
  const name = req.body.name;
  const year_id = req.body.year_id;
  if (!name || !year_id) {
    return missingHandler(res, { name, year_id });
  }
  try {
    // check that year belongs to user
    const year = await Year.findById(year_id).exec();
    if (year === null || req.user._id !== year.user_id) {
      return forbiddenHandler(res);
    }
    year.name = name;
    await year.save();
    await Courses.updateMany({ year_id }, { year: name }).exec();
    returnData(year, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//update the year
router.patch("/api/years/updateYear", auth, async (req: any, res) => {
  const year = req.body.year;
  const year_id = req.body.year_id;
  if (!year || !year_id) {
    return missingHandler(res, { year, year_id });
  }
  try {
    // check that year belongs to user
    const retrievedYear = await Year.findById(year_id).populate("courses").exec();
    if (retrievedYear === null || req.user._id !== retrievedYear.user_id) {
      return forbiddenHandler(res);
    }
    retrievedYear.year = year;
    await retrievedYear.save();
    returnData(retrievedYear, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//delete plan and its associated courses, remove year_id from the associated plan document
router.delete("/api/years/:year_id", auth, async (req: any, res) => {
  const year_id = req.params.year_id;
  if (!year_id || year_id.length < 2) {
    return errorHandler(res, 400, "must specify a valid year_id");
  }
  // check that year belongs to user
  try {
    let year = await Year.findById(year_id).exec();
    if (year === null || req.user._id !== year.user_id) {
      return forbiddenHandler(res);
    }
    // delete the year
    year = await Year.findByIdAndDelete(year_id).exec();
    if (year === null) {
      return forbiddenHandler(res);
    }

    year.courses.forEach(async (c_id) => {
      const course = await Courses.findByIdAndDelete(c_id).exec();
      if (course === null) {
        return forbiddenHandler(res);
      }
      course.distribution_ids.forEach(async (id) => {
        const distribution = await Distributions
          .findByIdAndUpdate(
            id,
            { $pull: { courses: c_id } },
            { new: true, runValidators: true }
          )
          .exec();
        if (distribution === null) {
          return forbiddenHandler(res);
        }
        const distributionDoc = await Distribution.create(distribution);
        const courseDoc = await Course.create(course);
        await distributionCreditUpdate(distributionDoc, courseDoc, false);
      });
    });
    let plan = await Plans.findById(year.plan_id).exec();
    if (plan === null || plan.year_ids === null) {
      return forbiddenHandler(res);
    }
    plan.year_ids = plan.year_ids.filter((y) => year && y != year._id); //remove year_id from plan
    if (year.year) {
      //not a preUniversity year, delete last year
      plan.year_ids.pop();
    } else {
      plan.year_ids.shift();
    }
    await plan.save();
    returnData(year, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

router.post("/api/spc-login", (req, res) => {
  const pw = req.body.pw;
  console.log(pw);
  if (pw === "5cf37e783327fe0ca9fc5972ae7ed331") {
    returnData("ok", res);
  } else {
    errorHandler(res, 400, "invalid user");
  }
});

export default router;
