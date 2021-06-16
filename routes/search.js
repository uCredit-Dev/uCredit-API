import { compress } from "compress-json";
//routes to handle search requests
const express = require("express");
const router = express.Router();
const { returnData, errorHandler } = require("./helperMethods.js");
const SISCourses = require("../model/SISCourse.js");
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
    .then((courses) => returnData(compress(courses), res))
    .catch((err) => errorHandler(res, 500, err));
});

//return the term version of a specific course
router.get("/api/searchV", (req, res) => {
  const version = req.query.version;
  if (version) {
    const title = req.query.title;
    const number = req.query.number;
    if (!title || !number) {
      errorHandler(
        res,
        400,
        "The request contains a specific year & term therefore you must provide the complete title and number of the course."
      );
    } else {
      const query = {
        title,
        number,
        terms: { $in: version },
      };
      sendCourseVersion(query, version, res);
    }
  } else {
    const query = constructQueryV(
      req.query.query,
      req.query.school,
      req.query.department,
      req.query.term,
      req.query.areas,
      req.query.credits,
      req.query.wi,
      req.query.tags
    );
    console.log(query);
    sendSearchResult(query, res);
  }
});

function constructQueryV(
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
  console.log("query: ", query);
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
            console.log(v);
            course.version = v;
            //Object.assign(course, v);
          }
        });
        returnData(course, res);
      }
    })
    .catch((err) => errorHandler(res, 400, err));
}

function sendSearchResult(query, res) {
  console.log("in search results");
  SISCV.find(query)
    .then((results) => {
      let courses = [];
      results.forEach((c) => {
        let course = {};
        course.title = c.title;
        course.number = c.number;
        course.terms = c.terms;
        course.version = c.versions[0]; //the most recent semester
        courses.push(course);
      });
      returnData(courses, res);
    })
    .catch((err) => errorHandler(res, 500, err));
}

router.get("/api/search", (req, res) => {
  //console.log(req.query.department);
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
  SISCourses.find(query)
    .then((match) => returnData(match, res))
    .catch((err) => errorHandler(res, 400, err));
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
    school: { $regex: school, $options: "i" },
    department: { $regex: department, $options: "i" },
    terms: { $regex: term, $options: "i" },
    areas: { $regex: areas, $options: "i" },
  };
  if (credits != null) {
    let parsed = Number.parseInt(credits);
    if (!isNaN(parsed)) {
      query.credits = parsed;
    }
  }
  if (wi != null) {
    if (wi === "1" || wi === "true") {
      query.wi = true;
    } else if (wi === "0" || wi === "false") {
      query.wi = false;
    }
  }
  if (tags != null) {
    query.tags = { $in: tags.toUpperCase() };
  }
  return query;
}

module.exports = router;
