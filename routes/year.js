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
  plans
    .findById(plan_id)
    .populate({ path: "year_ids" })
    .then((plan) => returnData(plan.year_ids, res))
    .catch((err) => errorHandler(res, 400, err));
});

//create a new year and add year id to the end of plan's year array
router.post("/api/years", async (req, res) => {
  let newYear = {
    name: req.body.name,
    plan_id: req.body.plan_id,
    user_id: req.body.user_id,
    year: req.body.year,
  };
  years
    .create(newYear)
    .then((year) => {
      plans
        .findByIdAndUpdate(
          newYear.plan_id,
          { $push: { year_ids: year._id } },
          { new: true, runValidators: true }
        )
        .exec();
      returnData(year, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

//change the order of the year ids in plan object
router.patch("/api/years/changeOrder", async (req, res) => {
  const year_ids = req.body.year_ids;
  const plan_id = req.body.plan_id;
  if (!year_ids || !plan_id) {
    errorHandler(res, 400, "Missing required fields");
    return;
  }
  plans
    .findByIdAndUpdate(
      plan_id,
      { year_ids: year_ids },
      { new: true, runValidators: true }
    )
    .then((plan) => returnData(plan, res))
    .catch((err) => errorHandler(res, 400, err));
});

//update the name of the year
router.patch("/api/years/updateName", (req, res) => {
  const name = req.body.name;
  const year_id = req.body.year_id;
  if (!name) {
    errorHandler(res, 400, "must specify a new name");
    return;
  }
  if (!year_id) {
    errorHandler(res, 400, "must specify a year_id");
    return;
  }
  years
    .findByIdAndUpdate(year_id, { name }, { new: true, runValidators: true })
    .then((year) => {
      courses.updateMany({ year_id }, { year: name }).exec();
      returnData(year, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

//update the year
router.patch("/api/years/updateYear", (req, res) => {
  const year = req.body.year;
  const year_id = req.body.year_id;
  if (!year) {
    errorHandler(res, 400, "must specify a new year");
    return;
  }
  if (!year_id) {
    errorHandler(res, 400, "must specify a year_id");
    return;
  }
  years
    .findByIdAndUpdate(year_id, { year }, { new: true, runValidators: true })
    .then((retrievedYear) => {
      courses.updateMany({ year_id }, { year: retrievedYear.name }).exec();
      returnData(retrievedYear, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

// delete plan and its associated courses, remove year_id from the associated plan document
router.delete("/api/years/:year_id", (req, res) => {
  const year_id = req.params.year_id;
  if (!year_id || year_id.length < 2) {
    errorHandler(res, 400, "must specify a valid year_id");
    return;
  }
  years
    .findByIdAndDelete(year_id)
    .then(async (year) => {
      year.courses.forEach((c_id) => {
        courses.findByIdAndDelete(c_id).then((course) => {
          course.distribution_ids.forEach((id) => {
            distributions
              .findByIdAndUpdate(
                id,
                { $pull: { courses: c_id } },
                { new: true, runValidators: true }
              )
              .then((distribution) =>
                distributionCreditUpdate(distribution, course, false)
              );
          });
        });
      });
      let plan = await plans.findById(year.plan_id);
      plan.year_ids = plan.year_ids.filter((y) => y != year._id); //remove year_id from plan
      if (year.year) {
        //not a preUniversity year, delete last year
        plan.year_ids.pop();
      } else {
        plan.year_ids.shift();
      }
      plan.save();
      returnData(year, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

router.post("/api/spc-login", (req, res) => {
  const pw = req.body.pw;
  console.log(pw);
  if (pw === "5cf37e783327fe0ca9fc5972ae7ed331") {
    returnData("ok", res);
  } else {
    errorHandler(res, 400, "invalid user");
  }
});

module.exports = router;
