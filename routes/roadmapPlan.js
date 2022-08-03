const { returnData, errorHandler } = require("./helperMethods.js");
const roadmapPlans = require("../model/RoadmapPlan.js");
const plans = require("../model/Plan.js");
const users = require("../model/User.js");

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

// replaces the current plan name with the provided one
router.patch("/api/roadmapPlans/name/:plan_id", (req, res) => {
  const newName = req.body.newName;
  roadmapPlans
    .findByIdAndUpdate(req.params.plan_id, { name: newName }, { new: true })
    .then((roadmapPlan) => returnData(roadmapPlan, res))
    .catch((err) => errorHandler(res, 404, err));
});

// replaces the current plan description with the provided one
router.patch("/api/roadmapPlans/description/:plan_id", (req, res) => {
  const newDesc = req.body.newDesc;
  roadmapPlans
    .findByIdAndUpdate(
      req.params.plan_id,
      { description: newDesc },
      { new: true }
    )
    .then((roadmapPlan) => returnData(roadmapPlan, res))
    .catch((err) => errorHandler(res, 404, err));
});

// adds one or more tags to the list of tags for this plan
// tags should be sent as a single string, seperated by commas (with no spaces)
router.patch("/api/roadmapPlans/addTags/:plan_id", (req, res) => {
  let newTags;
  roadmapPlans
    .findById(req.params.plan_id)
    .then((plan) => {
      const newTagsStr = req.body.newTags;
      newTags = newTagsStr.split(",").filter((elem) => {
        return !plan.tags.includes(elem);
      });
      roadmapPlans
        .findByIdAndUpdate(
          req.params.plan_id,
          { $push: { tags: { $each: newTags } } },
          { new: true }
        )
        .then((roadmapPlan) => returnData(roadmapPlan, res));
    })
    .catch((err) => errorHandler(res, 404, err));
});

// removes one or more tags from the list of tags for this plan
// tags should be sent as a single string, seperated by commas (with no spaces)
router.patch("/api/roadmapPlans/removeTags/:plan_id", (req, res) => {
  const tagsStr = req.body.tags;
  const removals = tagsStr.split(",");
  roadmapPlans
    .findByIdAndUpdate(
      req.params.plan_id,
      { $pull: { tags: { $in: removals } } },
      { new: true }
    )
    .then((roadmapPlan) => returnData(roadmapPlan, res))
    .catch((err) => errorHandler(res, 404, err));
});

router.patch("/api/roadmapPlans/allowComments/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  roadmapPlans
    .findByIdAndUpdate(plan_id, { allowComments: true })
    .then((found) => returnData(found, res));
});

router.patch("/api/roadmapPlans/disallowComments/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  roadmapPlans
    .findByIdAndUpdate(plan_id, { allowComments: false })
    .then((found) => returnData(found, res));
});

router.patch("/api/roadmapPlans/makeAnonymous/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  roadmapPlans
    .findByIdAndUpdate(plan_id, { anonymous: true })
    .then((found) => returnData(found, res));
});

router.patch("/api/roadmapPlans/makeNonAnonymous/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  roadmapPlans
    .findByIdAndUpdate(plan_id, { anonymous: false })
    .then((found) => returnData(found, res));
});

// likes/unlikes a roadmap plan
// user_id required in body
// returns the number of likes the plan has
router.patch("/api/roadmapPlans/like/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  const user_id = req.body.user_id;
  users
    .findById(user_id)
    .then((found) => {
      if (!found.liked_roadmap_plans) {
        found.liked_roadmap_plans = [];
      }
      const index = found.liked_roadmap_plans.indexOf(plan_id);
      if (index > -1) {
        found.liked_roadmap_plans.splice(index, 1);
        found.save();
        roadmapPlans
          .findByIdAndUpdate(
            plan_id,
            { $inc: { num_likes: -1 } },
            { new: true }
          )
          .then((roadmapPlan) => returnData(roadmapPlan.num_likes, res));
      } else {
        found.liked_roadmap_plans.push(plan_id);
        found.save();
        roadmapPlans
          .findByIdAndUpdate(plan_id, { $inc: { num_likes: 1 } }, { new: true })
          .then((roadmapPlan) => returnData(roadmapPlan.num_likes, res));
      }
    })
    .catch((err) => errorHandler(res, 404, err));
});

module.exports = router;
