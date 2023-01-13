//routes to handle search requests
import express from "express";
import { 
  returnData,
  errorHandler, 
  simpleSearch, 
  fuzzySearch, 
  constructQuery, 
  sendCourseVersion 
} from "./helperMethods.js";
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
  if (isNaN(toSkip) || isNaN(mod)) {
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

router.get("/api/searchNumber/:number", async (req, res) => {
  let number = req.params.number;
  try {
    let courses = await SISCV.find({ number }).exec();
    if (courses.length == 0) {
      if (number.includes('EN.600'))
        number = number.replace('EN.600', 'EN.601');
      else if (number.includes('EN.550'))
        number = number.replace('EN.550', 'EN.553');
      courses = await SISCV.find({ number }).exec();
      if (courses.length == 0) {
        return errorHandler(res, 404, { message: "Course not found" }); 
      }
    } 
    returnData(courses[0], res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
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
    if (!searchTerm || searchTerm.length <= 3) {
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
    missingHandler(res, { version, title, number }); 
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
