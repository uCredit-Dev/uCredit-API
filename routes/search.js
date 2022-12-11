//routes to handle search requests
const express = require("express");
const router = express.Router();
const { returnData, errorHandler, trigram } = require("./helperMethods.js");
const SISCV = require("../model/SISCourseV.js");
const Year = require("../model/Year.js");

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
router.get("/api/search/:page", async (req, res) => {
  const page = parseInt(req.params.page) || 0;
  const PERPAGE = 10;
  const result = {};
  // define queryTerm 
  let queryTerm =
    req.query.term === "All" || !req.query.term ? "" : req.query.term;
  if (queryTerm.length > 0) queryTerm += " ";
  queryTerm +=
    req.query.year && req.query.year !== "All" ? req.query.year.toString() : "";
  // construct query 
  const query = constructQuery({
    userQuery: req.query.query,
    school: req.query.school,
    department: req.query.department,
    term: queryTerm,
    areas: req.query.areas,
    wi: req.query.wi,
    credits: req.query.credits,
    tags: req.query.tags,
    level: req.query.level,
  });
  
  // if (req.query.query.length <= 3) {
    // simpleSearch();
    try {
      const total = await SISCV.countDocuments(query).exec(); 
      result.pagination = {
        page: page, 
        limit: PERPAGE, 
        last: Math.ceil(total / PERPAGE), 
        total: total
      }
      let courses = await SISCV.find(query).skip((page - 1) * PERPAGE).limit(PERPAGE); 
      result.courses = courses.filter((course) => {
        for (let version of course.versions) {
          return (
            (version.term === queryTerm &&
              req.query.areas &&
              version.areas !== "None") ||
            !req.query.areas
          );
        }
      });
      returnData(result, res);
    } catch (err) {
      errorHandler(res, 500, err.message); 
    }
  // } else {
  //   fuzzySearch();
  // }
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
    "versions.school": { $regex: school, $options: "i" },
    "versions.department": { $regex: department, $options: "i" },
    "versions.term": { $regex: term, $options: "i" },
    "versions.level": { $regex: level, $options: "i" },
  };
  if (areas !== "") {
    query["versions.areas"] = {
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

// return min and max possible years for current courses in db 
router.get("/api/getYearRange", (req, res) => {
  // .distinct returns an array of all possible elements in the "terms" array 
  SISCV.distinct("terms").then((resp) => {
    let years = { min: Infinity, max: -Infinity };
    // parse term for year value and update min / max 
    resp.forEach((term) => {
      if (parseInt(term.substring(term.length - 4, term.length)) < years.min)
        years.min = parseInt(term.substring(term.length - 4, term.length));
      if (parseInt(term.substring(term.length - 4, term.length)) > years.max)
        years.max = parseInt(term.substring(term.length - 4, term.length));
    })
    returnData(years, res);
  })
  .catch((err) => errorHandler(res, 400, err));
});

module.exports = router;
