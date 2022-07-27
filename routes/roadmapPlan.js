const { returnData, errorHandler } = require("./helperMethods.js");
const roadmapPlans = require("../model/RoadmapPlan.js");
const plans = require("../model/Plan.js");
const years = require("../model/Year.js");
//const distributions = require("../model/Distribution.js");
const courses = require("../model/Course.js");

const express = require("express");
const router = express.Router();

// given the id of a plan already created, generates a roadmapPlan document
// based on that plan
router.post("/api/roadmapPlans/createFromPlan", (req, res) => {
  const old_id = req.body.id;
  plans
    .findById(old_id)
    .then(async (retrieved) => {
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
      let newYears = [];
      let newYearIds = [];
      let yearPromise = Promise.all(
        retrieved.year_ids.map(async (elem) => {
          let found = await years.find({ _id: elem }, { _id: 0 });
          let yearData = {
            name: found[0].name,
            user_id: found[0].user_id,
            expireAt: found[0].expireAt,
            year: found[0].year,
            courses: found[0].courses,
          };
          let created = await years.create(yearData);
          // order is kept track of here to make things easier further down
          newYears[yearNameToArrIndex(created.name)] = created;
          newYearIds.push(created._id);
        })
      );
      data.year_ids = newYearIds;
      /* Not currently necessary as distributions aren't working yet
      let newDistributions = [];
      let distPromise = Promise.all(
        retrieved.distribution_ids.map(async (elem) => {
          let found = await distributions.find({ _id: elem }, { _id: 0 });
          distData = {
            name: found[0].name,
            required: found[0].required,
            planned: found[0].planned,
            current: found[0].current,
            satisfied: found[0].satisfied,
            user_id: found[0].user_id,
            expireAt: found[0].expireAt,
          };
          let created = await distributions.create(distData);
          newDistributions.push(created._id);
        })
      ); // */
      await Promise.all([yearPromise]); // add distPromise when applicable
      roadmapPlans.create(data).then(async (result) => {
        await Promise.all(
          newYears.map(async (curYear) => {
            curYear.plan_id = [result._id];
            oldCourses = curYear.courses;
            curYear.courses = [];
            await Promise.all(
              oldCourses.map(async (course_id) => {
                let found = await courses.find({ _id: course_id }, { _id: 0 });
                let inserted = await courses.insertMany(found);
                curYear.courses.push(inserted.insertedIds[0]);
              })
            );
          })
        );
        // when distributions are added the courses will need to be linked
        returnData(result, res);
      });
    })
    .catch((err) => errorHandler(res, 400, err));
});

const yearNameToArrIndex = (name) => {
  if (name === "AP Equivalents") {
    return 0;
  } else if (name === "Freshman") {
    return 1;
  } else if (name === "Sophomore") {
    return 2;
  } else if (name === "Junior") {
    return 3;
  } else if (name === "Senior") {
    return 4;
  }
};

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
