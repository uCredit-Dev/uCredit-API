//routes to handle search requests
import express from "express";
import { returnData, errorHandler, missingHandler } from "./helperMethods.js";
import SISCV from "../model/SISCourseV.js";

const router = express.Router();

router.get("/api/search/all", async (req, res) => {
  try {
    const courses = await SISCV.find({}).exec();
    returnData(courses, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

router.get("/api/search/skip/:num", async (req, res) => {
  const toSkip = req.params.num;
  const mod = parseInt(req.query.mod);
  if (!toSkip || !mod) {
    return missingHandler(res, { toSkip, mod });
  }
  try {
    const courses = await SISCV.find({})
      .skip(toSkip * mod)
      .limit(mod);
    returnData(courses, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//return all versions of the course based on the filters
router.get("/api/search", async (req, res) => {
  let queryTerm =
    req.query.term === "All" || !req.query.term ? "" : req.query.term;
  if (queryTerm.length > 0) queryTerm += " ";
  queryTerm +=
    req.query.year && req.query.year !== "All" ? req.query.year.toString() : "";
  let query = constructQuery({
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
  try {
    let results = await SISCV.find(query).exec();
    results = results.filter((result) => {
      for (let version of result.versions) {
        return (
          (version.term === queryTerm &&
            req.query.areas &&
            version.areas !== "None") ||
          !req.query.areas
        );
      }
    });
    returnData(results, res);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
});

//return the term version of a specific course
router.get("/api/searchVersion", async (req, res) => {
  const version = req.query.version;
  const title = req.query.title;
  const number = req.query.number;
  if (!version || !title || !number) {
    return missingHandler(res, { version, title, number });
  }
  const query = {
    title,
    number,
    terms: { $in: version },
  };
  try {
    await sendCourseVersion(query, version, res);
  } catch (err) {
    errorHandler(res, 400, err);
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

async function sendCourseVersion(query, version, res) {
  const match = await SISCV.findOne(query).exec();
  if (match == null) {
    return errorHandler(
      res,
      404,
      "Did not find any course or the course specified is not offered in this term."
    );
  }
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

// return min and max possible years for current courses in db
router.get("/api/getYearRange", async (req, res) => {
  // .distinct returns an array of all possible elements in the "terms" array
  try {
    const resp = await SISCV.distinct("terms");
    let years = { min: Infinity, max: -Infinity };
    // parse term for year value and update min / max
    resp.forEach((term) => {
      if (parseInt(term.substring(term.length - 4, term.length)) < years.min)
        years.min = parseInt(term.substring(term.length - 4, term.length));
      if (parseInt(term.substring(term.length - 4, term.length)) > years.max)
        years.max = parseInt(term.substring(term.length - 4, term.length));
    });
    returnData(years, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

export default router;
