const { returnData, errorHandler } = require("./helperMethods.js");
const roadmapPlans = require("../model/RoadmapPlan.js");
const plans = require("../model/Plan.js");
const years = require("../model/Year.js");
const distributions = require("../model/Distribution.js");
const courses = require("../model/Course.js");

const express = require("express");
const router = express.Router();

// given the id of a plan already created, generates a roadmapPlan document
// based on that plan
router.post("/api/roadmapPlans/createFromPlan", (req, res) => {
  const old_id = req.body.id;
  console.log(old_id);
  plans
    .findById(old_id)
    .then((retrieved) => {
      // extract simple fields from the plan
      let data = {
        original: retrieved.id,
        name: retrieved.name,
        description: "",
        num_likes: 0,
        majors: retrieved.majors.slice(),
        tags: [],
        user_id: retrieved.user_id,
        expireAt: retrieved.expireAt,
        // postedAt will default to Date.now by the schema
      };
      // now clone the linked year and distribution documents
      newYears = [];
      retrieved.year_ids.forEach((elem) => {
        // TODO courses also need to be deep copied
        years
          .create(years.find({ _id: elem }, { _id: 0 }))
          .then((created) => newYears.append(created._id))
          .catch((err) => errorHandler(res, 400, err));
      });
      newDistributions = [];
      retrieved.distribution_ids.forEach((elem) => {
        // TODO courses also need to be deep copied
        distributions
          .create(distributions.find({ _id: elem }, { _id: 0 }))
          .then((created) => newDistributions.append(created._id))
          .catch((err) => errorHandler(res, 400, err));
      });
      data.year_ids = newYears;
      data.distribution_ids = newDistributions;
      roadmapPlans
        .create(data)
        .then((result) => {
          newYears.forEach((id) => {
            years.findByIdAndUpdate(id, { plan_id: result._id });
          });
          // create deep copy of courses
          newDistributions.forEach((id) => {
            dist = distributions.find({ _id: id });
            dist.plan_id = result._id;
            newCourses = [];
            dist.courses.forEach((course) => {
              courses.create(courses.find({ _id: course })).then((created) => {
                created.distribution_id = dist._id;
                created.plan_id = result._id;
                // now need to do year, which is tougher
              });
            });
          });
          returnData(result, res);
        })
        .catch((err) => errorHandler(res, 400, err));
    })
    .catch((err) => errorHandler(res, 400, err));
});

// gets and returns a roadmapPlan based on its id
router.get("/api/roadmapPlans/get/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  roadmapPlans
    .findById(plan_id)
    .then((retrieved) => returnData(retrieved, res))
    .catch((err) => errorHandler(res, 400, err));
});

// searches the roadmapPlan documents based on name, description, tags, and
// major (all optionally)
router.get("/api/roadmapPlans/search", (req, res) => {
  // get search queries if they exist
  const nameSearch = req.query.nameSearch ? req.query.nameSearch : "";
  const tagSearch = req.query.tagSearch ? req.query.tagSearch : "";
  const majorSearch = req.query.majorSearch ? req.query.majorSearch : "";
  let selector = {};
  // setup search for name and description
  if (nameSearch !== "") {
    selector["$or"] = [
      { name: { $regex: nameSearch, $options: "i" } },
      { description: { $regex: nameSearch, $options: "i" } },
    ];
  }
  // setup search for tags
  /*if (tagSearch !== "") {
    let splitTags = tagSearch.split(" ");
    let tagQuery = [];
    splitTags.forEach((elem) => tagQuery.push({ $regex: elem, $options: "i" }));
    selector["tags"] = { $all: tagQuery };
  }*/
  // setup search for majors
  if (majorSearch !== "") {
    selector["majors"] = majorSearch;
  }
  roadmapPlans
    .find(selector)
    .then((result) => returnData(result, res))
    .catch((err) => errorHandler(res, 400, err));
});

module.exports = router;
