/*
    If you want to add fields to the entire collection/model, 
    add them to the schema first and make sure they have a default value.
    Then run this script with the model you want to update.
*/

import * as db from './db.js';
import plans from '../model/Plan.js';
import users from '../model/User.js';
import courses from '../model/Course.js';
import SISCV from '../model/SISCourseV.js';
import years from '../model/Year.js';

//addFieldsToCollection(users);
//updateFieldsInCollection(plans, {}, { reviewers: [] });
//updateFieldsInCollection(users, {}, { whitelisted_plan_ids: [] });
// setLevelInCourses();
// setVersionInCourses();

async function addFieldsToCollection(model) {
  await db.connect();
  model
    .find()
    .then((collection) => {
      collection.forEach(async (doc) => {
        await doc.save();
      });
      console.log(
        'Done! Check DB to confirm the field has been added to all documents.',
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
  const res = await model
    .updateMany(matchCriteria, modification, { strict: false })
    .exec();
  if (!res.acknowledged) {
    console.log('err updating field with ', { matchCriteria, modification });
  } else {
    console.log(res.matchedCount, 'documents matched.');
    console.log(res.modifiedCount, 'documents modified.');
  }
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
        if (
          course.number &&
          course.number.length > 7 &&
          !isNaN(course.number[7])
        ) {
          if (course.number[7] <= '2') {
            course.level = 'Lower Level Undergraduate';
          } else {
            course.level = 'Upper Level Undergraduate';
          }
        } else {
          course.level = 'Lower Level Undergraduate';
        }
      }
      console.log(course.title + ': ' + course.level);
      await course.save();
    }
    console.log('matched: %d', res.length);
    console.log('updated from SISCourseV: %d', updated);
    console.log('updated from course number: %d', res.length - updated);
  });
}

/* 
  Script to add the 'version' field based on term and year fields 
*/
async function setVersionInCourses() {
  await db.connect();
  let updated = 0;
  courses.find({ version: { $exists: false } }).then(async (res) => {
    console.log(res.length);
    for (let course of res) {
      updated++;
      let version = course.term.toLowerCase();
      const year = await years.findById(course.year_id);
      version =
        version.charAt(0).toUpperCase() + version.slice(1) + ' ' + year.year;
      course.version = version;
      console.log(course.title + ': ' + course.version);
      await course.save();
    }
    console.log('matched: %d', res.length);
    console.log('updated: %d', updated);
  });
}

export { updateFieldsInCollection };
