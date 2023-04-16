// helper methods for updating distributions
import Courses from '../model/Course.js';
import Distributions from '../model/Distribution.js';
import Majors from '../model/Major.js';
import Plans from '../model/Plan.js';
import FineRequirements from '../model/FineRequirement.js';

// Adds new distributions to plan if new major is added
async function addPlanDistributions(plan) {
  for (let major_id of plan.major_ids) {
    // check if user major already has distribution objs
    const userDistributions = await Distributions.find({
      plan_id: plan._id,
      major_id,
    });
    if (userDistributions.length > 0) continue;
    // else add distribution objs based on Major
    await initDistributions(plan._id, major_id);
  }
}

// call to delete any dists and fines not associated with any major
async function removePlanDistributions(plan) {
  // remove dists and fineReqs for deleted major, if any
  let distributions = await Distributions.find({ plan_id: plan._id }).exec();
  for (let dist of distributions) {
    if (!plan.major_ids.includes(dist.major_id)) {
      // maintain courses array fields
      await Courses.updateMany(
        { plan_id: plan._id },
        { $pull: { distribution_ids: dist._id } },
      ).exec();
      for (let fine_id of dist.fineReq_ids) {
        await Courses.updateMany(
          { plan_id: plan._id },
          { $pull: { fineReq_ids: fine_id } },
        ).exec();
      }
      // delete documents
      await FineRequirements.deleteMany({ distribution_id: dist._id }).exec();
      await Distributions.findByIdAndDelete(dist._id).exec();
    }
  }
}

// add a major's distributions to user's plan
async function addMajorDistributions(plan, major) {
  for (let majorDist of major.distributions) {
    // create new distribution documents
    const body = {
      major_id: major._id,
      plan_id: plan._id,
      user_id: plan.user_id,
      name: majorDist.name,
      required_credits: majorDist.required_credits,
      description: majorDist.description,
      criteria: majorDist.criteria,
      min_credits_per_course: majorDist.min_credits_per_course,
      // optional fields
      user_select: majorDist.user_select,
      pathing: majorDist.pathing,
      double_count: majorDist.double_count,
    };
    const distribution = await Distributions.create(body);
    // create new fine requirement documents
    for (let majorFine of majorDist.fine_requirements) {
      const body = {
        description: majorFine.description,
        required_credits: majorFine.required_credits,
        criteria: majorFine.criteria,
        plan_id: plan._id,
        major_id: major._id,
        distribution_id: distribution._id,
      };
      const fine = await FineRequirements.create(body);
      distribution.fineReq_ids.push(fine._id);
    }
    await distribution.save();
  }
}

// update removed course's distributions and fine requirements
async function removeCourseFromDistributions(course) {
  // update fines
  for (let fine_id of course.fineReq_ids) {
    await updateFineCredits(fine_id);
  }
  // update dists
  for (let dist_id of course.distribution_ids) {
    await updateDistCredits(dist_id);
  }
}

// initializes dists and fines for plan and major specified
async function initDistributions(plan_id, major_id) {
  // delete existing
  await initCleanup(plan_id, major_id);
  // create new
  const major = await Majors.findById(major_id);
  const plan = await Plans.findById(plan_id);
  if (!major || !plan) {
    console.log('ERROR: major or plan not found in initDistributions');
    return;
  }

  await addMajorDistributions(plan, major);
  // get all distributions
  const distributions = await Distributions.find({ plan_id, major_id });
  const courses = await Courses.find({ plan_id });

  // add each course to all dists
  for (let course of courses) {
    await addCourseToDists(course, distributions);
  }
  const promises = distributions.map((dist) => dist.save());
  await Promise.all(promises);
}

// add a single course to multiple finereqs
async function addCourseToFines(course, fines) {
  // add to fine requirements
  let allowed = ['All'];
  const promises = fines.map((fine) => {
    if (!checkCriteriaSatisfied(fine.criteria, course))
      return Promise.resolve();
    if (allowed.includes('All') || allowed.includes(fine.description)) {
      // if satisfied don't update fine
      if (fine.satisfied) {
        // but still update course
        course.fineReq_ids.push(fine._id);
        return Promise.resolve();
      }
      // udpate double count info
      allowed = fine.double_count;
      addCourseToFine(course, fine);
      return fine.save();
    }
  });
  await Promise.all(promises);
}

// add a single course to distributions
async function addCourseToDists(course, distributions) {
  let allowed = ['All'];
  for (let dist of distributions) {
    if (dist.min_credits_per_course > course.credits) continue;
    if (!checkCriteriaSatisfied(dist.criteria, course)) continue;
    if (allowed.includes('All') || allowed.includes(dist.name)) {
      if (dist.satisfied) {
        // do note this course can satisfy criteria
        course.distribution_ids.push(dist._id);
      } else {
        // udpated double count info
        allowed = dist.double_count;
        // update dist
        await addCourseToDist(course, dist);
      }
    }
  }
  await course.save();
}

// cleanup before initializing distributions
const initCleanup = async (plan_id, major_id) => {
  // remove dist ids from courses
  let toDelete = await Distributions.find({ plan_id, major_id });
  for (let dist of toDelete) {
    await Courses.updateMany(
      { plan_id },
      { $pull: { distribution_ids: dist._id } },
    );
  }
  // remove fine ids from courses
  toDelete = await FineRequirements.find({ plan_id, major_id });
  for (let fine of toDelete) {
    await Courses.updateMany({ plan_id }, { $pull: { fineReq_ids: fine._id } });
  }
  // delete documents
  await Distributions.deleteMany({ plan_id, major_id });
  await FineRequirements.deleteMany({ plan_id, major_id });
};

// add single course to distribution
// pre: course is known to satisfy dist
const addCourseToDist = async (course, dist) => {
  course.distribution_ids.push(dist.id);
  let fines = await FineRequirements.find({ distribution_id: dist._id });
  if (fines) await addCourseToFines(course, fines);
  // update dist
  dist.planned += course.credits;
  updateSatisfied(dist, fines);
};

// helper function to add single course to fine req
// pre: course is known to satisfy fine
const addCourseToFine = (course, fine) => {
  // update course
  course.fineReq_ids.push(fine._id);
  // update fine
  fine.planned += course.credits;
  fine.satisfied = fine.planned >= fine.required_credits;
  if (fine.satisfied) fine.planned = fine.required_credits;
};

// update planned and satisfied after a course deletion
// pre: course is known to satisfy dist
const updateDistCredits = async (dist_id) => {
  const dist = await Distributions.findById(dist_id).exec();
  const fines = await FineRequirements.find({ distribution_id: dist_id });
  // if satisfied recalculate total
  const courses = await Courses.find({ distribution_ids: dist_id });
  let sum = 0;
  courses.forEach((course) => (sum += course.credits));
  dist.planned = sum;
  // update satisfied
  updateSatisfied(dist, fines);
  await dist.save();
};

// helper function to remove single course from distribution
// pre: course is known to satisfy dist
const updateFineCredits = async (f_id) => {
  const fine = await FineRequirements.findById(f_id).exec();
  // if satisfied recalculate total
  const courses = await Courses.find({ fineReq_ids: f_id });
  let sum = 0;
  courses.forEach((course) => (sum += course.credits));
  fine.planned = sum;
  // update satisfied
  fine.satisfied = fine.planned >= fine.required_credits;
  if (fine.satisfied) fine.planned = fine.required_credits;
  await fine.save();
};

// updates distribution.satisfied
const updateSatisfied = (distribution, fines) => {
  if (distribution.planned >= distribution.required_credits) {
    distribution.planned = distribution.required_credits;
    if (distribution.pathing) {
      distribution.satisfied = processPathing(distribution, fines);
    } else {
      distribution.satisfied = checkAllFines(fines);
    }
  } else {
    distribution.satisfied = false;
  }
};

// updates a distribution's satisfied, if pathing condition is met
const processPathing = (distribution, fines) => {
  let numPaths = distribution.pathing;
  for (let fine of fines) {
    if (fine.satisfied) {
      numPaths -= 1;
      if (numPaths <= 0) return true;
    }
  }
  return false;
};

// returns true if all fine requirements of a distribution are satisfied
const checkAllFines = (fines) => {
  if (fines.length == 0) return true;
  for (let fine of fines) {
    if (!fine.satisfied) return false;
  }
  return true; // all fines satisfied
};

// returns if a course satisfies a criteria
const checkCriteriaSatisfied = (criteria, course) => {
  if (criteria === null || criteria.length === 0 || criteria === 'N/A') {
    return true;
  }
  const splitArr = splitRequirements(criteria);
  const boolExpr = getCriteriaBoolExpr(splitArr, course);
  return boolExpr.length !== 0 ? eval(boolExpr) : false;
};

// returns a string expression of whether a course satisfies a criteria
const getCriteriaBoolExpr = (splitArr, course) => {
  let boolExpr = '';
  let index = 0;
  let concat = '';
  if (course === null) {
    return concat;
  }
  while (index < splitArr.length) {
    if (splitArr[index] === '(') {
      concat = '(';
    } else if (splitArr[index] === ')') {
      concat = ')';
    } else if (splitArr[index] === 'OR') {
      concat = '||';
    } else if (splitArr[index] === 'AND') {
      concat = '&&';
    } else if (splitArr[index] === 'NOT') {
      concat = index == 0 ? '!' : '&&!';
    } else {
      concat = handleTagType(splitArr, index, course);
    }
    if (concat.length > 3) {
      index = index + 2;
    } else index++;
    boolExpr = boolExpr.concat(concat); // Causing issues with biology major.
  }
  return boolExpr;
};

// handles different tags (C, T, D, Y, A, N, W, L) in criteria string
const handleTagType = (splitArr, index, course) => {
  let updatedConcat;
  switch (splitArr[index + 1]) {
    case 'C': // Course Number
      updatedConcat = (
        course.number !== undefined && course.number.includes(splitArr[index])
      ).toString();
      break;
    case 'T': // Tag
      updatedConcat = (
        course?.tags !== undefined && course.tags.includes(splitArr[index])
      ).toString();
      break;
    case 'D': // Department
      updatedConcat = (course.department === splitArr[index]).toString();
      break;
    case 'Y': // Year
      //TODO: implement for year.
      updatedConcat = 'false';
      break;
    case 'A': // Area
      updatedConcat = (
        course.areas !== undefined &&
        course.areas !== 'None' &&
        course.areas.includes(splitArr[index])
      ).toString();
      break;
    case 'N': // Name
      updatedConcat = (
        course.title !== undefined && course.title.includes(splitArr[index])
      ).toString();
      break;
    case 'W': //Written intensive
      updatedConcat = (course.wi !== undefined && course.wi).toString();
      break;
    case 'L': // Level
      updatedConcat = handleLCase(splitArr, index, course);
      break;
    default:
      updatedConcat = 'false';
  }
  return updatedConcat;
};

// Handles the L case in the getBoolExpr function
const handleLCase = (splitArr, index, course) => {
  let updatedConcat = false;
  if (splitArr[index].includes('Upper')) {
    updatedConcat = course.level.includes('Upper');
  } else if (splitArr[index].includes('Lower')) {
    updatedConcat = course.level.includes('Upper');
  } else {
    updatedConcat =
      course.number !== undefined && course.number[7] === splitArr[index][0];
  }
  return updatedConcat.toString();
};

// args: expression for requirments
// returns: an array where each entry is one of a requirement (always followed by type of requirement), parentheses, OR/AND,
const splitRequirements = (expr) => {
  let out = [];
  let index = 0;
  while (index < expr.length) {
    let pair = getNextEntry(expr, index);
    out.push(pair[0]);
    index = pair[1];
  }
  return out;
};

// args: expr to parse, index that we are currently on
// returns: the next piece, along with the index of start of the next next piece
const getNextEntry = (expr, index) => {
  if (expr[index] === '(') {
    return ['(', index + 1];
  } else if (expr[index] === ')') {
    return [')', index + 1];
  } else if (expr[index] === '[') {
    return [expr[index + 1], index + 3];
  } else if (expr[index] === '^') {
    if (expr[index + 1] === 'O') {
      return ['OR', index + 4];
    } else if (expr[index + 1] === 'A') {
      return ['AND', index + 5];
    } else {
      return ['NOT', index + 5];
    }
  }
  let out = expr[index];
  index++;
  while (index < expr.length) {
    if (
      expr[index] === '(' ||
      expr[index] === ')' ||
      expr[index] === '[' ||
      expr[index] === '^'
    ) {
      return [out, index];
    }
    out = out.concat(expr[index]);
    index++;
  }
  return [out, index];
};

export {
  initDistributions,
  removeCourseFromDistributions,
  addPlanDistributions,
  removePlanDistributions,
  addCourseToDists,
  splitRequirements,
  getCriteriaBoolExpr,
};
