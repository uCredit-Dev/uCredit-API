//routes related to Year CRUD
const {
  returnData,
  errorHandler,
  distributionCreditUpdate,
} = require("./helperMethods.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const plans = require("../model/Plan.js");
const years = require("../model/Year.js");

const express = require("express");
const router = express.Router();

//get years by plan id
router.get("/api/years/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  years
    .find({ plan_id })
    .then((years) => returnData(years, res))
    .catch((err) => errorHandler(res, 400, err));
});

//can only add year to the front/end of current years
router.post("/api/years", async (req, res) => {
  const preUniversity = req.body.preUniversity;
  let newYear = {
    name: req.body.name,
    plan_id: req.body.plan_id,
    user_id: req.body.user_id,
  };
  let plan = await plans.findById(newYear.plan_id).exec();
  //determine year number
  if (!preUniversity) {
    newYear.year = plan.numYears + 1;
  } else {
    newYear.year = 0;
  }
  years
    .create(newYear)
    .then((nY) => {
      //update plan's year array
      if (newYear.year) {
        //year != 0, not preUniversity
        plan.years.push(nY._id);
        plan.numYears++;
      } else {
        plan.years.unshift(nY._id);
      }
      plan.save();
      returnData(nY, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

//update the name of the year
router.patch("/api/years/update", (req, res) => {
  const name = req.body.name;
  const year_id = req.body.year_id;
  if (!name) {
    errorHandler(err, 400, "must specify a new name");
  }
  years
    .findByIdAndUpdate(year_id, { name }, { new: true, runValidators: true })
    .then((year) => {
      courses.updateMany({ year_id }, { year: name }).exec();
      returnData(year, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

//delete plan and its associated courses, remove year_id from the associated plan document
router.delete("/api/years/:year_id", (req, res) => {
  const year_id = req.params.year_id;
  years.findByIdAndDelete(year_id).then(async (year) => {
    year.courses.forEach((c_id) => {
      courses
        .findByIdAndDelete(c_id)
        .then((course) => {
          course.distribution_ids.forEach((id) => {
            distributions
              .findByIdAndUpdate(
                id,
                { $pull: { courses: c_id } },
                { new: true, runValidators: true }
              )
              .then((distribution) =>
                distributionCreditUpdate(distribution, course, false)
              )
              .catch((err) => errorHandler(res, 500, err));
          });
        })
        .catch((err) => errorHandler(res, 500, err));
    });
    let plan = await plans.findById(year.plan_id);
    plan.years = plan.years.filter((y) => y != year._id); //remove year_id from plan
    if (year.year) {
      //not a preUniversity year, delete last year
      plan.years.pop();
      plan.numYears--;
    } else {
      plan.years.shift();
    }
    plan.save();
    returnData(year, res);
  });
});

module.exports = router;
