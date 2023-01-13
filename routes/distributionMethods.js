// helper methods for updating distributions 
import Courses from "../model/Course.js";
import Distributions from "../model/Distribution.js";
import Majors from "../model/Major.js";
import FineRequirements from "../model/FineRequirement.js";
import SISCourseV from "../model/SISCourseV.js";
import { PERPAGE } from "./helperMethods.js";

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
    const major = await Majors.findById(major_id);
    await addMajorDistributions(plan, major);
    await addCourses(plan._id, major_id);
  }
  await plan.save(); 
}

// add a major distributions to user's plan 
async function addMajorDistributions(plan, major) {
  for (let distribution of major.distributions) {
    // create new distribution documents
    const distribution_to_post = {
      major_id: major._id,
      plan_id: plan._id,
      user_id: plan.user_id,
      name: distribution.name,
      required_credits: distribution.required_credits,
      description: distribution.description,
      criteria: distribution.criteria,
      min_credits_per_course: distribution.min_credits_per_course,
      // optional fields
      user_select: distribution.user_select,
      pathing: distribution.pathing,
      double_count: distribution.double_count,
    };
    const newDistribution = await Distributions.create(distribution_to_post); 
    // create new fine requirement documents
    for (let f_req of distribution.fine_requirements) {
      const fineReq_to_post = {
        description: f_req.description,
        required_credits: f_req.required_credits,
        criteria: f_req.criteria,
        plan_id: plan._id,
        major_id: major._id,
        distribution_id: newDistribution._id,
      };
      const newFineReq = await FineRequirements.create(fineReq_to_post); 
      newDistribution.fineReq_ids.push(newFineReq._id);
    }
    newDistribution.save();
  }
}

// Adds each existing course in a plan to distributions of specified major
async function addCourses(plan_id, major_id) {
  const courses = await Courses.findByPlanId(plan_id);
  const distObjs = await Distributions.find({ plan_id, major_id }); 
  for (let course of courses) {
    await addCourseToDistributions(course, distObjs);
  }
}

// add courses to distributions of a plan
async function addCourseToDistributions(course, distObjs) {
  // check that course can satisfy distribution w/ double_count rules
  let distSatisfied = undefined; 
  let distDoubleCount = ["All"];
  for (let distObj of distObjs) {
    if (
      (distDoubleCount.includes("All") ||
        distDoubleCount.includes(distObj.name)) &&
      checkCriteriaSatisfied(distObj.criteria, course) &&
      course.credits >= distObj.min_credits_per_course
    ) {
      if (distObj.satisfied) {
        // store first satisfied distribution
        if (!distSatisfied) distSatisfied = distObj._id;
      } else {
        // add to any unsatisfied distribution
        await updateDistribution(distObj._id, course._id);
        distDoubleCount = distObj.double_count;
      }
    }
  }
  // if course belongs to no distributions and satisfies a satisfied distribution,
  // add id to course but don't update credits
  const updatedCourse = await Courses.findById(course._id); 
  if (updatedCourse.distribution_ids.length == 0 && distSatisfied) {
    updatedCourse.distribution_ids.push(distSatisfied);
    updatedCourse.save();
  }
}

// removes a course from all of its distributions and fine requirements
// sets satisfied and returns updated distributions
async function removeCourseFromDistributions(course) {
  let updatedDists = [];
  // remove course from fineReqs
  for (let f_id of course.fineReq_ids) {
    let fine = await FineRequirements.findById(f_id);
    await fineCreditUpdate(fine, course, false);
  }
  // remove course from distributions
  for (let d_id of course.distribution_ids) {
    const distribution = await Distributions.findById(d_id).populate("fineReq_ids"); 
    const courses = await Courses.find({ distribution_ids: d_id }); 
    let total = 0; 
    for (let c of courses) {
      total += c.credits; 
    }
    distribution.planned = total; 
    // determine distribution satisfied with pathing
    await updateSatisfied(distribution);
    updatedDists.push(distribution);
  }
  return updatedDists;
}

// updates an unsatisfied distribution object and its fineReqs given a course that satisfies it
// return true if course updated distribution
const updateDistribution = async (distribution_id, course_id) => {
  let course = await Courses.findById(course_id);
  let distribution = await Distributions.findById(distribution_id); 
  if (!distribution || !course) return;
  // update distribution credits if no overflow
  if (distribution.planned < distribution.required_credits) {
    await distCreditUpdate(distribution, course, true);
  }
  // add distribution id to course
  course.distribution_ids.push(distribution_id);
  await course.save();
  // update fine requirement credits
  let fineDoubleCount = ["All"];
  for (let f_id of distribution.fineReq_ids) {
    let fine = await FineRequirements.findById(f_id);
    if (
      !fine.satisfied &&
      (fineDoubleCount.includes("All") ||
        fineDoubleCount.includes(fine.description)) &&
      checkCriteriaSatisfied(fine.criteria, course)
    ) {
      await fineCreditUpdate(fine, course, true);
      fineDoubleCount = fine.double_count;
      course.fineReq_ids.push(fine._id);
      await course.save();
    }
  }
  // update satisfied with pathing or fine requirements
  await updateSatisfied(distribution);
};

// updates distribution.satisfied 
async function updateSatisfied(distribution) {
  if (distribution.planned >= distribution.required_credits) {
    if (distribution.pathing) {
      await processPathing(distribution);
    } else {
      distribution.satisfied = await checkAllFines(distribution);
      await distribution.save();
    }
  }
}

// updates planned, current, and satisfied with added / removed course
// ***requirement can be distribution OR fine requirement
async function requirementCreditUpdate(requirement, course, add) {
  if (add) {
    requirement.planned += course.credits;
    if (course.taken) {
      requirement.current += course.credits;
    }
  } else {
    if (requirement.planned >= course.credits) {
      requirement.planned -= course.credits;
      if (course.taken) {
        requirement.current -= course.credits;
      }
    }
  }
  if (requirement.name) {
    if (requirement.planned < requirement.required_credits) {
      requirement.satisfied = false; // true check later with pathing
    }
  } else {
    if (requirement.planned >= requirement.required_credits) {
      requirement.satisfied = true;
    } else {
      requirement.satisfied = false;
    }
  }
  await requirement.save();
}

// updates distribution credit with course 
async function distCreditUpdate(distribution, course, add) {
  if (add) {    // add
    distribution.planned += course.credits;
    if (course.taken) distribution.current += course.credits;
  } else {      // subtract 
    if (distribution.planned >= course.credits) {
      distribution.planned -= course.credits;
      if (course.taken) distribution.current -= course.credits;
    }
  }
  if (distribution.planned < distribution.required_credits) {
    distribution.satisfied = false; // true check later with pathing
  }
  await distribution.save();
}

// updates fine requirement credit with course
async function fineCreditUpdate(fine, course, add) {
  if (add) {    // add
    fine.planned += course.credits;
    if (course.taken) fine.current += course.credits;
  } else {      // subtract 
    if (fine.planned >= course.credits) {
      fine.planned -= course.credits;
      if (course.taken) fine.current -= course.credits;
    }
  }
  if (fine.planned >= fine.required_credits) {
    fine.satisfied = true;
  } else {
    fine.satisfied = false;
  }
  await fine.save();
}

// updates a distribution's satisfied, if pathing condition is met
const processPathing = async (distribution) => {
  let numPaths = distribution.pathing;
  const fineObjs = await FineRequirements.find({ distribution_id: distribution._id }); 
  for (let fine of fineObjs) {
    if (fine.satisfied) {
      numPaths -= 1;
      if (numPaths <= 0) distribution.satisfied = true;
    }
  }
  await distribution.save();
};

// returns true if all fine requirements of a distribution are satisfied
const checkAllFines = async (distribution) => {
  for (let f_id of distribution.fineReq_ids) {
    const fine = await FineRequirements.findById(f_id); 
    if (!fine.satisfied) return false; 
  }
  return true; // all fines satisfied
};

// returns if a course satisfies a criteria
const checkCriteriaSatisfied = (criteria, course) => {
  if (criteria === null || criteria.length === 0 || criteria === "N/A") {
    return true;
  }
  const boolExpr = getCriteriaBoolExpr(criteria, course);
  return boolExpr.length !== 0 ? eval(boolExpr) : false; 
};

// returns a string expression of whether a course satisfies a criteria
const getCriteriaBoolExpr = (criteria, course) => {
  let boolExpr = "";
  let index = 0;
  let concat = "";
  const splitArr = splitRequirements(criteria);
  if (course === null) {
    return concat;
  }
  while (index < splitArr.length) {
    if (splitArr[index] === "(") {
      concat = "(";
    } else if (splitArr[index] === ")") {
      concat = ")";
    } else if (splitArr[index] === "OR") {
      concat = "||";
    } else if (splitArr[index] === "AND") {
      concat = "&&";
    } else if (splitArr[index] === "NOT") {
      concat = "&&!";
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
    case "C": // Course Number
      updatedConcat = (
        course.number !== undefined && course.number.includes(splitArr[index])
      ).toString();
      break;
    case "T": // Tag
      updatedConcat = (
        course?.tags !== undefined && course.tags.includes(splitArr[index])
      ).toString();
      break;
    case "D": // Department
      updatedConcat = (course.department === splitArr[index]).toString();
      break;
    case "Y": // Year
      //TODO: implement for year.
      updatedConcat = "false";
      break;
    case "A": // Area
      updatedConcat = (
        course.areas !== undefined && course.areas.includes(splitArr[index])
      ).toString();
      break;
    case "N": // Name
      updatedConcat = (
        course.title !== undefined && course.title.includes(splitArr[index])
      ).toString();
      break;
    case "W": //Written intensive
      updatedConcat = (course.wi !== undefined && course.wi).toString();
      break;
    case "L": // Level
      updatedConcat = handleLCase(splitArr, index, course);
      break;
    default:
      updatedConcat = "false";
  }
  return updatedConcat;
};

// Handles the L case in the getBoolExpr function
const handleLCase = (splitArr, index, course) => {
  if (course.number === undefined) return "false";
  let updatedConcat = "";
  if (splitArr[index].includes("Upper")) {
    if (course.number[7] >= "3") {
      updatedConcat = "true";
    } else {
      updatedConcat = "false";
    }
  } else if (splitArr[index].includes("Lower")) {
    if (course.number[7] <= "2") {
      updatedConcat = "false";
    } else {
      updatedConcat = "true";
    }
  } else if (course.number[7] === splitArr[index][0]) {
    // For solely 100, 200, etc. levels
    updatedConcat = "true";
  } else {
    updatedConcat = "false";
  }
  return updatedConcat;
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
  if (expr[index] === "(") {
    return ["(", index + 1];
  } else if (expr[index] === ")") {
    return [")", index + 1];
  } else if (expr[index] === "[") {
    return [expr[index + 1], index + 3];
  } else if (expr[index] === "^") {
    if (expr[index + 1] === "O") {
      return ["OR", index + 4];
    } else if (expr[index + 1] === "A") {
      return ["AND", index + 5];
    } else {
      return ["NOT", index + 5];
    }
  }
  let out = expr[index];
  index++;
  while (index < expr.length) {
    if (
      expr[index] === "(" ||
      expr[index] === ")" ||
      expr[index] === "[" ||
      expr[index] === "^"
    ) {
      return [out, index];
    }
    out = out.concat(expr[index]);
    index++;
  }
  return [out, index];
};


// returns a string expression of whether a course satisfies a criteria
const criteriaSearch = async (criteria, page) => {
  let index = 0;
  let courses = [];
  const splitArr = splitRequirements(criteria);
  while (index < splitArr.length) {
    // TODO: handle NOT 
    if (splitArr[index] === "(" || splitArr[index] === ")" || splitArr[index] === "OR" || 
        splitArr[index] === "AND" || splitArr[index] === "NOT") {
      index++; 
    } else {
      let matches = await tagSearch(splitArr, index);
      matches.forEach((match) => {
        for (let course of courses) {
          if (course.number === match.number) {
            return;
          }
        }
        courses.push(match);
      });
      index += 2;
    }
  }
  let result = {};
  // set pagination 
  const total = courses.length; 
  result.pagination = {
    page: page, 
    limit: PERPAGE, 
    last: total <= 100 ? Math.ceil(total / PERPAGE) : 10, 
    total: total
  }; 
  // set (up to) 10 courses 
  result.courses = courses.slice(page * PERPAGE, (page + 1) * PERPAGE); 
  return result;
};

// handles different tags (C, T, D, Y, A, N, W, L) in criteria string
const tagSearch = async (splitArr, index) => {
  let matches = [];
  const curr = splitArr[index]; 
  switch (splitArr[index + 1]) {
    case "C": // Course Number
      matches = await SISCourseV.find({ number: curr }).exec(); 
      break;
    case "T": // Tag
      matches = await SISCourseV.find({ "versions.tag": curr }).limit(50).exec(); 
      break;
    case "D": // Department
      matches = await SISCourseV.find({ "versions.department": curr }).limit(50).exec(); 
      break;
    case "Y": // Year
      //TODO: implement for year.
      updatedConcat = "false";
      break;
    case "A": // Area
      matches = await SISCourseV.find({ "versions.areas": curr }).limit(50).exec(); 
      break;
    case "N": // Name
      matches = await SISCourseV.find({ title: curr }).exec(); 
      break;
    case "W": //Written intensive
      matches = await SISCourseV.find({ "versions.wi": true }).limit(50).exec(); 
      break;
    case "L": // Level
      matches = await SISCourseV.find({ "versions.level": curr }).limit(50).exec(); 
      break;
    default: 
      matches = [];
  }
  return matches;
};

export {
  addCourseToDistributions,
  removeCourseFromDistributions,
  checkCriteriaSatisfied,
  updateDistribution,
  requirementCreditUpdate,
  distCreditUpdate,
  fineCreditUpdate, 
  addPlanDistributions,
  addCourses,
  criteriaSearch,
}; 