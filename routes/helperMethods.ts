//some helper methods for routing
const Notifications = require("../model/Notification.js");
const Courses = require("../model/Course.js");
const Distributions = require("../model/Distribution.js");
const Majors = require("../model/Major.js");
var ObjectId = require('mongoose').Types.ObjectId;

export type requirements = {
  name: string;
  expr: string;
  required_credits: number;
  fulfilled_credits: number;
  description: string;
  exclusive?: boolean;
  pathing?: boolean;
  wi?: boolean;
  min_credits_per_course?: number;
};

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

// WE will need to change the function calls because I have changed the types of the parameters

/**
 * Checks if a course satisfies a distribution.
 * @param distribution - the distribution name for the major containing an expression, an array where every entry is a seperate parentheses, OR/AN D, requirement, or type, name of a class, and all courses
 * @param course - course we're checking for prereq satisfaction
 * @returns whether the class satisifies the requirement
 */
const checkRequirementSatisfied = (
  distribution_name: string,
  course_id: string,
  major_id: string
): boolean => {
  const major: any = Majors.findById(ObjectId(major_id));
  const course = Courses.findById(ObjectId(course_id));
  const distribution: requirements = getDistributionFromMajor(distribution_name, major)
  if (distribution === null) {
    return true;
  }
  if (course.credits < distribution.min_credits_per_course) {
    return false; 
  }
  if (distribution.expr.length === 0) {
    // Return true if there is no expression.
    return true;
  }
  const boolExpr: string | void = getBoolExpr(distribution, course);
  if (boolExpr.length !== 0) {
    // evaluate the expression if it exists,
    //eslint-disable-next-line no-eval
    return eval(boolExpr);
  } else {
    return false;
  }
};

/**
 * 
 * @param distribution_name - name of distribution that is being extracted from major object in DB
 * @param major - the major that the distribution is a part of
 * @returns - the specific distribution of the major
 */
const getDistributionFromMajor = (distribution_name: string, major: any): requirements => {
  major.distributions.forEach((element) => {
    if (element.name === distribution_name) {
      return element;
    }
  });
  return null;
};

/**
 * Gets a boolean expression based on which courses in the prereq string are fulfilled.
 * @param distribution - the distribution of the major to be satisfied containing expr, an array of reqs for the distribution
 * @param course - course we're checkinng for satisfaction
 * @returns a boolean expression in a string that describes the satisfaction of the distribution
 */
const getBoolExpr = (
  distribution: requirements,
  course: any,
): string => {
  let boolExpr: string = '';
  let index: number = 0;
  let concat: string = '';
  const splitArr: string[] = splitRequirements(distribution.expr);
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
        course.areas !== 'None' && course.areas.includes(splitArr[index])
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

// args: major
// returns:
//  An array where where each entry corresponds to a distribution (e.g. CS, Math, Science, Liberal Arts, WI)
//  Each entry contains an array with descriptions, exprsesion for requirements, and credit requirements
const getRequirements = async (major_id: string) => {
  // Note: no longer needed probably 
  let out: [string, requirements[]][] = [];
  const major: any = await Majors.findById(ObjectId(major_id));
  major.distributions.forEach((element) => {
    let allReq: requirements[] = [];
    let general: requirements = {
      name: element.name.toString(),
      expr: element.criteria.toString(),
      required_credits: element.required_credits,
      fulfilled_credits: 0,
      description: element.description,
      pathing: element.pathing,
      exclusive: element.exclusive,
      min_credits_per_course: element.min_credits_per_course,
    };
    allReq.push(general);
    if (element.fine_requirements !== undefined) {
      element.fine_requirements.forEach((fine) => {
        allReq = [
          ...allReq,
          {
            name: fine.description.toString(),
            expr: fine.criteria.toString(),
            required_credits: fine.required_credits,
            fulfilled_credits: 0,
            description: '',
            exclusive: fine.exclusive,
          },
        ];
      });
    }
    let curReq: [string, requirements[]] = [element.name.toString(), allReq];
    out = [...out, curReq];
  });
  return out;
};


async function distributionCreditUpdate(distribution, course, add) {
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
  distribution.satisfied =
    distribution.planned >= distribution.required ? true : false;
  await distribution.save();
}

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
  checkRequirementSatisfied, 
  getBoolExpr,
  splitRequirements,
  getRequirements,
  distributionCreditUpdate,
  postNotification,
};
