//routes related to distirbutions CRUD
const { returnData, errorHandler } = require("./helperMethods.js");
const { auth } = require("../util/token");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const plans = require("../model/Plan.js");

const express = require("express");
const router = express.Router();

module.exports = router;

//get distribution by id
router.get("/api/distributions/:distribution_id", auth, (req, res) => {
  const d_id = req.params.distribution_id;
  distributions
    .findById(d_id)
    .then((distribution) => returnData(distribution, res))
    .catch((err) => errorHandler(res, 400, err));
});

//get all distributions in a plan
router.get("/api/distributionsByPlan/:plan_id", auth, (req, res) => {
  const plan_id = req.params.plan_id;
  plans
    .findById(plan_id)
    .populate({ path: "distribution_ids" })
    .then((plan) => returnData(plan.distribution_ids, res))
    .catch((err) => errorHandler(res, 400, err));
});

//create distribution and update its plan
router.post("/api/distributions", auth, (req, res) => {
  const distribution = req.body;
  distributions
    .create(distribution)
    .then((retrievedDistribution) => {
      plans
        .findByIdAndUpdate(
          //update plan
          retrievedDistribution.plan_id,
          { $push: { distribution_ids: retrievedDistribution._id } },
          { new: true, runValidators: true }
        )
        .exec();
      returnData(retrievedDistribution, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

//change required credit setting for distribution
router.patch("/api/distributions/updateRequiredCredits", auth, (req, res) => {
  const required = req.query.required;
  const id = req.query.id;
  distributions
    .findByIdAndUpdate(
      id,
      { required: Number.parseInt(required) },
      { new: true, runValidators: true }
    )
    .then((distribution) => {
      //recalculate whether distribution is satisfied
      distribution.satisfied = distribution.planned >= distribution.required;
      distribution.save().then((result) => returnData(result, res));
    })
    .catch((err) => errorHandler(res, 400, err));
});

router.patch("/api/distributions/updateName", auth, (req, res) => {
  const name = req.query.name;
  const id = req.query.id;
  distributions
    .findByIdAndUpdate(id, { name }, { new: true, runValidators: true })
    .then((distribution) => returnData(distribution, res))
    .catch((err) => errorHandler(res, 400, err));
});

//delete a distribution and its associated courses(if that is the only distirbution the course belongs to) and update it's plan
//return the deleted courses
router.delete("/api/distributions/:d_id", auth, (req, res) => {
  const d_id = req.params.d_id;
  distributions
    .findByIdAndDelete(d_id)
    .then((distribution) => {
      plans
        .findByIdAndUpdate(
          //update plan
          distribution.plan_id,
          { $pull: { distribution_ids: distribution._id } },
          { new: true, runValidators: true }
        )
        .exec();
      courses //delete courses that only belong to the distribution
        .deleteMany({
          $and: [
            {
              distribution_ids: distribution._id,
            },
            { distribution_ids: { $size: 1 } },
          ], //needs to be an AND condition
        })
        .exec();
      returnData(distribution, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

module.exports = router;
