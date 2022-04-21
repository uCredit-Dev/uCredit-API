//routes related to Plan CRUD
const { returnData, errorHandler } = require("./helperMethods.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");
const years = require("../model/Year.js");
const reviews = require("../model/PlanReview.js");

const express = require("express");
const router = express.Router();

//get plan by plan id
router.get("/api/plans/:plan_id", (req, res) => {
  const p_id = req.params.plan_id;
  plans
    .findById(p_id)
    .populate("year_ids")
    .then((plan) => {
      plan.populate("year_ids.courses", () => {
        plan = { ...plan._doc, years: plan.year_ids };
        delete plan.year_ids;
        reviews.find({ plan_id: plan_id }).then((revs) => {
          plan = { ...plan._doc, reviews: revs };
          returnData(plan, res);
        });
      });
    })
    .catch((err) => errorHandler(res, 400, err));
});

//get all plans of a user
router.get("/api/plansByUser/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const plansTotal = [];
  users
    .findById(user_id)
    .then(async (user) => {
      let total = user.plan_ids.length;
      if (!user) errorHandler(res, 404, `${user} of ${user_id} User not found`);
      for (let plan_id of user.plan_ids) {
        let plan = await plans.findById(plan_id).populate("year_ids");
        if (!plan) {
          total--;
          continue;
        }
        await plan.populate("year_ids.courses", () => {
          plan = { ...plan._doc, years: plan.year_ids };
          delete plan.year_ids;
          reviews.find({ plan_id: plan_id }).then((revs) => {
            plan = { ...plan, reviewers: revs };
            plansTotal.push(plan);
            if (plansTotal.length === total) {
              returnData(plansTotal, res);
            }
          });
        });
      }
    })
    .catch((err) => errorHandler(res, 400, err));
});

//create plan and add the plan id to user
//require user_id in body
router.post("/api/plans", (req, res) => {
  const plan = {
    name: req.body.name,
    user_id: req.body.user_id,
    majors: req.body.majors,
    expireAt: req.body.expireAt,
  };
  const year = req.body.year;
  const numYears = !req.params.numYears ? 5 : req.params.numYears;
  if (numYears <= 0 || numYears > 5) {
    errorHandler(res, 400, "numYear must be between 1-5");
  }
  plans
    .create(plan)
    .then(async (retrievedPlan) => {
      users
        .findByIdAndUpdate(
          //update user
          retrievedPlan.user_id,
          { $push: { plan_ids: retrievedPlan._id } },
          { new: true, runValidators: true }
        )
        .exec();
      const yearName = [
        "AP/Transfer",
        "Freshman",
        "Sophomore",
        "Junior",
        "Senior",
      ];
      const startYear = getStartYear(year);
      const yearObjs = [];
      //create default year documents according to numYears
      for (let i = 0; i < numYears; i++) {
        const retrievedYear = {
          name: yearName[i],
          plan_id: retrievedPlan._id,
          user_id: retrievedPlan.user_id,
          year: i === 0 ? 0 : startYear + i,
          expireAt:
            retrievedPlan.user_id === "guestUser"
              ? Date.now() + 60 * 60 * 24 * 1000
              : undefined,
        };
        const newYear = await years.create(retrievedYear);
        yearObjs.push(newYear);
        retrievedPlan.year_ids.push(newYear._id);
      }
      retrievedPlan.save();
      const resp = { ...retrievedPlan._doc, years: yearObjs, reviewers: [] };
      delete resp.year_ids;
      returnData(resp, res);
    })
    .catch((err) => errorHandler(res, 400, err));
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
router.delete("/api/plans/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  plans
    .findByIdAndDelete(plan_id)
    .then((plan) => {
      //delete distribution & courses
      distributions.deleteMany({ plan_id: plan._id }).exec();
      courses.deleteMany({ plan_id: plan._id }).exec();
      years.deleteMany({ plan_id: plan._id }).exec();
      // TODO: delete reviews
      users
        .findByIdAndUpdate(
          //delete plan_id from user
          plan.user_id,
          { $pull: { plan_ids: plan._id } },
          { new: true, runValidators: true }
        )
        .exec();
      returnData(plan, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

//***need to consider not allow user to change major for a plan ***/
router.patch("/api/plans/update", (req, res) => {
  const id = req.body.plan_id;
  const majors = req.body.majors;
  const name = req.body.name;
  if (!(majors || name)) {
    errorHandler(res, 400, "Must update majors or name.");
  } else {
    let updateBody = {};
    if (majors) {
      updateBody.majors = majors;
    }
    if (name) {
      updateBody.name = name;
    }
    plans
      .findByIdAndUpdate(id, updateBody, { new: true, runValidators: true })
      .then((plan) => {
        reviews.find({ plan_id: plan_id }).then((revs) => {
          plan = { ...plan._doc, reviews: reviewers };
          returnData(plan, res);
        });
      })
      .catch((err) => errorHandler(res, 400, err));
  }
});

module.exports = router;
