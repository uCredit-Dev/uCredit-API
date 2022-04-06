// routes to handle search requests
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

// computes all substrings for a single length 
router.get("/api/search/smart/multi", async (req, res) => {
  let fullQuery = req.query.query;
  let substringLength = parseInt(req.query.queryLength, 10); // length parsed from body
  // add some protection here maybe for longer queries? since it's an expensive call
  console.log(req.query);

  let substrings = [];

  for (let start = 0; start <= fullQuery.length - substringLength; start++) {
    substrings.push(fullQuery.slice(start, start + substringLength));
  }
  console.log(substrings);

  const findQueryPromise = (fullQuery) => {
    return new Promise(async (resolve) => {
      const query = constructQuery({
        userQuery: fullQuery,
        school: req.query.school,
        department: req.query.department,
        term: req.query.term,
        areas: req.query.areas,
        credits: req.query.credits,
        wi: req.query.wi,
        tags: req.query.tags,
        level: req.query.level,
      });
      let results = await SISCV.find(query);

    // This filtering needs to be done because backend returns courses with incorrect term and year matching.
    // This needs to be fixed.
    // ^ copied comment from frontend
      results = results.filter((course) => { // moved from frontend processedRetrievedData function
        for (let version of course.versions) {
          if (
            version.term === req.query.term + ' ' + req.query.year ||
            req.query.term === 'All' ||
            req.query.year === 'All'
          )
            return true;
        }
        return false;
      });
      resolve(results);
    });
  }

  let findQueryPromises = substrings.map(substring => findQueryPromise(substring));
  let results = (await Promise.all(findQueryPromises)).flat(1);
  returnData(results, res);
});

//return all versions of the course based on the filters
router.get("/api/search", (req, res) => {
  let queryTerm =
    req.query.term === "All" || !req.query.term ? "" : req.query.term;
  if (queryTerm.length > 0) queryTerm += " ";
  queryTerm +=
    req.query.year && req.query.year !== "All" ? req.query.year.toString() : "";
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
  SISCV.find(query)
    .then((results) => {
      results = results.filter((result) => {
        for (let version of result.versions) {
          if (
            (version.term === queryTerm &&
              req.query.areas &&
              version.areas !== "None") ||
            !req.query.areas
          ) {
            return true;
          }
          return false;
        }
      });
      returnData(results, res);
    })
    .catch((err) => errorHandler(res, 500, err.message));
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

router.get("/api/getYearRange", (req, res) => {
  SISCV.find().then((resp) => {
    let years = { min: Infinity, max: -Infinity };
    resp.forEach((course) => {
      course.terms.forEach((term) => {
        if (parseInt(term.substring(term.length - 4, term.length)) < years.min)
          years.min = parseInt(term.substring(term.length - 4, term.length));
        if (parseInt(term.substring(term.length - 4, term.length)) > years.max)
          years.max = parseInt(term.substring(term.length - 4, term.length));
      });
    });

    returnData(years, res);
  });
});

module.exports = router;
