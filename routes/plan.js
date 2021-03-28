//routes related to Plan CRUD
const { returnData, errorHandler } = require("./helperMethods.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");

const express = require("express");
const router = express.Router();

module.exports = router;

//get plan by plan id
router.get("/api/plans/:plan_id", (req, res) => {
  const p_id = req.params.plan_id;
  plans
    .findById(p_id)
    .then((plan) => returnData(plan, res))
    .catch((err) => errorHandler(res, 500, err));
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
    .catch((err) => errorHandler(res, 500, err));
});

//create plan and add the plan id to user
//require user_id in body
router.post("/api/plans", (req, res) => {
  const plan = req.body;
  plans
    .create(plan)
    .then((plan) => {
      users
        .findByIdAndUpdate(
          //update user
          plan.user_id,
          { $push: { plan_ids: plan._id } },
          { new: true, runValidators: true }
        )
        .exec();
      returnData(plan, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

//delete a plan and its distributions and courses
//return deleted courses
/*******need testing ********/
router.delete("/api/plans/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  plans
    .findByIdAndDelete(plan_id)
    .then((plan) => {
      //delete distribution & courses
      distributions.deleteMany({ plan_id: plan._id }).exec();
      courses.deleteMany({ plan_id: plan._id }).exec();
      returnData(plan, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

router.patch("/api/plans/updateMajors", (req, res) => {
  const id = req.body.plan_id;
  const majors = req.body.majors;
  plans
    .findByIdAndUpdate(
      id,
      { majors: majors },
      { new: true, runValidators: true }
    )
    .then((plan) => returnData(plan, res))
    .catch((err) => errorHandler(res, 500, err));
});

module.exports = router;
