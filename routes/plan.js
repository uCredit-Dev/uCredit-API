//routes related to Plan CRUD
const {
  returnData, 
  errorHandler
}= require("./helperMethods.js");
const {
  addPlanDistributions,
  addCourse,
} = require("./distributionMethods.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const fineRequirements = require("../model/FineRequirement.js");
const users = require("../model/User.js");
const majors = require("../model/Major.js");
const plans = require("../model/Plan.js");
const years = require("../model/Year.js");
const reviews = require("../model/PlanReview.js");
var ObjectId = require("mongodb").ObjectID;
const express = require("express");
const Course = require("../model/Course.js");
const router = express.Router();

const getAPI = (window) => {
  if (window.location.href.includes("http://localhost:3000")) {
    return "http://localhost:4567/api";
  } else {
    if (window.location.href.includes("https://ucredit.me")) {
      return "https://ucredit-api.herokuapp.com/api";
    } else {
      ("https://ucredit-dev.herokuapp.com/api");
    }
  }
};


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
        reviews
          .find({ plan_id: p_id })
          .populate("reviewer_id")
          .then((revs) => {
            plan = { ...plan, reviewers: revs };
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
        let plan = await plans.findById(plan_id).populate("year_ids").exec();
        if (!plan) {
          total--;
          continue;
        }
        await plan.populate("year_ids.courses", () => {
          plan = { ...plan._doc, years: plan.year_ids };
          delete plan.year_ids;
          reviews
            .find({ plan_id: plan_id })
            .populate("reviewer_id")
            .then((revs) => {
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

// create plan and add the plan id to user
// require user_id in body
router.post("/api/plans", (req, res) => {
  const plan = {
    name: req.body.name,
    user_id: req.body.user_id,
    major_ids: req.body.major_ids,
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
      // add distributions for selected major(s)
      await addPlanDistributions(retrievedPlan);
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
      const distObjs = await distributions      // get all distributions 
        .find({ plan_id: retrievedPlan._id })
        .populate("fineReq_ids")
        .exec();
      const resp = {
        ...retrievedPlan._doc,
        years: yearObjs,
        distributions: distObjs,
        reviewers: [],
      };
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

// delete a plan and its years, distributions and courses
// return deleted courses
router.delete("/api/plans/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  plans
    .findByIdAndDelete(plan_id)
    .then(async (plan) => {
      //delete distributions, fineReqs, courses, and years
      await distributions.deleteMany({ plan_id: plan._id }).exec();
      await fineRequirements.deleteMany({ plan_id: plan._id }).exec();
      await courses.deleteMany({ plan_id: plan._id }).exec();
      await years.deleteMany({ plan_id: plan._id }).exec();
      //delete plan_id from user
      await users
        .findByIdAndUpdate(
          plan.user_id,
          { $pull: { plan_ids: plan._id } },
          { new: true, runValidators: true }
        )
        .exec();
      let deletedPlan = { ...plan._doc };
      returnData(deletedPlan, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

//***need to consider not allow user to change major for a plan ***/
// updates a plan's major(s) and name
router.patch("/api/plans/update", (req, res) => {
  const id = req.body.plan_id;
  const major_ids = req.body.major_ids;
  const name = req.body.name;
  if (!(major_ids || name)) {
    errorHandler(res, 400, "Must update majors or name.");
  } else {
    let updateBody = {};
    if (major_ids) {
      updateBody.major_ids = major_ids;
    }
    if (name) {
      updateBody.name = name;
    }
    plans
      .findByIdAndUpdate(id, updateBody, { new: true, runValidators: true })
      .then(async (plan) => {
        // add dists for new major, if any
        await addPlanDistributions(plan);
        // remove dists and fineReqs for deleted major, if any
        await distributions.find({ plan_id: plan._id }).then(async (dists) => {
          for (let dist of dists) {
            if (!plan._doc.major_ids.includes(dist.major_id)) {
              // maintain courses array fields
              await courses.updateMany(
                { plan_id: id },
                { $pull: { distribution_ids: dist._id } }
              ).exec();
              for (let f_id of dist.fineReq_ids) {
                await courses.updateMany(
                  { plan_id: id },
                  { $pull: { fineReq_ids: f_id } }
                ).exec();
              }
              // delete documents
              await distributions.findByIdAndDelete(dist._id).exec();
              await fineRequirements.deleteMany({ distribution_id: dist._id }).exec();
            }
          }
        });
        // return plan with reviews and distributions
        const distObjs = await distributions
          .find({ plan_id: plan._id })
          .populate("fineReq_ids")
          .exec();
        await reviews
          .find({ plan_id: id })
          .populate("reviewer_id")
          .then((revs) => {
            plan = {
              ...plan,
              distributions: distObjs,
              reviewers: revs,
            };
            returnData(plan, res);
          });
      })
      .catch((err) => errorHandler(res, 400, err));
  }
});

module.exports = router;
