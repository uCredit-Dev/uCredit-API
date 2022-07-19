//routes related to Plan CRUD
const { returnData, errorHandler } = require("./helperMethods.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const fineRequirements = require("../model/FineRequirement.js");
const users = require("../model/User.js");
const majors = require("../model/Major.js");
const plans = require("../model/Plan.js");
const years = require("../model/Year.js");
const reviews = require("../model/PlanReview.js");
var ObjectId = require('mongodb').ObjectID;

const getAPI = (window) => {
  if (window.location.href.includes('http://localhost:3000')) {
    return 'http://localhost:4567/api';
  } else {
    if (window.location.href.includes('https://ucredit.me')) {
      return 'https://ucredit-api.herokuapp.com/api';
    } else {
      'https://ucredit-dev.herokuapp.com/api';
    }
  }
}

const express = require("express");
const Course = require("../model/Course.js");
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
        let plan = await plans.findById(plan_id).populate("year_ids");
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

//create plan and add the plan id to user
//require user_id in body
router.post("/api/plans", (req, res) => {
  const plan = {
    name: req.body.name,
    user_id: req.body.user_id,
    majors: req.body.majors,
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
      await addMajorDistributions(retrievedPlan);
      retrievedPlan.save();
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
  const major_ids = req.body.major_ids;
  const name = req.body.name;
  if (!(majors || name)) {
    errorHandler(res, 400, "Must update majors or name.");
  } else {
    let updateBody = {};
    if (majors) {
      updateBody.majors = majors;
    }
    if (major_ids) { // how does frontend know major_ids ? 
      updateBody.major_ids = major_ids;
    }
    if (name) {
      updateBody.name = name;
    }

    plans
      .findByIdAndUpdate(id, updateBody, { new: true, runValidators: true })
      .then(async (plan) => {
        // cleaning up distributions associated with plan 
        // concurrent modification ? 
        await addMajorDistributions(plan);
        distributions
          .find({ plan_id: plan._id })
          .then((distributions) => {
            for (let dist of distributions) {
              if (!plan._doc.major_ids.includes(dist.major_id)) {
                distributions.deleteOne(dist._id);
                courses.updateMany({ plan_id: id }, { $pull: { distribution_ids: dist._id } });
                fineRequirements
                  .find({ distribution_id: dist._id })
                  .then((fines) => {
                    fines.forEach((fine) => {
                      courses.updateMany({ plan_id: id }, { $pull: { fineReq_ids: fine._id } });
                    })
                  });
                fineRequirements
                  .deleteMany({ distribution_id: dist._id });
              }
            }
          });

        reviews
          .find({ plan_id: id })
          .populate("reviewer_id")
          .then((revs) => {
            plan = { ...plan, reviewers: revs };
            returnData(plan, res);
          });
      })
      .catch((err) => errorHandler(res, 400, err));
  }
});

async function addMajorDistributions(plan) {
  //Route #6 - Adding new distributions if new major is added
  for (let m_id of plan.major_ids) {
    const dist = await distributions.find({ plan_id: plan._id }, { major_id: m_id });
    if (dist.length == 0) {
      plans.findByIdAndUpdate(
        //update user
        plan._id,
        { $addToSet: { major_ids: m_id } },
        { new: true, runValidators: true }
      )
      .exec();
      const major = await majors.findById(m_id).exec();
      for (let dist_object of major.distributions) {
        let distribution_to_post = {
          major_id: major._id,
          plan_id: plan._id,
          user_id: plan.user_id,
          name: dist_object.name,
          required_credits: dist_object.required_credits,
          description: dist_object.description,
          criteria: dist_object.criteria,
          min_credits_per_course: dist_object.min_credits_per_course,
        }
        if (dist_object.hasOwnProperty('user_select')) distribution_to_post.user_select = dist_object.user_select;
        if (dist_object.hasOwnProperty('pathing')) distribution_to_post.pathing = dist_object.pathing;
        if (dist_object.hasOwnProperty('double_count')) distribution_to_post.double_count = dist_object.double_count;
        if (dist_object.hasOwnProperty('exception')) distribution_to_post.exception = dist_object.exception;
        if (dist_object.hasOwnProperty('exclusive')) distribution_to_post.exclusive = dist_object.exclusive;

        await distributions
          .create(distribution_to_post)
          .then(async (retrievedDistribution) => {
            for (let f_req of dist_object.fine_requirements) {
              let fineReq_to_post = {
                description: f_req.description,
                required_credits: f_req.required_credits,
                criteria: f_req.criteria,
                plan_id: plan._id,
                major_id: major._id,
                distribution_id: retrievedDistribution._id,
              }
              if (f_req.hasOwnProperty('exception')) fineReq_to_post.exception = f_req.exception;
              if (f_req.hasOwnProperty('exclusive')) fineReq_to_post.exclusive = f_req.exclusive;

              await fineRequirements.create(fineReq_to_post);
            }
          }); 
      }
      await addCourses(plan, m_id);
    }
  }
};


// Copied parts of route #1 from course.js file and got rid of array modifications
// Adds all courses for specified major, but doesn't add year or plan arrays cause course already existsO
// Only distributions and course are being updated
async function addCourses(plan, m_id) {
  const coursesInPlan = await Course.findByPlanId(plan._id)
  let distObjs = await distributions.find({ $and: [ {plan_id: plan._id}, {major_id: m_id} ]});
  
  for (let course in coursesInPlan) {
    let distExclusive = undefined; 
    for (let distObj of distObjs) {
      if ((distExclusive === undefined || distExclusive.includes(distObj.name))) {
        let updated = await updateDistribution(distObj._id, course._id); 
        if (updated) distExclusive = distObj.exclusive; 
      }
    }
  }
};

module.exports = router;
