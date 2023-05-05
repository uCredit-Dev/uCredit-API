import { updateFieldsInCollection } from './updateFieldsInCollection.js';
import {
  addPlanDistributions,
  initDistributions,
} from '../routes/distributionMethods.js';
import * as db from './db.js';
import Courses from '../model/Course.js';
import SISCV from '../model/SISCourseV.js';
import Plans from '../model/Plan.js';
import Years from '../model/Year.js';
import Distributions from '../model/Distribution.js';
import FineRequirements from '../model/FineRequirement.js';
import mongoose from 'mongoose';

mongoose.set('strictQuery', false);
// updateModels();
// setDepartmentInCourses();
// setTagInCourses();
// addDistributions();

// NOTE: FineRequirements and Distributions (and Majors) are collections with 0 documents
// They should not need any updating.

// UPDATE fields on models
async function updateModels() {
  try {
    // update course schema
    await updateFieldsInCollection(
      Courses,
      { area: { $exists: true } },
      { $rename: { area: 'areas' } },
    );
    await updateFieldsInCollection(Courses, {}, { distribution_ids: [] });
    await updateFieldsInCollection(Courses, {}, { fineReq_ids: [] });
    // // update plan schema
    await updateFieldsInCollection(
      Plans,
      {},
      { $rename: { majors: 'major_ids' } },
    );
    await updateFieldsInCollection(
      Plans,
      {},
      { $unset: { distribution_ids: '' } },
    );
    // // update year schema
    await db.connect();
    const years = await Years.find({}).exec();
    console.log(years.length, ' year documents matched.');
    let count = 0;
    for (let year of years) {
      console.log(year.plan_id, Array.isArray(year.plan_id));
      if (year.plan_id && Array.isArray(year.plan_id)) {
        console.log(year.plan_id[0]);
        year.plan_id = year.plan_id[0];
        await year.save();
        count++;
      }
    }
    console.log(count, ' year documents modified.');
  } catch (err) {
    console.log(err);
  }
}

async function setDepartmentInCourses() {
  await db.connect();
  let updated = 0;
  // find courses without a level field
  Courses.find({ department: { $exists: false } })
    .then(async (res) => {
      console.log(res.length);
      for (let course of res) {
        let courseFromDB = await SISCV.findOne({
          number: course.number,
          title: course.title,
        }).exec();
        if (courseFromDB) {
          // update based on SIS course if available
          updated++;
          course.department = courseFromDB.versions[0].department;
        } else {
          // update based on course number
          course.department = 'Unspecified';
        }
        await course.save();
      }
      console.log('matched: %d', res.length);
      console.log('updated from SISCourseV: %d', updated);
      console.log('updated unspecified: %d', res.length - updated);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function setTagInCourses() {
  await db.connect();
  let updated = 0;
  // find courses without a level field
  Courses.find({})
    .then(async (res) => {
      console.log(res.length);
      for (let course of res) {
        let courseFromDB = await SISCV.findOne({
          number: course.number,
          title: course.title,
        }).exec();
        if (courseFromDB) {
          // update based on SIS course if available
          updated++;
          course.tags = courseFromDB.versions[0].tags;
        }
        await course.save();
      }
      console.log('matched: %d', res.length);
      console.log('updated from SISCourseV: %d', updated);
    })
    .catch((err) => {
      console.log(err);
    });
}

// delete all Distributions Documents
async function deleteDistributionsDocuments() {
  await db.connect(); // comment out this line before running jest test
  Distributions
    .deleteMany({})
    .then(() => {
      console.log('Distributions documents deleted');
    })
    .catch((error) => {
      console.log(error);
    });
}

// delete all Distributions Documents
async function deleteFineRequirementsDocuments() {
  await db.connect(); // comment out this line before running jest test
  FineRequirements
    .deleteMany({})
    .then(() => {
      console.log('Fine Requirements documents deleted');
    })
    .catch((error) => {
      console.log(error);
    });
}

// create new distribution documents
async function addDistributions() {
  await db.connect();
  await Plans.find({}).then(async (plans) => {
    for (let plan of plans) {
      await addPlanDistributions(plan);
    }
    console.log(plans.length);
  });
}

// add courses to distributions of all plans
async function addAllCourses() {
  const plans = await Plans.find({});
  for (let plan of plans) {
    for (let m_id of plan.major_ids) {
      initDistributions(plan._id, m_id);
    }
  }
}

export { updateModels, addDistributions, addAllCourses };
