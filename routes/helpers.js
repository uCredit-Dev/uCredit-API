const plans = require("../model/Plan.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const years = require("../model/Year.js");

const addCourse = async (course) => {
  const retrievedCourse = await courses.create(course)
  //add course id to user plan's year array
  let query = {};
  query[retrievedCourse.year] = retrievedCourse._id; //e.g. { freshman: id }
  plans.findByIdAndUpdate(retrievedCourse.plan_id, { $push: query }).exec();
  years
    .findByIdAndUpdate(retrievedCourse.year_id, {
      $push: { courses: retrievedCourse._id },
    })
    .exec();
  return retrievedCourse;
}

module.exports = {
  addCourse
}