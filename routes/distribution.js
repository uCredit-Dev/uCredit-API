//routes related to distirbutions CRUD
const { returnData, errorHandler } = require("./helperMethods.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const plans = require("../model/Plan.js");

const express = require("express");
const router = express.Router();

module.exports = router;

//get distribution by id
router.get("/api/distributions/:distribution_id", (req, res) => {
  const d_id = req.params.distribution_id;
  distributions
    .findById(d_id)
    .then((distribution) => returnData(distribution, res))
    .catch((err) => errorHandler(res, 400, err));
});

//get all distributions in a plan
router.get("/api/distributionsByPlan/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  distributions
    .find({ plan_id: req.params.plan_id })
    .then((distributions) => returnData(distributions, res))
    .catch((err) => errorHandler(res, 400, err));
});

//create distribution and update its plan
router.post("/api/distributions", (req, res) => {
  const distribution = req.body;
  distributions
    .create(distribution)
    .then((retrievedDistribution) => {
      returnData(retrievedDistribution, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

//change required credit setting for distribution
router.patch("/api/distributions/updateRequiredCredits", (req, res) => {
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

router.patch("/api/distributions/updateName", (req, res) => {
  const name = req.query.name;
  const id = req.query.id;
  distributions
    .findByIdAndUpdate(id, { name }, { new: true, runValidators: true })
    .then((distribution) => returnData(distribution, res))
    .catch((err) => errorHandler(res, 400, err));
});

//delete a distribution and its associated courses(if that is the only distirbution the course belongs to) and update it's plan
//return the deleted courses
router.delete("/api/distributions/:d_id", (req, res) => {
  const d_id = req.params.d_id;
  distributions
    .findByIdAndDelete(d_id)
    .then((distribution) => {
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
