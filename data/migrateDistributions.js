const {
  addFieldsToCollection,
  updateFieldsInCollection,
} = require("./addFieldsToCollection.js");
const {
  addPlanDistributions,
  addCourses,
} = require("./distributionMethods.ts");
const db = require("./db");
const Courses = require("../model/Course.js");
const Distributions = require("../model/Distribution.js");
const FineRequirements = require("../model/FineRequirement.js");
const Majors = require("../model/Major.js");
const Plans = require("../model/Plan.js");
const Years = require("../model/Year.js");

// NOTE: FineRequirements and Distributions (and Majors) are collections with 0 documents
// They should not need any updating. 

// UPDATE fields on models
async function updateModels() {
  // rename fields
  await updateFieldsInCollection(
    Plans,
    {},
    { $rename: { majors: "major_ids" } }
  );
  await updateFieldsInCollection(Courses, {}, { $rename: { area: "areas" } });
  // update plan_id type from ObjectId[] to ObjectId
  Years.find({}).forEach(function (year) {
    // await ?
    year.plan_id = year.plan_id[0];
    Years.save(year);
  });
  // delete fields
  await updateFieldsInCollection(
    Plans,
    {},
    { $unset: { distribution_ids: "" } }
  );
  // ADD new fields to models
  await addFieldsToCollection(Courses); // areas and fineReq_ids
  await addFieldsToCollection(Plans); // major_ids
}

// delete all documents in distributions collection
async function dropDistributions() {
  mongoose.connection.db.collection("Distributions").drop(() => {
    mongoose.connection.close(() => done());
  });
}

// create new distribution documents
async function addDistributions() {
  await Plans.find({}).then((plans) => {
    for (let plan of plans) {
      addPlanDistributions(plan);
    }
  });
}

// add courses to distributions of all plans 
async function addAllCourses() {
  await Plans.find({}).then((plans) => {
    for (let plan of plans) {
      for (let m_id of plan.major_ids) {
        addCourses(plan._id, m_id); 
      }
    }
  });
}

module.exports = {
  updateModels, 
  dropDistributions, 
  addDistributions, 
  addAllCourses
};