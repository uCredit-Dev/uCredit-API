const { returnData, errorHandler } = require("./helperMethods.js");
const roadmapPlans = require("../model/RoadmapPlan.js");
const plans = require("../model/Plan.js");

const express = require("express");
const router = express.Router();

// given the id of a plan already created, generates a roadmapPlan document
// based on that plan
router.post("/api/roadmapPlans/createFromPlan", (req, res) => {
  const old_id = req.body.old_id;
  const description = req.body.description;
  const tags = req.body.tags;
  const planName = req.body.planName;
  const comments = req.body.allowComment;
  plans
    .findById(old_id)
    .then((retrieved) => {
      let data = {
        original: retrieved.id,
        name: planName,
        majors: retrieved.majors.slice(),
        year_ids: retrieved.year_ids,
        distribution_ids : retrieved.distribution_ids,
        tags: tags,
        user_id: retrieved.user_id,
        expireAt: retrieved.expireAt,
        description: description,
        comments: comments,
      };
      roadmapPlans
        .create(data)
        .then((result) => returnData(result, res))
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
