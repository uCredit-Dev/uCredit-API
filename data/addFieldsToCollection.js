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

//addFieldsToCollection(courses);
//addPostReqsToSISCourse(SISCV);
//updateFieldsInCollection(plans, {}, { reviewers: [] });
//updateFieldsInCollection(users, {}, { whitelisted_plan_ids: [] });
//setLevelInCourses();
//setVersionInCourses();
setPostReqsInSISCourses();
// setPostReqsInCourses();
//setPostReqsInSISCoursesVersioning();
// setPostReqsInCoursesVersioning();
async function addFieldsToCollection(model) {
  await db.connect();
  model
    .find()
    .then((collection) => {
      collection.forEach(async (doc) => {
        doc.postReq = [];
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
  Each post requisite version of a course is marked as post req to any
  version that occurs before or during the same semester, if the pre req
  is in the string.
*/
async function setPostReqsInSISCoursesVersioning() {
  await db.connect();
  const sisCourses = await SISCV.find();
  for (let course of sisCourses) {
    const postReqCourses = await SISCV.find({
      versions: {
        $elemMatch: {
          preReq: { $elemMatch: { Expression: { $regex: course.number } } },
        },
      },
    });
    for (let matchedCourse of postReqCourses) {
      for (let preReqVersion of course.versions) {
        let postReqs = {
          courseId: matchedCourse.id,
          number: matchedCourse.number,
          title: matchedCourse.title,
          versions: [],
        };
        let postReqVersionCounter = 0;
        for (let postReqVersion of matchedCourse.versions) {
          if (!compareDates(preReqVersion.term, postReqVersion.term)) {
            continue;
          }
          for (let preReq of postReqVersion.preReq) {
            if (
              preReq.IsNegative === 'N' &&
              preReq.Expression.indexOf(course.number) !== -1
            ) {
              postReqs.versions.push({
                credits: postReqVersion.credits,
                preReqs: preReq.Expression,
                term: postReqVersion.term,
              });
              postReqVersionCounter++;
            }
          }
        }
        if (postReqVersionCounter > 0) {
          preReqVersion.postReq.push(postReqs);
        }
      }
    }
    await course.save();
  }
  console.log('done');
}

//returns true if version1(ex: Fall 2022) is before version2(ex: Intersession 2023)
function compareDates(version1, version2) {
  const v1 = version1.split(' ');
  const v2 = version2.split(' ');
  if (v1[0] === 'Fall') {
    v1[1] = parseInt(v1[1]) + 1;
  }
  if (v2[0] === 'Fall') {
    v2[1] = parseInt(v2[1]) + 1;
  }
  if (v1[1] < v2[1]) {
    return true;
  } else if (v1[1] === v2[1]) {
    return v1[0].toLowerCase().localeCompare(v2[0].toLowerCase()) <= 0;
  } else {
    return false;
  }
}

/* 
  Script to set post req field of each current course by looking for corresponding sis course.
*/
async function setPostReqsInCoursesVersioning() {
  await db.connect();
  const userCourseList = await courses.find();
  for (let course of userCourseList) {
    const sisCourses = await SISCV.find({
      title: course.title,
      number: course.number,
    });
    for (let matchedCourse of sisCourses) {
      for (let version of matchedCourse.versions) {
        if (course.version === version.term) {
          course.postReq = version.postReq;
          continue;
        }
      }
    }
  }
  console.log('done');
}

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
