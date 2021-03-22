//routes to handle search requests
const express = require("express");
const router = express.Router();
const { returnData, errorHandler } = require("./helperMethods.js");
const SISCourses = require("../model/SISCourse.js");

router.get("/api/search", (req, res) => {
  //console.log(req.query.department);
  const query = constructQuery(
    req.body.query,
    req.body.school,
    req.body.department,
    req.body.term,
    req.body.areas,
    req.body.credits,
    req.body.wi
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
    query.credits = credits;
  }
  if (wi != null) {
    query.wi = wi;
  }
  return query;
}

module.exports = router;
