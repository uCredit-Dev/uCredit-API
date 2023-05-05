import { connect } from './db.js';
import User from '../model/User.js';
import Plan from '../model/Plan.js';

// replace old major names with new ones
async function renameOldWithNew() {
  connect();

  const users = await User.find({});
  for (let user of users) {
    for (let plan_id of user.plan_ids) {
      let plan = await Plan.findById(plan_id).exec();
      if (plan !== null && plan.majors != null && plan.majors.length > 0) {
        // console.log("before: " + plan.majors);
        for (let ind in plan.majors) {
          let major = plan.majors[ind];
          if (major.includes('B.A. Computer Science (NEW - 2021 & after)')) {
            plan.majors[ind] = 'B.A. Computer Science';
          } else if (
            major.includes('B.S. Computer Science (OLD - Pre-2021)') ||
            major.includes('B.S. Computer Science (NEW - 2021 & after)')
          ) {
            plan.majors[ind] = 'B.S. Computer Science';
          } else if (
            major.includes('Minor Computer Science (OLD - Pre-2021)')
          ) {
            plan.majors[ind] = 'Minor Computer Science';
          } else if (
            major.includes('Minor Computer Science (NEW - 2021 & after)')
          ) {
            plan.majors[ind] = 'Minor Computer Science';
          } else if (
            major.includes(
              'Minor Applied Mathematics & Statistics (OLD - Pre-2021)',
            ) ||
            major.includes(
              'Minor Applied Mathematics & Statistics (NEW - 2021 & after)',
            )
          ) {
            plan.majors[ind] = 'Minor Applied Mathematics & Statistics';
          }
        }
        plan.majors = [...new Set(plan.majors)];
        // console.log("after: " + plan.majors + "");
        // console.log("done!\n");
      }
      if (
        plan !== null &&
        plan.major_ids != null &&
        plan.major_ids.length > 0
      ) {
        console.log('before: ' + plan.major_ids);
        for (let ind in plan.major_ids) {
          let major = plan.major_ids[ind];
          if (major.includes('B.A. Computer Science (NEW - 2021 & after)')) {
            plan.major_ids[ind] = 'B.A. Computer Science';
          } else if (
            major.includes('B.S. Computer Science (OLD - Pre-2021)') ||
            major.includes('B.S. Computer Science (NEW - 2021 & after)')
          ) {
            plan.major_ids[ind] = 'B.S. Computer Science';
          } else if (
            major.includes('Minor Computer Science (OLD - Pre-2021)')
          ) {
            plan.major_ids[ind] = 'Minor Computer Science';
          } else if (
            major.includes('Minor Computer Science (NEW - 2021 & after)')
          ) {
            plan.major_ids[ind] = 'Minor Computer Science';
          } else if (
            major.includes(
              'Minor Applied Mathematics & Statistics (OLD - Pre-2021)',
            ) ||
            major.includes(
              'Minor Applied Mathematics & Statistics (NEW - 2021 & after)',
            )
          ) {
            plan.major_ids[ind] = 'Minor Applied Mathematics & Statistics';
          }
        }
        plan.major_ids = [...new Set(plan.major_ids)];
        console.log('after: ' + plan.major_ids + '');
        console.log('done!\n');
      }
      await plan.save();
    }
  }
  console.log('done');
}

replaceOldWithNew();

async function checkResult() {
  connect();

  const users = await User.find({});
  for (let user of users) {
    for (let plan_id of user.plan_ids) {
      let plan = await Plan.findById(plan_id).exec();
      if (plan !== null && plan.majors != null && plan.majors.length > 0) {
        console.log(plan.majors);
      }
    }
  }
}

// checkResult();
