// helper methods for updating distributions 
import Courses from "../model/Course.js";
import Distributions from "../model/Distribution.js";
import Majors from "../model/Major.js";
import FineRequirements from "../model/FineRequirement.js";

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
    await initDistributions(plan._id, major_id);
  }
  await plan.save(); 
}

async function removePlanDistributions(plan) {
  // remove dists and fineReqs for deleted major, if any
  let distributions = await Distributions.find({ plan_id: plan._id }).exec();
  for (let dist of distributions) {
    if (!plan.major_ids.includes(dist.major_id)) {
      // maintain courses array fields
      await Courses.updateMany(
        { plan_id: plan._id },
        { $pull: { distribution_ids: dist._id } }
      ).exec();
      for (let fine_id of dist.fineReq_ids) {
        await Courses.updateMany(
          { plan_id: plan._id },
          { $pull: { fineReq_ids: fine_id } }
        ).exec();
      }
      // delete documents
      await Distributions.findByIdAndDelete(dist._id).exec();
      await FineRequirements.deleteMany({ distribution_id: dist._id }).exec();
    }
  }
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
    await newDistribution.save();
  }
}

// removes a course from all of its distributions and fine requirements
// sets satisfied and returns updated distributions
async function removeCourseFromDistributions(course) {
  let updatedDists = [];
  // remove course from fineReqs
  for (let f_id of course.fineReq_ids) {
    let fine = await FineRequirements.findById(f_id);
    await removeCourseFromFine(course, fine);
  }
  // remove course from distributions
  for (let d_id of course.distribution_ids) {
    let distribution = await Distributions.findById(d_id).populate("fineReq_ids"); 
    const courses = await Courses.find({ distribution_ids: d_id }); 
    let total = 0; 
    for (let c of courses) {
      total += c.credits; 
    }
    distribution.planned = total; 
    // determine distribution satisfied with pathing
    updateSatisfied(distribution, fines);
    updatedDists.push(distribution);
  }
  return updatedDists;
}

async function initDistributions(plan_id, major_id) {
  // update documents to start blank  
  await Courses.updateMany({ plan_id }, { distribution_ids: [], fineReq_ids: [] }); 
  await Distributions.updateMany({ plan_id }, { planned: 0, satisfied: false }); 
  await FineRequirements.updateMany({ plan_id }, { planned: 0, satisfied: false }); 
  // get all distributions 
  const distributions = await Distributions.find({ plan_id, major_id }); 
  const courses = await Courses.find({ plan_id }); 

  // for each course 
  for (let course of courses) {
    await addCourseToDists(course, distributions); 
  }
  const promises = distributions.map((dist) => dist.save());
  await Promise.all(promises);
}

async function addCourseToFines(course, fines) {
  // add to fine requirements
  let allowed = ["All"];
  const promises = fines.map((fine) => {
    if (fine.satisfied) return Promise.resolve(); 
    if (!checkCriteriaSatisfied(fine.criteria, course)) return Promise.resolve(); 
    if (allowed.includes("All") || allowed.includes(fine.description)) {
      // udpated double count info 
      allowed = fine.double_count; 
      addCourseToFine(course, fine);
      return fine.save();
    }
  });
  await Promise.all(promises);
}

async function addCourseToDists(course, distributions) {
  let allowed = ["All"];
  for (let dist of distributions) {
    if (dist.satisfied) continue; 
    if (dist.min_credits_per_course > course.credits) continue; 
    if (!checkCriteriaSatisfied(dist.criteria, course)) continue; 
    if (allowed.includes("All") || allowed.includes(dist.name)) {
      // udpated double count info 
      allowed = dist.double_count; 
      // update dist
      await addCourseToDist(course, dist);
    }
  }
  await course.save();
}

// helper function to add single course to distribution 
// pre: course is known to satisfy dist 
const addCourseToDist = async (course, dist) => {
  course.distribution_ids.push(dist.id); 
  let fines = await FineRequirements.find({ distribution_id: dist._id }); 
  if (fines) await addCourseToFines(course, fines);
  // update dist 
  dist.planned += course.credits; 
  updateSatisfied(dist, fines);
}

// helper function to add single course to distribution 
// pre: course is known to satisfy dist 
const removeCourseFromDist = (course, dist) => {
  // update dist 
  dist.planned -= course.credits; 
  updateSatisfied(dist, fines);
}

// helper function to add single course to fine req 
// pre: course is known to satisfy fine 
const addCourseToFine = (course, fine) => {
  // update course 
  course.fineReq_ids.push(fine._id); 
  // update fine 
  fine.planned += course.credits; 
  fine.satisfied = fine.planned >= fine.required_credits; 
  if (fine.satisfied) fine.planned = fine.required_credits; 
}

// helper function to remove single course from distribution 
// pre: course is known to satisfy dist 
const removeCourseFromFine = async (course, dist) => {
  // update fine 
  fine.satisfied = fine.planned >= fine.required_credits; 
  if (fine.satisfied) fine.planned = fine.required_credits; 
  await fine.save();   
}
// ################################# // 
// ####### HELPER FUNCTIONS ######## // 
// ################################# // 

// function that gets courses in plan that /can/ satisfy criteria 
// mongoose query 
const getMatchingCourses = async (criteria, plan_id) => {
  if (criteria === null || criteria.length === 0 || criteria === "N/A") {
    const courses = await Courses.find({ plan_id }); 
    return courses; 
  }
  const splitArr = splitRequirements(criteria);
  let [query, _] = constructQuery(splitArr, 0);
  query = { ...query, plan_id }; 
  const courses = await Courses.find(query); 
  return courses; 
}

// function to query db directly for dist/fine criteria 
// params: criteria as string array, index 
// output: filter that can be used for mongoose queries 
const constructQuery = (splitArr, i) => {
  let query = { "$or": [] };
  let subarr = query["$or"];
  let filter = {};
  let index = i; 
  let mode = splitArr.indexOf("AND") < 0 ? "$or" 
    : splitArr.indexOf("OR") < 0 ? "$and" 
    : splitArr.indexOf("AND") < splitArr.indexOf("OR") ? "$and" 
    : "$or"; 
  while (index < splitArr.length) {
    if (!query[mode]) query[mode] = [];
    switch (splitArr[index]) {
      case "(": 
        subarr = constructQuery(splitArr, index + 1); 
        query = { ...query, ...subarr[0] }; 
        index = subarr[1];
        break; 
      case ")": 
        return [ query, index ]; 
      case "OR": 
        if (query["$and"] && query["$and"].length > 0) {
          query["$or"].push({ "$and": query["$and"] });
        } 
        mode = "$or"; 
        break; 
      case "AND": 
        if (query["$or"] && query["$or"].length > 0) {
          query["$and"] = [];
          query["$and"].push({ "$or": query["$or"] });
        } 
        mode = "$and"; 
        break; 
      case "C": // Course Number
        filter = { number: splitArr[index - 1] };
      case "T": // Tag
        filter = { tags: splitArr[index - 1] };
      case "D": // Department
        filter = { department: splitArr[index - 1] };
      case "Y": // Year
        //TODO: implement for year.
        break;
      case "A": // Area
        filter = { areas: {
          $not: new RegExp("None"), 
          $in: new RegExp(splitArr[index - 1]),
        }};
      case "N": // Name
        filter = { title: splitArr[index - 1] };
      case "W": //Written intensive
        filter = { wi: true };
      case "L": // Level
        filter = { level: splitArr[index - 1] };
      default: 
        query[mode].push(filter);
    }
    index++; 
  }
  if (query["$and"] && query["$and"].length == 0) {
    delete query["$and"]; 
  }
  if (query["$or"] && query["$or"].length == 0) {
    delete query["$or"]; 
  }
  return [query, index];
}

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
}


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

export {
  initDistributions,
  removeCourseFromDistributions,
  checkCriteriaSatisfied,
  addPlanDistributions,
  removePlanDistributions,
  splitRequirements, 
  removeCourseFromDist, 
  addCourseToDists
}; 