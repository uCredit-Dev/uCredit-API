//some helper methods for routing
import Notifications from "../model/Notification.js";
import SISCV from "../model/SISCourseV.js"; 

//add data field to the response object. If data is null, return 404 error
function returnData(data, res) {
  data
    ? res.json({ data: data })
    : errorHandler(res, 404, "Resource not found");
}

//set status code of the response and send error info to the user in json
function errorHandler(res, status, err) {
  if (res.headersSent) return;
  // console.log(` >> ${err.message || err}`); 
  res.status(status).json({
    errors: [
      {
        status: status,
        detail: err.message || err, //if err does not have a message property, just return err
      },
    ],
  });
}

function forbiddenHandler(res) {
  if (res.headersSent) return;
  res.status(403).json({
    status: 403,
    message: "You are not authorized to access this resource.",
  });
}

function missingHandler(res, required) {
  if (res.headersSent) return;
  res.status(400).json({
    status: 400,
    message: "Request is missing required fields.",
    required,
  });
}

async function distributionCreditUpdate(distribution, course, add) {
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

async function postNotification(message, user_id, quick_link_id, link_type) {
  if (!message || !user_id) {
    return 400;
  }
  let notification; 
  if (quick_link_id && link_type) {
    notification = { message, user_id, quick_link_id, link_type };
  } else {
    notification = { message, user_id };
  }
  const n = await Notifications.create(notification);
  return n;
}

// return an array of substrings of length 3+
function ngram(query) {
  const queryLen = query.length; 
  query = query.toLowerCase();
  const ngrams = new Set();
  ngrams.add(query);
  // add substrings from largest to smallest 
  for (let substrLen = queryLen; substrLen >= MIN_LEN; substrLen--) {
    for (let i = 0; i <= queryLen - substrLen; i++) {
      ngrams.add(query.slice(i, i + substrLen)); 
    }
  }
  // make array from set 
  return Array.from(ngrams);
}

// for strict query matching 
async function simpleSearch(query, page) {
  const result = {}; 
  // set pagination info; limit to 100 
  const total = await SISCV.countDocuments(query).exec(); 
  result.pagination = {
    page: page, 
    limit: PERPAGE, 
    last: total <= 100 ? Math.ceil(total / PERPAGE) : 10, 
    total: total
  }
  // skip and limit according to page 
  result.courses = await SISCV.find(query).skip((page) * PERPAGE).limit(PERPAGE); 
  return result; 
}

// search for all courses matching substring of searchTerm  
async function fuzzySearch(query, searchTerm, page) {
  const result = {};
  const ngrams = ngram(searchTerm);
  const regNgrams = ngrams.map((gram) => {
    gram = gram.replace('.', '\\.'); 
    return new RegExp(gram, "i");
  });
  // query for title / number matching any of the RegExps
  query['$or'] = [
    { title: { $in: regNgrams } },
    { number: { $in: regNgrams } },
  ]; 
  // return pagination information; limit to 100 
  const total = await SISCV.countDocuments(query).exec(); 
  result.pagination = {
    page: page, 
    limit: PERPAGE, 
    last: total <= 100 ? Math.ceil(total / PERPAGE) : 10, 
    total: total <= 100 ? total : 100, 
  }
  // query for courses
  let courses = await SISCV.find(query); 
  // calculate priority; summate the matching substring lengths 
  courses.forEach((course, i) => {
    for (let gram of ngrams) {
      if (course.title.toLowerCase().includes(gram) || course.number.toLowerCase().includes(gram)) {
        courses[i].priority = courses[i].priority + gram.length || gram.length; 
      }
    }
  });
  // sort by descending priority 
  courses = courses.sort((c1, c2) => c2.priority - c1.priority); 
  // skip and limit according to page 
  result.courses = courses.slice(page * PERPAGE, (page + 1) * PERPAGE); 
  return result; 
}

// return true if userCourse is offered in newTerm 
const checkDestValid = (sisCourses, userCourse, newTerm) => {
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
}

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
  const match = await SISCV.findOne(query); 
  if (match == null) {
    return errorHandler(
      res,
      404,
      "Did not find any course or the course specified is not offered in this term."
    );
  } 
  try {
    let course = {};
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

const REVIEW_STATUS = {
  PENDING: "PENDING", 
  UNDERREVIEW: "UNDERREVIEW", 
  APPROVED: "APPROVED", 
  REJECTED: "REJECTED"
}; 

const NOTIF_TYPE = {
  PLAN: "PLAN", 
  PLANREVIEW: "PLANREVIEW", 
  USER: "USER", 
  DISTRIBUTION: "DISTRIBUTION"
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
  sendCourseVersion
};
