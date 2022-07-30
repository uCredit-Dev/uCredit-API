//some helper methods for routing
const Courses = require("../model/Course.js");
const Distributions = require("../model/Distribution.js");
const Majors = require("../model/Major.js");
const FineRequirements = require("../model/FineRequirement.js");
var ObjectId = require("mongoose").Types.ObjectId;

// updates a distribution object and its fineReqs if given course satisfies it
// return true if course updated distribution
const updateDistribution = async (
  distribution_id: string,
  course_id: string
): Promise<boolean> => {
  let course = await Courses.findById(ObjectId(course_id)).exec();
  return await Distributions.findById(ObjectId(distribution_id)) // returns a promise
    .then(async (distribution) => {
      if (!distribution || !course) return false;
      if (course.credits >= distribution.min_credits_per_course) {
        // update distribution credits if no overflow 
        if (distribution.planned < distribution.required_credits) {
          await requirementCreditUpdate(distribution, course, true);
        }
        // add distribution id to course
        course.distribution_ids.push(distribution_id);
        await course.save();
        // update fine requirement credits
        let fineDoubleCount: string[] = ["All"];
        for (let f_id of distribution.fineReq_ids) {
          let fine = await FineRequirements.findById(f_id).exec();
          if (
            (fine.planned < fine.required_credits ||
              (fine.required_credits === 0 && fine.planned === 0)) &&
            (fineDoubleCount.includes("All") ||
              fineDoubleCount.includes(fine.description)) &&
            checkCriteriaSatisfied(fine.criteria, course)
          ) {
            await requirementCreditUpdate(fine, course, true);
            if (fine.double_count && fine.double_count.length > 0) {
              fineDoubleCount = fine.double_count;
            }
            course.fineReq_ids.push(fine._id);
            await course.save();
          }
        }
        // update satisfied with pathing
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
        return true;
      }
      return false;
    });
};

// updates planned, current, and satisfied with added / removed course
// ***requirement can be distribution OR fine requirement
async function requirementCreditUpdate(requirement, course, add) {
  if (add) {
    requirement.planned += course.credits;
    if (course.taken) {
      requirement.current += course.credits;
    }
  } else {
    requirement.planned -= course.credits;
    if (course.taken) {
      requirement.current -= course.credits;
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
const processPathing = async (distribution: any) => {
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
const checkAllFines = async (distribution: any) => {
  for (let f_id of distribution.fineReq_ids) {
    await FineRequirements.findById(f_id).then((fine) => {
      if (!fine.satisfied) {
        return false;
      }
    });
  }
  return true;
};

// returns if a course satisfies a criteria
const checkCriteriaSatisfied = (criteria: string, course: any): boolean => {
  if (criteria === null || criteria.length === 0 || criteria === "N/A") {
    return true;
  }
  const boolExpr: string | void = getCriteriaBoolExpr(criteria, course);
  if (boolExpr.length !== 0) {
    //eslint-disable-next-line no-eval
    return eval(boolExpr);
  } else {
    return false;
  }
};

// returns a string expression of whether a course satisfies a criteria
const getCriteriaBoolExpr = (criteria: string, course: any): string => {
  let boolExpr: string = "";
  let index: number = 0;
  let concat: string = "";
  const splitArr: string[] = splitRequirements(criteria);
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
const handleTagType = (
  splitArr: string[],
  index: number,
  course: any
): string => {
  let updatedConcat: string;
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
const handleLCase = (splitArr, index, course): string => {
  if (course.number === undefined) return "false";
  let updatedConcat: string = "";
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
const splitRequirements = (expr: string): string[] => {
  let out: string[] = [];
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
const getNextEntry = (expr: string, index: number): [string, number] => {
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
  checkCriteriaSatisfied,
  updateDistribution,
  requirementCreditUpdate,
};
