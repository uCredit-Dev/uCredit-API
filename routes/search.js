//routes to handle search requests
const express = require("express");
const router = express.Router();
const { returnData, errorHandler } = require("./helperMethods.js");
const SISCourses = require("../model/SISCourse.js");
const e = require("express");

router.get("/api/search", (req, res) => {
  //console.log(req.query.department);
  const query = constructQuery(
    req.query.query,
    req.query.school,
    req.query.department,
    req.query.term,
    req.query.areas,
    req.query.credits,
    req.query.wi
  );
  console.log("constructed query:", query);
  SISCourses.find(query)
    .then((match) => returnData(match, res))
    .catch((err) => errorHandler(res, 500, err));
});

function constructQuery(
  userQuery = "",
  school = "",
  department = "",
  term = "",
  areas = "",
  credits,
  wi
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
    } else if (wi === "1" || wi === "false") {
      query.wi = false;
    }
  }
  return query;
}

module.exports = router;
