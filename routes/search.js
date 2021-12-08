//routes to handle search requests
const express = require("express");
const router = express.Router();
const { returnData, errorHandler } = require("./helperMethods.js");
const SISCV = require("../model/SISCourseV.js");

router.get("/api/search/all", (req, res) => {
  SISCV.find({})
    .then((courses) => returnData(courses, res))
    .catch((err) => errorHandler(res, 500, err));
});

router.get("/api/search/skip/:num", (req, res) => {
  const toSkip = req.params.num;
  const mod = parseInt(req.query.mod);
  SISCV.find({})
    .skip(toSkip * mod)
    .limit(mod)
    .then((courses) => returnData(courses, res))
    .catch((err) => errorHandler(res, 500, err));
});

//return all versions of the course based on the filters
router.get("/api/search", (req, res) => {
  const query = constructQuery({
    userQuery: req.query.query,
    school: req.query.school,
    department: req.query.department,
    term: req.query.term,
    areas: req.query.areas,
    credits: req.query.credits,
    wi: req.query.wi,
    tags: req.query.tags
  });
  SISCV.find(query)
    .then((results) => {
      returnData(results, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

//return the term version of a specific course
router.get("/api/searchVersion", (req, res) => {
  const version = req.query.version;
  const title = req.query.title;
  const number = req.query.number;
  if (!version || !title || !number) {
    errorHandler(
      res,
      400,
      "You must provide the specific term, the complete title, and the number of the course."
    );
  } else {
    const query = {
      title,
      number,
      terms: { $in: version },
    };
    sendCourseVersion(query, version, res);
  }
});

function constructQuery(queryObject) {
  let userQuery = queryObject.userQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); //escape special character for regex
  console.log(userQuery);
  let query = {
    $or: [
      { title: { $regex: userQuery, $options: "i" } },
      { number: { $regex: userQuery, $options: "i" } },
    ],
    "versions.school": { $regex: queryObject.school, $options: "i" },
    "versions.department": { $regex: queryObject.department, $options: "i" },
    "versions.term": { $regex: queryObject.term, $options: "i" },
    "versions.areas": { $regex: queryObject.areas, $options: "i" },
  };
  let credits = queryObject.credits;
  if (credits != null) {
    let parsed = Number.parseInt(credits);
    if (!isNaN(parsed)) {
      query["versions.credits"] = parsed;
    }
  }
  let wi = queryObject.wi;
  if (wi != null) {
    if (wi === "1" || wi === "true") {
      query["versions.wi"] = true;
    } else if (wi === "0" || wi === "false") {
      query["versions.wi"] = false;
    }
  }
  let tags = queryObject.tags;
  if (tags != null) {
    query["versions.tags"] = { $in: tags.toUpperCase() };
  }
  return query;
}

function sendCourseVersion(query, version, res) {
  SISCV.findOne(query)
    .then((match) => {
      if (match == null) {
        errorHandler(
          res,
          404,
          "Did not find any course or the course specified is not offered in this term."
        );
      } else {
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
      }
    })
    .catch((err) => errorHandler(res, 400, err));
}

module.exports = router;
