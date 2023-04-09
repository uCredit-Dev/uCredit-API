import { Response } from "express";
import { DistributionDoc } from "../model_ts/Distribution";
import { CourseDoc } from "../model_ts/Course";
import { SISCourseVDoc } from "../model_ts/SISCourseV";
import { Schema } from "mongoose";
import { LinkType, NotificationDoc, Notification} from "../model_ts/Notification";
import SISCourseV from "../model/SISCourseV";
import { getCriteriaBoolExpr, splitRequirements } from "../routes/distributionMethods";

function returnData(data: any, res: Response) {
  data
    ? res.json({ data: data })
    : errorHandler(res, 404, "Resource not found");
}

function errorHandler(res: Response, status: number, err: any) {
  if (res.headersSent) return;
  res.status(status).json({
    errors: [
      {
        status: status,
        detail: err.message || err,
      },
    ],
  });
}

function forbiddenHandler(res: Response) {
  if (res.headersSent) return;
  res.status(403).json({
    status: 403,
    message: "You are not authorized to access this resource.",
  });
}

function missingHandler(res: Response, required: any) {
  if (res.headersSent) return;
  res.status(400).json({
    status: 400,
    message: "Request is missing required fields",
    required,
  });
}

async function distributionCreditUpdate(
  distribution: DistributionDoc,
  course: CourseDoc,
  add: boolean
) {
  if (!distribution) return;
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

async function postNotification (
  message: String,
  user_id: Schema.Types.ObjectId[],
  quick_link_id?: Schema.Types.ObjectId,
  link_type?: String
) {
  if (!message || !user_id) {
    return 400;
  }
  let notification: NotificationDoc = Notification.build({
    message: message,
    user_id: user_id,
    quick_link_id: quick_link_id,
    link_type: link_type
  })
  return notification;
}

// for strict query matching 
async function simpleSearch(query, page) {
  const result: any = {}; // todo: verify type
  // set pagination info; limit to 100 
  const total = await SISCourseV.countDocuments(query).exec(); 
  result.pagination = {
    page: page, 
    limit: PERPAGE,
    last: total <= 100 ? Math.ceil(total / PERPAGE) : 10, 
    total: total
  }
  // skip and limit according to page 
  result.courses = await SISCourseV.find(query).skip((page) * PERPAGE).limit(PERPAGE); 
  return result; 
}

// search for all courses matching substring of searchTerm  
// search for all courses matching substring of searchTerm  
async function fuzzySearch(query, searchTerm, page) {
  const result: any = {}; // todo: figure out type for this
  delete query['$or'];
  const search = {
    '$search': {
      "text": {
        "query": searchTerm, 
        "path": ["title", "number"], 
        "fuzzy": {
          "maxEdits": 2,
          "maxExpansions": 100,
        }
      }
    }
  }; 
  const match = { '$match': query }; 
  const limit = { '$limit': 100 }; 
  // query for courses
  let courses = await SISCourseV.aggregate([search, match, limit]).exec();
  // return pagination information; limit to 100 
  const total = courses.length; 
  result.pagination = {
    page: page, 
    limit: PERPAGE, 
    last: total <= 100 ? Math.ceil(total / PERPAGE) : 10, 
    total: total <= 100 ? total : 100, 
  }
  // skip and limit according to page 
  result.courses = courses.slice(page * PERPAGE, (page + 1) * PERPAGE); 
  return result; 
}

// returns a string expression of whether a course satisfies a criteria
const criteriaSearch = async (criteria, page) => {
  let index = 0;
  let courses: any[] = []; // todo: figure out type
  const splitArr = splitRequirements(criteria);
  while (index < splitArr.length) {
    // TODO: handle NOT 
    if (splitArr[index] === "(" || splitArr[index] === ")" || splitArr[index] === "OR" || 
        splitArr[index] === "AND" || splitArr[index] === "NOT") {
      index++; 
    } else {
      let matches = await tagSearch(splitArr, index);
      // remove duplicates
      matches.forEach((match) => {
        for (let course of courses) {
          if (match.number === course.number) return; 
        }
        courses.push(match);
      })
      index += 2;
    }
  }
  let result: any = {}; // todo: figure out type for this
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
  let matches: any[] = []; // todo: figure out the type for this
  const curr = splitArr[index]; 
  switch (splitArr[index + 1]) {
    case "C": // Course Number
      matches = await SISCourseV.find({ number: curr }).exec(); 
      return matches; 
    case "T": // Tag
      matches = await SISCourseV.find({ "versions.tags": curr }).limit(50).exec(); 
      break;
    case "D": // Department
      matches = await SISCourseV.find({ "versions.department": curr }).limit(200).exec(); 
      break;
    case "Y": // Year
      //TODO: implement for year.
      break;
    case "A": // Area
      matches = await SISCourseV.find({ "versions.areas": curr }).limit(200).exec(); 
      break;
    case "N": // Name
      matches = await SISCourseV.find({ title: curr }).exec(); 
      break;
    case "W": //Written intensive
      matches = await SISCourseV.find({ "versions.wi": true }).limit(50).exec(); 
      break;
    case "L": // Level
      matches = await SISCourseV.find({ "versions.level": new RegExp(curr, "i") }).limit(200).exec(); 
      break;
    default: 
      matches = [];
  }
  matches = matches.filter((match) => {
    const boolExpr = getCriteriaBoolExpr(splitArr, match.versions[0]);
    return boolExpr.length !== 0 ? eval(boolExpr) : false; 
  })
  return matches;
};

// return true if userCourse is offered in newTerm
const checkDestValid = (
  sisCourses: SISCourseVDoc[],
  userCourse: CourseDoc,
  newTerm: string
) => {
  if (sisCourses.length == 0) return true;
  for (let sisC of sisCourses) {
    if (sisC.number === userCourse.number) {
      for (let term of sisC.terms) {
        // example: "Fall 2021" includes "Fall"
        if (term.includes(newTerm)) return true;
      }
    }
  }
  return false;
};

function constructQuery(params) {
  let {
    userQuery = "",
    school = "",
    department = "",
    term = "",
    areas = "",
    wi,
    credits = "",
    tags = "",
    level = "",
  } = params;
  userQuery = userQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); //escape special character for regex
  let query = {
    $or: [
      { title: { $regex: userQuery, $options: "i" } },
      { number: { $regex: userQuery, $options: "i" } },
    ],
  };
  if (school !== "") {
    query["versions.school"] = { $regex: school, $options: "i" }; 
  }
  if (department !== "") {
    query["versions.department"] = { $regex: department, $options: "i" }; 
  }
  if (term !== "") {
    query["versions.term"] = { $regex: term, $options: "i" }; 
  }
  if (level !== "") {
    query["versions.level"] = { $regex: level, $options: "i" }; 
  }
  if (areas !== "" && areas !== "None") {
    query["versions.areas"] = {
      $not: new RegExp("None"), 
      $in: areas.split("|").map((area) => new RegExp(area)),
    };
  }
  if (tags !== "") {
    query["versions.tags"] = {
      $in: tags.split("|").map((tag) => new RegExp(tag)),
    };
  }
  if (credits !== "") {
    query["versions.credits"] = {
      $in: credits.split("|"),
    };
  }
  if (wi != null) {
    if (wi === "1" || wi === "true") {
      query["versions.wi"] = true;
    } else if (wi === "0" || wi === "false") {
      query["versions.wi"] = false;
    }
  }
  return query;
}

async function sendCourseVersion(query, version, res) {
  const match = await SISCourseV.findOne(query); 
  if (match == null) {
    return errorHandler(
      res,
      404,
      "Did not find any course or the course specified is not offered in this term."
    );
  } 
  try {
    let course: any = {}; // todo change type
    course.title = match.title;
    course.number = match.number;
    course.terms = match.terms;
    match.versions.forEach((v) => {
      if (v.term === version) {
        course.version = v;
      }
    });
    returnData(course, res);
  } catch (err) {
    errorHandler(res, 400, err); 
  }
}

const PERPAGE = 10; 
const MIN_LEN = 3; 

enum REVIEW_STATUS {
  PENDING = "PENDING", 
  UNDERREVIEW = "UNDERREVIEW", 
  APPROVED = "APPROVED", 
  REJECTED = "REJECTED"
}; 

enum NOTIF_TYPE {
  PLAN = "PLAN", 
  PLANREVIEW = "PLANREVIEW", 
  USER = "USER", 
  DISTRIBUTION = "DISTRIBUTION"
}; 

export {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
  distributionCreditUpdate,
  postNotification,
  REVIEW_STATUS, 
  NOTIF_TYPE,
  simpleSearch,
  fuzzySearch,
  checkDestValid,
  constructQuery, 
  sendCourseVersion, 
  criteriaSearch
};
