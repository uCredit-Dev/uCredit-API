/*
    If you want to add fields to the entire collection/model, 
    add them to the schema first and make sure they have a default value.
    Then run this script with the model you want to update.
*/

const db = require("./db");
const plans = require("../model/Plan.js");
const users = require("../model/User.js");
const courses = require("../model/Course.js"); 
const SISCV = require("../model/SISCourseV"); 

//addFieldsToCollection(users);
//updateFieldsInCollection(plans, {}, { reviewers: [] });
//updateFieldsInCollection(users, {}, { whitelisted_plan_ids: [] });
setLevelInCourses();

async function addFieldsToCollection(model) {
  await db.connect();
  model
    .find()
    .then((collection) => {
      collection.forEach((doc) => {
        doc.save();
      });
      console.log(
        "Done! Check DB to confirm the field has been added to all documents."
      );
    })
    .catch((err) => console.log(err));
}

/*
  matchCriteria: an object that filters the document
  modification: an object that specificed the modified field and its new value
*/
async function updateFieldsInCollection(model, matchCriteria, modification) {
  await db.connect();
  model.updateMany(matchCriteria, modification).then((res) => {
    console.log(res.matchedCount, "documents matched.");
    console.log(res.modifiedCount, "documents modified.");
  });
}

/* 
  Script to add the 'level' field based on the matching SISCourseV document 
  To update courses prior to the schema change (added new level field)
*/ 
async function setLevelInCourses() {
  await db.connect();
  let updated = 0; 
  // find courses without a level field 
  courses.find({ level: { $exists: false } }).then(async (res) => {
    console.log(res.length);
    for (let course of res) {
      let courseFromDB = await SISCV.findOne({
        number: course.number,
        title: course.title,
      }).exec();
      if (courseFromDB) {
        // update based on SIS course if available 
        updated++; 
        course.level = courseFromDB.versions[0].level; 
      } else {
        // update based on course number 
        if (course.number && course.number.length > 7 && !isNaN(course.number[7])) {
          if (course.number[7] <= '2') {
            course.level = "Lower Level Undergraduate"
          } else {
            course.level = "Upper Level Undergraduate"
          } 
        } else {
          course.level = "Lower Level Undergraduate"
        }
      }
      console.log(course.title + ": " + course.level);
      course.save(); 
    } 
    console.log('matched: %d', res.length); 
    console.log('updated from SISCourseV: %d', updated); 
    console.log('updated from course number: %d', res.length - updated); 
  }); 
}