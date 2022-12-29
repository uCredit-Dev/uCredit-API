//routes to handle search requests
import express from "express";
import { returnData, errorHandler, simpleSearch, fuzzySearch, constructQuery, sendCourseVersion } from "./helperMethods.js";
import SISCV from "../model/SISCourseV.js";

const router = express.Router();

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
router.get("/api/search", async (req, res) => {
  // page is defined or 0
  const page = parseInt(req.query.page) || 0;
  let result = {};
  // define queryTerm 
  let queryTerm =
    req.query.term === "All" || !req.query.term ? "" : req.query.term;
  if (queryTerm.length > 0) queryTerm += " ";
  queryTerm +=
    req.query.year && req.query.year !== "All" ? req.query.year.toString() : "";
    // construct query for simple search 
  const searchTerm = req.query.query; 
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
  // get 10 matching courses in specified page range
  try {
    if (searchTerm.length <= 3) {
      // simple search if term is 3 letters or less 
      result = await simpleSearch(query, page);
    } else {
      // substring search if term is longer than 3 letters
      result = await fuzzySearch(query, searchTerm, page);
    }
    // result includes courses array and pagination data 
    returnData(result, res);
  } catch (err) {
    errorHandler(res, 500, err.message); 
  }
});

//return all versions of the course based on the filters
router.get("/api/cartSearch", async (req, res) => {
  // define queryTerm 
  let queryTerm =
    req.query.term === "All" || !req.query.term ? "" : req.query.term;
  if (queryTerm.length > 0) queryTerm += " ";
  queryTerm +=
    req.query.year && req.query.year !== "All" ? req.query.year.toString() : "";
    // construct query for simple search 
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
  try {
    let courses = await SISCV.find(query); 
    returnData(courses, res);
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
    await sendCourseVersion(query, version, res);
  }
});

// return min and max possible years for current courses in db
router.get("/api/getYearRange", (req, res) => {
  // .distinct returns an array of all possible elements in the "terms" array
  SISCV.distinct("terms")
    .then((resp) => {
      let years = { min: Infinity, max: -Infinity };
      // parse term for year value and update min / max
      resp.forEach((term) => {
        if (parseInt(term.substring(term.length - 4, term.length)) < years.min)
          years.min = parseInt(term.substring(term.length - 4, term.length));
        if (parseInt(term.substring(term.length - 4, term.length)) > years.max)
          years.max = parseInt(term.substring(term.length - 4, term.length));
      });
      returnData(years, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

export default router;
