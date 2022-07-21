const { returnData, errorHandler } = require("./helperMethods.js");
const roadmapPlans = require("../model/RoadmapPlan.js");
const plans = require("../model/Plan.js");

const express = require("express");
const router = express.Router();

// given the id of a plan already created, generates a roadmapPlan document
// based on that plan
router.post("/api/roadmapPlans/createFromPlan", (req, res) => {
  const old_id = req.body.id;
  plans
    .findById(old_id)
    .then((retrieved) => {
      let data = {
        original: retrieved.id,
        name: retrieved.name,
        majors: retrieved.majors.slice(),
        tags: [],
        user_id: retrieved.user_id,
        expireAt: retrieved.expireAt,
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

/* searches the roadmapPlan documents based on name, description, tags, and
 * major (all optionally)
 * Behavoir: Main search text searches name, description, tags, and major text.
 * This is the main search bar, at the top of the page. Tags are searched for
 * with an exact match only. Multiple tags can be searched, with both matching
 * all or matching any of functionality. Majors are also exact match, and
 * multiple can be searched the same way. Tags and majors should be sent as
 * one string, seperated by commas (with no spaces) if there are multiple
 */
router.get("/api/roadmapPlans/search", (req, res) => {
  // get search queries if they exist
  const nameSearch = req.query.nameSearch ? req.query.nameSearch : "";
  const tagSearch = req.query.tagSearch ? req.query.tagSearch : "";
  const majorSearch = req.query.majorSearch ? req.query.majorSearch : "";
  const tagAny = req.query.tagAny === "yes" ? true : false;
  const majorAny = req.query.majorAny === "yes" ? true : false;
  let selector = {};
  // setup search for name and description
  if (nameSearch !== "") {
    selector["$or"] = [
      { name: { $regex: nameSearch, $options: "i" } },
      { description: { $regex: nameSearch, $options: "i" } },
      { tags: { $regex: nameSearch, $options: "i" } },
      { major: { $regex: nameSearch, $options: "i" } },
    ];
  }
  // setup search for tags
  if (tagSearch !== "") {
    if (tagAny) {
      selector["tags"] = { $in: splitMultivalueQueryString(tagSearch) };
    } else {
      selector["tags"] = { $all: splitMultivalueQueryString(tagSearch) };
    }
  }
  // setup search for majors
  if (majorSearch !== "") {
    if (majorAny) {
      selector["majors"] = { $in: splitMultivalueQueryString(majorSearch) };
    } else {
      selector["majors"] = { $all: splitMultivalueQueryString(majorSearch) };
    }
  }
  roadmapPlans
    .find(selector)
    .then((result) => returnData(result, res))
    .catch((err) => errorHandler(res, 400, err));
});

const splitMultivalueQueryString = (values) => {
  let splitValues = values.split(",");
  let query = [];
  splitValues.forEach((elem) => query.push(elem));
  return splitValues;
};

module.exports = router;
