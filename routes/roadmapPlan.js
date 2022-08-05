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
  const old_plan_id = req.body.id;
  const roadmap_description = req.body.desc;
  plans
    .findById(old_plan_id)
    .then(async (original_plan) => {
      // extract simple fields from the plan
      let roadmap_data = getPlanDataForClone(original_plan);
      roadmap_data.description = roadmap_description;
      // now clone the linked distribution documents, and courses within them
      let new_distributions = [];
      // below is used to preserve the many-many relation between distributions
      // and courses, and the fact that the same courses are related to years
      let old_to_new_course_map = new Map();
      // for used instead of forEach because it handles await better
      const old_distribution_ids = original_plan.distribution_ids;
      for (let i = 0; i < old_distribution_ids.length; i++) {
        const old_dist_id = old_distribution_ids[i];
        const old_dist = await distributions.findById(old_dist_id);
        if (old_dist === null) {
          continue;
        }
        const distribution_data = getDistributionDataForClone(old_dist);
        let created_dist = await distributions.create(distribution_data);
        new_distributions.push(created_dist._id);
        await cloneEmbeddedCourses(
          old_to_new_course_map,
          old_dist.courses,
          new_dist.courses
        );
      }
      roadmap_data.distribution_ids = new_distributions;
      // now clone the linked year documents, and courses within them
      let new_years = [];
      const old_year_ids = original_plan.year_ids;
      for (let i = 0; i < old_year_ids.length; i++) {
        const old_year = await years.findById(old_year_ids[i]);
        const year_data = getYearDataForClone(old_year);
        let created_year = await years.create(year_data);
        new_years.push(created_year._id);
        await cloneEmbeddedCourses(
          old_to_new_course_map,
          old_year.courses,
          created_year.courses
        );
      }
      roadmap_data.year_ids = new_years;
      // now create the plan, and set references in subdocuments
      roadmapPlans.create(roadmap_data).then(async (created_roadmap_plan) => {
        const new_course_ids = Array.from(old_to_new_course_map.values());
        const courseUpdate = courses.updateMany(
          { _id: { $in: new_course_ids } },
          { $set: { plan_id: created_roadmap_plan._id } }
        );
        const yearUpdate = years.updateMany(
          { _id: { $in: new_years } },
          { $set: { plan_id: [created_roadmap_plan._id] } }
        );
        const distUpdate = distributions.updateMany(
          { _id: { $in: new_distributions } },
          { $set: { plan_id: created_roadmap_plan._id } }
        );
        await Promise.all([courseUpdate, yearUpdate, distUpdate]);
        returnData(created_roadmap_plan, res);
      });
    })
    .catch((err) => errorHandler(res, 400, err));
});

const cloneEmbeddedCourses = async (
  old_to_new_course_map,
  old_course_ids,
  new_course_array
) => {
  for (let j = 0; j < old_course_ids.length; j++) {
    // if the course has already been cloned, use that. Else, clone it
    if (old_to_new_course_map.has(old_course_ids[j])) {
      new_course_array.push(old_to_new_course_map.get(old_course_ids[j]));
    } else {
      const old_course = await courses.findById(old_course_ids[j], {
        _id: 0,
      });
      const insert_result = await courses.insertMany(old_course);
      const new_course_id = insert_result._id;
      new_course_array.push(new_course_id);
      old_to_new_course_map.set(old_course_ids[j], new_course_id);
    }
  }
};

const getPlanDataForClone = (plan) => {
  let data = {
    original: plan.id,
    name: plan.name,
    majors: plan.majors.slice(),
    user_id: plan.user_id,
    expireAt: plan.expireAt,
  };
  return data;
};

const getDistributionDataForClone = (distribution) => {
  let data = {
    name: distribution.name,
    required: distribution.required,
    planned: distribution.planned,
    current: distribution.current,
    satisfied: distribution.satisfied,
    courses: distribution.courses,
    user_id: distribution.user_id,
    expireAt: distribution.expireAt,
  };
  return data;
};

const getYearDataForClone = (year) => {
  let data = {
    name: year.name,
    user_id: year.user_id,
    expireAt: year.expireAt,
    year: year.year,
    courses: year.courses,
  };
  return data;
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
