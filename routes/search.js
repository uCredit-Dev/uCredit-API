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
  const query = constructQuery(
    req.query.query,
    req.query.school,
    req.query.department,
    req.query.term,
    req.query.areas,
    req.query.credits,
    req.query.wi,
    req.query.tags
  );
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

function constructQuery(
  userQuery = "",
  school = "",
  department = "",
  term = "",
  areas = "",
  credits,
  wi,
  tags
) {
  let query = {
    $or: [
      { title: { $regex: userQuery, $options: "i" } },
      { number: { $regex: userQuery, $options: "i" } },
    ],
    "versions.school": { $regex: school, $options: "i" },
    "versions.department": { $regex: department, $options: "i" },
    "versions.term": { $regex: term, $options: "i" },
    "versions.areas": { $regex: areas, $options: "i" },
  };
  if (credits != null) {
    let parsed = Number.parseInt(credits);
    if (!isNaN(parsed)) {
      query["versions.credits"] = parsed;
    }
  }
  if (wi != null) {
    if (wi === "1" || wi === "true") {
      query["versions.wi"] = true;
    } else if (wi === "0" || wi === "false") {
      query["versions.wi"] = false;
    }
  }
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
