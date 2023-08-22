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

addFieldsToCollection(courses);
//updateFieldsInCollection(plans, {}, { reviewers: [] });
//updateFieldsInCollection(users, {}, { whitelisted_plan_ids: [] });
//setLevelInCourses();
//setVersionInCourses();
//setPostReqsInSISCourses();
//setPostReqsInCourses();

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

async function addPostReqsToSISCourse(model) {
  await db.connect();
  model
    .find()
    .then((collection) => {
      collection.forEach(async (doc) => {
        doc.postReq = [];
        for (let version of doc.versions) {
          version.postReq = [];
        }
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
  model.updateMany(matchCriteria, modification).then((res) => {
    console.log(res.matchedCount, 'documents matched.');
    console.log(res.modifiedCount, 'documents modified.');
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
  Script to calculate the post reqs for each sis course.
*/
async function setPostReqsInSISCourses() {
  await db.connect();
  var counter = 0;
  SISCV.find({ version: { $elemMatch: { postReq: { $size: 0 } } } }).then(
    async (res) => {
      for (let course of res) {
        let postReqs = [];
        await SISCV.find({
          versions: {
            $elemMatch: {
              preReq: { $elemMatch: { Expression: { $regex: course.number } } },
            },
          },
        }).then(async (res2) => {
          for (let matchedCourse of res2) {
            for (let preReq of matchedCourse.versions[0].preReq) {
              if (preReq.IsNegative === 'N') {
                postReqs.push({
                  courseId: matchedCourse.id,
                  number: matchedCourse.number,
                  title: matchedCourse.title,
                  credits: matchedCourse.versions[0].credits,
                  preReqs: preReq.Expression,
                });
                break;
              }
            }
          }
        });
        counter++;
        for (let version of course.versions) {
          version.postReq = postReqs;
        }
        if (counter % 10 === 0) {
          console.log(course.title);
        }
        await course.save();
      }
    },
  );
  console.log('done');
}

/* 
  Script to set post req field of each current course by looking for corresponding sis course.
*/
async function setPostReqsInCourses() {
  await db.connect();
  courses.find().then(async (res) => {
    for (let course of res) {
      let postReqs = [];
      await SISCV.find({ title: course.title, number: course.number }).then(
        async (res2) => {
          for (let matchedCourse of res2) {
            for (let version of matchedCourse.versions) {
              course.postReq = version.postReq;
              continue;
            }
          }
        },
      );
      console.log(course.title);
      await course.save();
    }
  });
  console.log('done');
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
