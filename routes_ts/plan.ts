//routes related to Plan CRUD
import {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
} from "./helperMethods.js";
import Courses from "../model/Course.js";
import Distributions from "../model/Distribution.js";
import Users from "../model/User.js";
import Plans from "../model/Plan.js";
import Years from "../model/Year.js";
import Reviews from "../model/PlanReview.js";
import { auth } from "../util/token.js";
import express, {Request, Response} from "express";
import { isFunctionLike } from "typescript";

const router = express.Router();
const yearName = ["AP/Transfer", "Freshman", "Sophomore", "Junior", "Senior"];

//get plan by plan id
router.get("/api/plans/:plan_id", auth, async (req: Request, res: Response) => {
  const p_id = req.params.plan_id;
  try {
    const plan = await Plans
      .findById(p_id)
      .populate({
        path: "year_ids",
        populate: {
          path: "courses",
        },
      })
      .exec();
    if (plan === null) {
      return forbiddenHandler(res);
    }
    let result = { ...plan };
    const reviewers = await Reviews
      .find({ plan_id: p_id })
      .populate("reviewer_id")
      .exec();
    result = { ...result, ...reviewers };
    returnData(result, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//get all plans of a user
router.get("/api/plansByUser/:user_id", auth, async (req: any, res: Response) => { // TODO: change req type to Request, figure out what req.user is
  const user_id = req.params.user_id;
  if (req.user._id !== user_id) {
    return forbiddenHandler(res);
  }
  try {
    const plansTotal: any = []; // TODO: we really should have interfaces for all of these different types
    const user = await Users.findById(user_id).exec();
    if (!user)
      return errorHandler(res, 404, {
        message: `${user} of ${user_id} User not found`,
      });
    let total = user.plan_ids.length;
    for (let plan_id of user.plan_ids) {
      let plan = await Plans.findById(plan_id).populate("year_ids").exec();
      if (plan === null) {
        total--;
        continue;
      }
      plan.populate("year_ids.courses", async () => {
        // plan = { ...plan, years: plan.year_ids };
        // TODO: why do we delete plan.year_ids?
        // delete plan.year_ids;
        const reviewers = await Reviews
          .find({ plan_id: plan_id })
          .populate("reviewer_id")
          .exec();
        const fullPlan = { ...plan, ...reviewers };
        plansTotal.push(fullPlan);
        if (plansTotal.length === total) {
          returnData(plansTotal, res);
        }
      });
    }
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//create plan and add the plan id to user
//require user_id in body
router.post("/api/plans", auth, async (req: any, res: Response) => {
  if (!req.body.user_id) {
    return missingHandler(res, { user_id: req.body.user_id });
  }
  const plan = {
    name: req.body.name,
    user_id: req.body.user_id,
    majors: req.body.majors,
    expireAt: req.body.expireAt,
  };
  const year = req.body.year;
  const numYears = !req.params.numYears ? 5 : req.params.numYears; // TODO: fix this to update req type
  if (numYears <= 0 || numYears > 5) {
    return errorHandler(res, 400, "numYear must be between 1-5");
  }
  if (plan.user_id !== req.user._id) {
    return forbiddenHandler(res);
  }
  try {
    const retrievedPlan = await Plans.create(plan);
    //update user
    await Users
      .findByIdAndUpdate(
        retrievedPlan.user_id,
        { $push: { plan_ids: retrievedPlan._id } },
        { new: true, runValidators: true }
      )
      .exec();
    const startYear = getStartYear(year);
    const yearObjs: any[] = []; // TODO: update type from any to whatever it's supposed to be
    //create default year documents according to numYears
    for (let i = 0; i < numYears; i++) {
      const retrievedYear = {
        name: yearName[i],
        plan_id: retrievedPlan._id,
        user_id: retrievedPlan.user_id,
        year: i === 0 ? 0 : startYear + i,
        expireAt:
          retrievedPlan.user_id === "guestUser" ? Date.now() : undefined,
      };
      const newYear = await Years.create(retrievedYear);
      yearObjs.push(newYear);
      retrievedPlan.year_ids.push(newYear._id);
    }
    await retrievedPlan.save();
    const resp = { ...retrievedPlan, years: yearObjs, reviewers: [] };
    // delete resp.year_ids; // todo: why?
    returnData(resp, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

const getStartYear = (year) => {
  const date = new Date();
  if (
    (year.includes("Sophomore") && date.getMonth() > 7) ||
    (year.includes("Freshman") && date.getMonth() >= 0 && date.getMonth() <= 7)
  ) {
    return date.getFullYear() - 2;
  } else if (
    (year.includes("Junior") && date.getMonth() > 7) ||
    (year.includes("Sophomore") && date.getMonth() >= 0 && date.getMonth() <= 7)
  ) {
    return date.getFullYear() - 3;
  } else if (
    (year.includes("Senior") && date.getMonth() > 7) ||
    (year.includes("Junior") && date.getMonth() >= 0 && date.getMonth() <= 7)
  ) {
    return date.getFullYear() - 4;
  } else if (
    year.includes("Senior") &&
    date.getMonth() >= 0 &&
    date.getMonth() <= 7
  ) {
    return date.getFullYear() - 5;
  } else {
    return date.getFullYear() - 1;
  }
};

//delete a plan and its years, distributions and courses
//return deleted courses
router.delete("/api/plans/:plan_id", auth, async (req: any, res) => { // todo: change req type from any to Request
  const plan_id = req.params.plan_id;
  try {
    // check plan belongs to user
    const plan = await Plans.findById(plan_id).exec();
    if (plan === null || req.user._id !== plan.user_id) {
      return forbiddenHandler(res);
    }
    // delete plan
    await Plans.findByIdAndDelete(plan_id).exec();
    //delete distribution & courses
    await Distributions.deleteMany({ plan_id: plan._id }).exec();
    await Courses.deleteMany({ plan_id: plan._id }).exec();
    await Years.deleteMany({ plan_id: plan._id }).exec();
    await Reviews.deleteMany({ plan_id: plan._id }).exec();
    await Users
      .findByIdAndUpdate(
        //delete plan_id from user
        plan.user_id,
        { $pull: { plan_ids: plan._id } },
        { new: true, runValidators: true }
      )
      .exec();
    returnData(plan, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//***need to consider not allow user to change major for a plan ***/
router.patch("/api/plans/update", auth, async (req: any, res) => { // todo: update req type
  const id = req.body.plan_id;
  const majors = req.body.majors;
  const name = req.body.name;
  if (!majors && !name) {
    return missingHandler(res, { majors, name });
  }
  let updateBody: any = {};
  if (majors) {
    updateBody.majors = majors;
  }
  if (name) {
    updateBody.name = name;
  }
  try {
    // check plan belongs to user
    let plan = await Plans.findById(id).exec();
    if (plan === null || req.user._id !== plan.user_id) {
      return forbiddenHandler(res);
    }
    // update plan
    plan = await Plans
      .findByIdAndUpdate(id, updateBody, { new: true, runValidators: true })
      .exec();
    const reviewers = await Reviews
      .find({ plan_id: id })
      .populate("reviewer_id")
      .exec();
    const updatedPlan = { ...plan, ...reviewers };
    returnData(updatedPlan, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
