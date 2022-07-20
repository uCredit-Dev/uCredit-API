const { returnData, errorHandler } = require("./helperMethods.js");
const roadmapPlans = require("../model/RoadmapPlan.js");
const plans = require("../model/Plan.js");

const express = require("express");
const router = express.Router();

// given the id of a plan already created, generates a roadmapPlan document
// based on that plan
router.post("/api/roadmapPlan/createFromPlan", (req, res) => {
  const old_id = req.body.id;
  plans
    .findById(old_id)
    .then((retrieved) => returnData(createRoadmapPlanFrom(retrieved), res))
    .catch((err) => errorHandler(res, 400, err));
});

const createRoadmapPlanFrom = (plan) => {
  /*let data = {
    original: plan.id,
    name: plan.name,
    majors: plan.majors.slice(),
    tags: [],
    user_id: plan.user_id,
    expireAt: plan.expireAt,
  };*/
  console.log(plan);
  return plan;
};

// gets and returns a roadmapPlan based on its id
router.get("/api/roadmapPlans/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  roadmapPlans
    .findByPlanId(plan_id)
    .then((retrieved) => returnData(retrieved, res))
    .catch((err) => errorHandler(res, 400, err));
});

module.exports = router;
