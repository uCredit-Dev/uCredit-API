//some helper methods for routing
const Courses = require("../model/Course.js");
const Distributions = require("../model/Distribution.js");
const Majors = require("../model/Major.js");
const Plans = require("../model/Plan.js");
const FineRequirements = require("../model/FineRequirement.js");
var ObjectId = require("mongoose").Types.ObjectId;

// Adding new distributions if new major is added
async function addMajorDistributions(plan) {
  for (let m_id of plan.major_ids) {
    const dist = await Distributions.find({
      plan_id: plan._id,
      major_id: m_id,
    }).exec();
    if (dist.length == 0) {
      // new major
      const major = await Majors.findById(m_id).exec();
      for (let dist_object of major.distributions) {
        let distribution_to_post = {
          major_id: major._id,
          plan_id: plan._id,
          user_id: plan.user_id,
          name: dist_object.name,
          required_credits: dist_object.required_credits,
          description: dist_object.description,
          criteria: dist_object.criteria,
          min_credits_per_course: dist_object.min_credits_per_course,
          // optional fields
          user_select: dist_object.user_select,
          pathing: dist_object.pathing,
          double_count: dist_object.double_count,
        };
        // create new distribution documents
        await Distributions.create(distribution_to_post).then(
          async (retrievedDistribution) => {
            for (let f_req of dist_object.fine_requirements) {
              let fineReq_to_post = {
                description: f_req.description,
                required_credits: f_req.required_credits,
                criteria: f_req.criteria,
                plan_id: plan._id,
                major_id: major._id,
                distribution_id: retrievedDistribution._id,
                double_count: f_req.double_count, // optional
              };
              // create new fine requirement documents
              await FineRequirements.create(fineReq_to_post).then(
                async (fineReq) => {
                  retrievedDistribution.fineReq_ids.push(fineReq._id);
                  await retrievedDistribution.save();
                }
              );
            }
          }
        );
      }
      await addCourses(plan, m_id);
    }
  }
}

// Adds each existing course in a plan to distributions of specified major
async function addCourses(plan, m_id) {
  const coursesInPlan = await Courses.findByPlanId(plan._id).exec();
  for (let course of coursesInPlan) {
    addCourseToDistributions(course, [m_id]);
  }
}

// add courses to distributions of a plan
// can specify majors if necessary
async function addCourseToDistributions(course, majors) {
  const plan = await Plans.findById(course.plan_id).exec();
  let major_ids = majors;
  if (!major_ids) {
    // if undefined, add to all majors of plan
    major_ids = plan.major_ids;
  }
  // process distributions by major
  for (let m_id of major_ids) {
    let distSatisfied = undefined; // store first satisfied distribution
    let distDoubleCount = ["All"];
    // process all distributions of current major
    await Distributions.find({ plan_id: course.plan_id, major_id: m_id }).then(
      async (distObjs) => {
        for (let distObj of distObjs) {
          // check that course can satisfy distribution w/ double_count rules
          if (
            (distDoubleCount.includes("All") ||
              distDoubleCount.includes(distObj.name)) &&
            checkCriteriaSatisfied(distObj.criteria, course) &&
            course.credits >= distObj.min_credits_per_course
          ) {
            if (distObj.satisfied) {
              // store satisfied distribution
              if (!distSatisfied) distSatisfied = distObj._id;
            } else {
              // add to any unsatisfied distribution
              await updateDistribution(distObj._id, course._id);
              distDoubleCount = distObj.double_count;
            }
          }
        }
      }
    );
    // if course belongs to no distributions and satisfies a satisfied distribution,
    // add id to course but don't update distribution obj
    await Courses.findById(course._id).then((updatedCourse) => {
      if (updatedCourse.distribution_ids.length == 0 && distSatisfied) {
        updatedCourse.distribution_ids.push(distSatisfied);
        updatedCourse.save();
      }
    });
  }
}

// removes a course from all of its distributions and fine requirements
// sets satisfied and returns updated distributions
async function removeCourseFromDistribution(course) {
  let updatedDists = [];
  // remove course from fineReqs
  for (let f_id of course.fineReq_ids) {
    let fine = await FineRequirements.findById(f_id).exec();
    await requirementCreditUpdate(fine, course, false);
  }
  // remove course from distributions
  for (let id of course.distribution_ids) {
    await Distributions.findById(id)
      .populate("fineReq_ids")
      .then(async (distribution) => {
        await requirementCreditUpdate(distribution, course, false);
        // determine distribution satisfied with pathing
        if (distribution.planned >= distribution.required_credits) {
          if (distribution.pathing) {
            await processPathing(distribution);
          } else {
            let allFinesSatisfied = await checkAllFines(distribution);
            if (allFinesSatisfied) {
              distribution.satisfied = true;
            } else {
              distribution.satisfied = false;
            }
          }
        }
        await distribution.save();
        updatedDists.push(distribution);
      });
  }
  return updatedDists;
}

// updates an unsatisfied distribution object and its fineReqs given a course that satisfies it
// return true if course updated distribution
const updateDistribution = async (distribution_id, course_id) => {
  let course = await Courses.findById(ObjectId(course_id)).exec();
  await Distributions.findById(ObjectId(distribution_id)).then(
    async (distribution) => {
      if (!distribution || !course) return;
      // update distribution credits if no overflow
      if (distribution.planned < distribution.required_credits) {
        await requirementCreditUpdate(distribution, course, true);
      }
      // add distribution id to course
      course.distribution_ids.push(distribution_id);
      await course.save();
      // update fine requirement credits
      let fineDoubleCount = ["All"];
      for (let f_id of distribution.fineReq_ids) {
        let fine = await FineRequirements.findById(f_id).exec();
        if (
          !fine.satisfied &&
          (fineDoubleCount.includes("All") ||
            fineDoubleCount.includes(fine.description)) &&
          checkCriteriaSatisfied(fine.criteria, course)
        ) {
          await requirementCreditUpdate(fine, course, true);
          fineDoubleCount = fine.double_count;
          course.fineReq_ids.push(fine._id);
          await course.save();
        }
      }
      // update satisfied with pathing or fine requirements
      if (distribution.planned >= distribution.required_credits) {
        if (distribution.pathing) {
          await processPathing(distribution);
        } else {
          let allFinesSatisfied = await checkAllFines(distribution);
          if (allFinesSatisfied) {
            distribution.satisfied = true;
          } else {
            distribution.satisfied = false;
          }
          await distribution.save();
        }
      }
    }
  );
};

// updates planned, current, and satisfied with added / removed course
// ***requirement can be distribution OR fine requirement
async function requirementCreditUpdate(requirement, course, add) {
  if (add) {
    // add
    requirement.planned += course.credits;
    if (course.taken) {
      requirement.current += course.credits;
    }
  } else {    // subtract 
    if (requirement.planned >= course.credits) {
      requirement.planned -= course.credits;
      if (course.taken) {
        requirement.current -= course.credits;
      }
    }
  }
  if (requirement.name) {
    // distribution
    if (requirement.planned < requirement.required_credits) {
      requirement.satisfied = false; // true check later with pathing
    }
  } else {
    // finereq
    if (requirement.planned >= requirement.required_credits) {
      requirement.satisfied = true;
    } else {
      requirement.satisfied = false;
    }
  }
  await requirement.save();
}

// updates a distribution's satisfied, if pathing condition is met
const processPathing = async (distribution) => {
  let numPaths = distribution.pathing;
  await FineRequirements.find({ distribution_id: distribution._id }).then(
    async (fineObjs) => {
      for (let fine of fineObjs) {
        if (fine.satisfied) {
          numPaths -= 1;
          if (numPaths <= 0) {
            distribution.satisfied = true;
          }
        }
      }
    }
  );
  await distribution.save();
};

// returns true if all fine requirements of a distribution are satisfied
const checkAllFines = async (distribution) => {
  for (let f_id of distribution.fineReq_ids) {
    await FineRequirements.findById(f_id).then((fine) => {
      if (!fine.satisfied) {
        return false;
      }
    });
  }
  return true; // all fines satisfied
};

// returns if a course satisfies a criteria
const checkCriteriaSatisfied = (criteria, course) => {
  if (criteria === null || criteria.length === 0 || criteria === "N/A") {
    return true;
  }
  const boolExpr = getCriteriaBoolExpr(criteria, course);
  // console.log(criteria);
  // console.log(boolExpr);
  if (boolExpr.length !== 0) {
    //eslint-disable-next-line no-eval
    return eval(boolExpr);
  } else {
    return false;
  }
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

module.exports = {
  addCourseToDistributions,
  removeCourseFromDistribution,
  checkCriteriaSatisfied,
  updateDistribution,
  requirementCreditUpdate,
  addMajorDistributions,
  addCourses,
};
