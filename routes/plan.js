//routes related to Plan CRUD
const { returnData, errorHandler } = require("./helperMethods.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");
const years = require("../model/Year.js");

const express = require("express");
const router = express.Router();

//get plan by plan id
router.get("/api/plans/:plan_id", (req, res) => {
  const p_id = req.params.plan_id;
  plans
    .findById(p_id)
    .then((plan) => returnData(plan, res))
    .catch((err) => errorHandler(res, 400, err));
});

//get all plans of a user
router.get("/api/plansByUser/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  users
    .findById(user_id)
    .populate({ path: "plan_ids" })
    .then((user) => {
      returnData(user.plan_ids, res);
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
  const numYears = plan.numYears === undefined ? 5 : req.params.numYears;
  if (numYears <= 0 || numYears > 5) {
    errorHandler(res, 400, "numYear must be between 1-5");
  }
  plans
    .create(plan)
    .then(async (plan) => {
      users
        .findByIdAndUpdate(
          //update user
          plan.user_id,
          { $push: { plan_ids: plan._id } },
          { new: true, runValidators: true }
        )
        .exec();
      const yearName = [
        "AP Equivalents",
        "Freshman",
        "Sophomore",
        "Junior",
        "Senior",
      ];
      const startYear = getStartYear(year);
      //create default year documents according to numYears
      for (let i = 0; i < numYears; i++) {
        const year = {
          name: yearName[i],
          plan_id: plan._id,
          user_id: plan.user_id,
          year: startYear + i,
          expireAt:
            plan.user_id === "guestUser"
              ? Date.now() + 60 * 60 * 24 * 1000
              : undefined,
        };
        const newYear = await years.create(year);
        plan.year_ids.push(newYear._id);
      }
      plan.save();
      returnData(plan, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

const getStartYear = (year) => {
  if (year.includes("Sophomore")) {
    return new Date().getFullYear() - 1;
  } else if (year.includes("Junior")) {
    return new Date().getFullYear() - 2;
  } else if (year.includes("Senior")) {
    return new Date().getFullYear() - 3;
  } else {
    return new Date().getFullYear();
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
      users
        .findByIdAndUpdate(
          //delete plan_id from user
          plan._id,
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
      .then((plan) => returnData(plan, res))
      .catch((err) => errorHandler(res, 400, err));
  }
});

module.exports = router;
