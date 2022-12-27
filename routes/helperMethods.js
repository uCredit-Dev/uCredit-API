//some helper methods for routing
const Notifications = require("../model/Notification.js");
const SISCV = require("../model/SISCourseV.js");

//add data field to the response object. If data is null, return 404 error
function returnData(data, res) {
  data
    ? res.json({ data: data })
    : errorHandler(res, 404, "Resource not found");
}

//set status code of the response and send error info to the user in json
function errorHandler(res, status, err) {
  if (res.headersSent) return; 
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
  let notification = { message, user_id };
  if (quick_link_id && link_type) {
    notification.quick_link_id = quick_link_id;
    notification.link_type = link_type;
  }
  const n = await Notifications.create(notification);
  return n;
}

function ngram(query) {
  const MIN_LEN = 3; 
  const queryLen = query.length; 
  query = query.toLowerCase();
  const ngrams = new Set();
  ngrams.add(query);
  for (let substrLen = queryLen; substrLen >= MIN_LEN; substrLen--) {
    for (let i = 0; i <= queryLen - substrLen; i++) {
      ngrams.add(query.slice(i, i + substrLen)); 
    }
  }
  return Array.from(ngrams);
}

async function simpleSearch(query, page) {
  const PERPAGE = 10; 
  const result = {}; 
  const total = await SISCV.countDocuments(query).exec(); 
  result.pagination = {
    page: page, 
    limit: PERPAGE, 
    last: total <= 100 ? Math.ceil(total / PERPAGE) : 10, 
    total: total
  }
  let courses = await SISCV.find(query).skip((page) * PERPAGE).limit(PERPAGE); 
  result.courses = courses; 
  return result; 
}

async function fuzzySearch(query, searchTerm, page) {
  const PERPAGE = 10; 
  const result = {};
  const ngrams = ngram(searchTerm);
  const regNgrams = ngrams.map((gram) => {
    gram = gram.replace('.', '\\.'); 
    return new RegExp(gram);
  });
  // TODO: index title and number 
  query['$or'] = [
    { title: { $in: regNgrams } },
    { number: { $in: regNgrams } },
  ]; 
  const total = await SISCV.countDocuments(query).exec(); 
  result.pagination = {
    page: page, 
    limit: PERPAGE, 
    last: total <= 100 ? Math.ceil(total / PERPAGE) : 10, 
    total: total <= 100 ? total : 100, 
  }
  let courses = await SISCV.find(query); 
  courses.forEach((course, i) => {
    for (let gram of ngrams) {
      if (course.title.toLowerCase().includes(gram) || course.number.toLowerCase().includes(gram)) {
        courses[i].priority = courses[i].priority + gram.length || gram.length; 
      }
    }
  });
  courses = courses.sort((c1, c2) => c2.priority - c1.priority); 
  result.courses = courses.slice(page * PERPAGE, (page + 1) * PERPAGE); 
  return result; 
}

module.exports = {
  returnData,
  errorHandler,
  forbiddenHandler,
  distributionCreditUpdate,
  postNotification,
  simpleSearch,
  fuzzySearch,
};
