const SISCourses = require("../model/SISCourse.js");
const db = require("./db.js");
const fs = require("fs");
const util = require("util");
const path = require("path");
const readFile = util.promisify(fs.readFile);

async function cacheCourse(fileName) {
  let courses = [];
  await db.connect();
  const data = await readFile(
    path.resolve(__dirname, "../" + fileName),
    "utf-8"
  );
  courses = JSON.parse(data.toString());
  const newCourses = await extractProperty(courses);
  SISCourses.insertMany(newCourses)
    .then((result) => console.log("saved to database!"))
    .catch((err) => console.log(err));
  console.log(
    "started with " + courses.length + " raw courses with unique course numbers"
  );
}

async function extractProperty(courses) {
  let briefCourses = [];
  let dupCount = 0;
  let bp = 0;
  for (let i in courses) {
    const course = courses[i];
    if (!byPass(course)) {
      //check against db for course number
      let courseFromDB = await SISCourses.findOne({
        number: course.OfferingName,
      }).exec();

      if (courseFromDB == null) {
        //extract attributes
        let brief = {
          title: course.Title,
          number: course.OfferingName,
          areas: course.Areas,
          terms: [course.Term],
          school: course.SchoolName,
          department: course.Department,
          credits: Number.parseFloat(course.Credits),
          wi: course.IsWritingIntensive === "Yes"
        };

        console.log("$$$$$new course:", brief.title);
        briefCourses.push(brief);
      } else {
        //update terms offered
        //console.log("-----found dup in db: ", courseFromDB.title);
        courseFromDB.terms.unshift(course.Term);
        courseFromDB.save();
        dupCount++;
      }
    } else {
      console.log(
        "******bypassed ",
        course.Title,
        course.OfferingName,
        course.Credits
      );
      bp++;
    }
  }
  console.log("new course amount saved to db: " + briefCourses.length);
  console.log("dupCount across db: " + dupCount);
  console.log("bypassed: " + bp);
  return briefCourses;
}

function byPass(course) {
  let title = course.Title.toLowerCase();
  let credit = Number.parseFloat(course.Credits);
  return (
    title.includes("independent study") ||
    title.includes("internship") ||
    title.includes("independent research") ||
    isNaN(credit)
  );
}

const filename = "ftrFA2021.json";
cacheCourse(filename);

module.exports = { cacheCourse };
