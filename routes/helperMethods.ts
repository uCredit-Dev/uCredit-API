//some helper methods for routing
const Notifications = require("../model/Notification.js");
const Courses = require("../model/Course.js");
const Distributions = require("../model/Distribution.js");
const Majors = require("../model/Major.js");
const FineRequirements = require("../model/FineRequirement.js")
var ObjectId = require('mongoose').Types.ObjectId;

//add data field to the response object. If data is null, return 404 error
function returnData(data, res) {
  data
    ? res.json({ data: data })
    : errorHandler(res, 404, "Resource not found");
}

//set status code of the response and send error info to the user in json
function errorHandler(res, status, err) {
  res.status(status).json({
    errors: [
      {
        status: status,
        detail: err.message || err, //if err does not have a message property, just return err
      },
    ],
  });
}

const updateDistribution = async (
  distribution_id: string, 
  course_id: string
) : Promise<boolean> => {
  let course = await Courses.findById(ObjectId(course_id)); 
  return await Distributions // return promise 
    .findById(ObjectId(distribution_id))
    .then(async (distribution) => {
      if (!course)
      if (!distribution || !course) return false; 
      const genCriteria: string = distribution.criteria;
      // general distribution criteria  
      if (
        !distribution.satisfied &&
        course.credits >= distribution.min_credits_per_course && 
        checkCriteriaSatisfied(genCriteria, course)
      ) {
        // update distribution credits  
        if (distribution.planned < distribution.required_credits ||
            (distribution.planned === 0 && distribution.required_credits === 0)) {
              distributionCreditUpdate(distribution, course, true);
        }
        // add distribution id to course 
        course.distribution_ids.push(distribution_id);
        await course.save(); 
        // update fine requirement credits 
        await FineRequirements
          .find({distribution_id: distribution._id})
          .then(async (fineReqs) => {
            let fineExclusive: string[] | undefined = undefined; 
            for (let fine of fineReqs) {
              if (
                (fine.planned < fine.required_credits || (fine.required_credits === 0 && fine.planned === 0)) &&
                (fineExclusive === undefined || fineExclusive.length === 0 || fineExclusive.includes(fine.description)) &&  
                checkCriteriaSatisfied(fine.criteria, course)
              ) {
                distributionCreditUpdate(fine, course, true);
                await fine.save(); 
                course.fineReq_ids.push(fine._id);
                await course.save();
                if (fine.exclusive && fine.exclusive.length > 0) {
                  fineExclusive = fine.exclusive;
                }
              }
            }
          })
        if (distribution.planned >= distribution.required_credits) {
          if (distribution.pathing) {
            await processPathing(distribution); 
          } else {
            distribution.satisfied = true; 
          }
        }
        await distribution.save(); 
        return true; 
      }
      return false; 
    }); 
};

function distributionCreditUpdate(distribution, course, add) {
  if (add) {
    distribution.planned += course.credits;
    if (course.taken) {
      distribution.current += course.credits;
    }
  } else {
    distribution.planned -= course.credits;
    if (course.taken) {
      distribution.current -= course.credits;
    }
  }
  if (distribution.name) {
    if (distribution.planned < distribution.required_credits) {
      distribution.satisfied = false; // true check later with pathing
    }
  } else { // finereq
    if (distribution.planned >= distribution.required_credits) {
      distribution.satisfied = true; 
    }
  }
}

const processPathing = async (
  distribution: any
) => {
  let numPaths = distribution.pathing; 
  await FineRequirements
    .find({distribution_id: distribution._id})
    .then((fineObjs) => {
      fineObjs.forEach((fine, i: number) => {
        if (fine.satisfied) {
          numPaths -= 1; 
          if (numPaths <= 0) {
            distribution.satisfied = true; 
          }
        }
      });
    })
}

/**
 * Checks if a course satisfies a criteria.
 * @param criteria - criteria for given distribution OR fine requirement 
 * @param course - course we're checking for prereq satisfaction
 * @returns whether the course satisifies the criteria 
 */
const checkCriteriaSatisfied = (
  criteria: string,
  course: any,
): boolean => {
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

const getCriteriaBoolExpr = (
  criteria: string,
  course: any,
): string => {
  let boolExpr: string = '';
  let index: number = 0;
  let concat: string = '';
  const splitArr: string[] = splitRequirements(criteria);
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
      concat = '&&!';
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

const handleTagType = (
  splitArr: string[],
  index: number,
  course: any,
): string => {
  let updatedConcat: string;
  switch (splitArr[index + 1]) {
    case 'C': // Course Number
      updatedConcat = course.number.includes(splitArr[index]).toString();
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
        course.areas !== undefined && course.areas.includes(splitArr[index])
      ).toString();
      break;
    case 'N': // Name
      updatedConcat = course.title.includes(splitArr[index]).toString();
      break;
    case 'W': //Written intensive
      updatedConcat = course.wi.toString();
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
const handleLCase = (splitArr, index, course): string => {
  let updatedConcat: string = '';
  if (splitArr[index].includes('Upper')) {
    if (course.number[7] >= '3') {
      updatedConcat = 'true';
    } else {
      updatedConcat = 'false';
    }
  } else if (splitArr[index].includes('Lower')) {
    if (course.number[7] <= '2') {
      updatedConcat = 'false';
    } else {
      updatedConcat = 'true';
    }
  } else if (course.number[7] === splitArr[index][0]) {
    // For solely 100, 200, etc. levels
    updatedConcat = 'true';
  } else {
    updatedConcat = 'false';
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

async function postNotification(message, user_id, quick_link_id, link_type) {
  if (!message || !user_id) {
    return 400;
  }
  let notification: any;
  if (quick_link_id && link_type) {
    notification = {message, user_id, quick_link_id, link_type};
  } else {
    notification = {message, user_id};
  }
  const n = await Notifications.create(notification);
  return n;
}

module.exports = {
  returnData,
  errorHandler,
  checkCriteriaSatisfied, 
  getCriteriaBoolExpr,
  splitRequirements,
  updateDistribution,
  distributionCreditUpdate,
  postNotification,
};
