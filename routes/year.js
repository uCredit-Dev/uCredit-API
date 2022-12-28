//routes related to Year CRUD
import {
  returnData,
  errorHandler,
  distributionCreditUpdate,
  forbiddenHandler,
  missingHandler,
} from "./helperMethods.js";
import { auth } from "../util/token.js";
import courses from "../model/Course.js";
import distributions from "../model/Distribution.js";
import plans from "../model/Plan.js";
import years from "../model/Year.js";
import express from "express";

const router = express.Router();

//get years by plan id
router.get("/api/years/:plan_id", auth, async (req, res) => {
  const plan_id = req.params.plan_id;
  if (!plan_id) {
    return missingHandler(res, { plan_id });
  }
  const plan = await plans.findById(plan_id).populate("year_ids").exec();
  if (req.user._id !== plan.user_id) {
    return forbiddenHandler(res);
  }
  try {
    plan.populate("year_ids.courses", () => {
      returnData(plan.year_ids, res);
    });
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//create a new year and add year id to the end of plan's year array
router.post("/api/years", auth, async (req, res) => {
  let newYear = {
    name: req.body.name,
    plan_id: req.body.plan_id,
    user_id: req.body.user_id,
    year: req.body.year,
  };
  if (newYear.user_id !== req.user._id) {
    return forbiddenHandler(res);
  }
  try {
    const year = await years.create(newYear);
    await plans
      .findByIdAndUpdate(
        newYear.plan_id,
        { $push: { year_ids: year._id } },
        { new: true, runValidators: true }
      )
      .exec();
    returnData(year, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//change the order of the year ids in plan object
router.patch("/api/years/changeOrder", auth, async (req, res) => {
  const year_ids = req.body.year_ids;
  const plan_id = req.body.plan_id;
  if (!year_ids || !plan_id) {
    return missingHandler(res, { year_ids, plan_id });
  }
  // check that plan belongs to user
  const plan = await plans.findById(plan_id).exec();
  if (req.user._id !== plan.user_id) {
    return forbiddenHandler(res);
  }
  try {
    // update plan
    const plan = await plans
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
router.patch("/api/years/updateName", auth, async (req, res) => {
  const name = req.body.name;
  const year_id = req.body.year_id;
  if (!name || !year_id) {
    return missingHandler(res, { name, year_id });
  }
  // check that year belongs to user
  const year = await years.findById(year_id).exec();
  if (req.user._id !== year.user_id) {
    return forbiddenHandler(res);
  }
  try {
    year.name = name;
    await year.save();
    await courses.updateMany({ year_id }, { year: name }).exec();
    returnData(year, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//update the year
router.patch("/api/years/updateYear", auth, async (req, res) => {
  const year = req.body.year;
  const year_id = req.body.year_id;
  if (!year || !year_id) {
    return missingHandler(res, { year, year_id });
  }
  try {
    // check that year belongs to user
    const retrievedYear = await years.findById(year_id).exec();
    if (req.user._id !== retrievedYear.user_id) {
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
router.delete("/api/years/:year_id", auth, async (req, res) => {
  const year_id = req.params.year_id;
  if (!year_id || year_id.length < 2) {
    return errorHandler(res, 400, "must specify a valid year_id");
  }
  // check that year belongs to user
  const year = await years.findById(year_id).exec();
  if (req.user._id !== year.user_id) {
    return forbiddenHandler(res);
  }
  try {
    // delete the year
    const year = await years.findByIdAndDelete(year_id).exec();
    year.courses.forEach(async (c_id) => {
      const course = await courses.findByIdAndDelete(c_id).exec();
      course.distribution_ids.forEach(async (id) => {
        const distribution = await distributions
          .findByIdAndUpdate(
            id,
            { $pull: { courses: c_id } },
            { new: true, runValidators: true }
          )
          .exec();
        await distributionCreditUpdate(distribution, course, false);
      });
    });
    let plan = await plans.findById(year.plan_id).exec();
    plan.year_ids = plan.year_ids.filter((y) => y != year._id); //remove year_id from plan
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
