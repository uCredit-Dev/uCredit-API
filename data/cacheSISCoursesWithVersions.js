/* 
  This script caches courses from the SIS API. 
  If a course is already in the database, 
  it will attach its version to the existing document.
  If it is a new course, a new document will be created
  and added to the SISCourseV collection.
  Courses that include these titles will be ommitted:
  "independent study", "internship", "independent research"
*/
require("dotenv").config(); //search for env variables
const SISCoursesV = require("../model/SISCourseV.js");
const db = require("./db.js");
const axios = require("axios");
const key = process.env.SIS_API_KEY;

const terms = [
  "Fall 2019",
  "Intersession 2020",
  "Spring 2020",
  "Summer 2020",
  "Fall 2020",
  "Intersession 2021",
  "Spring 2021",
  "Summer 2021",
  "Fall 2021",
  "Intersession 2022",
  "Spring 2022",
]; //, "Fall 2019", "Spring 2020", "Spring 2021", "Spring 2022"]; //specify the terms you want to cache

cache();

async function cache() {
  console.log("connecting to db...");
  await db.connect();
  console.log("db connected");
  for (let i = 0; i < terms.length; i++) {
    await cacheCourse(terms[i]);
  }
}

async function cacheCourse(term) {
  let courses = await cleanDup(term);
  console.log(courses.length);
  const newCourses = await extractProperty(courses, term);
  SISCoursesV.insertMany(newCourses)
    .then((result) => console.log(term, " saved to database!"))
    .catch((err) => console.log(err));
}

/*
  Term example: "Fall 2021" *must include space*
*/
async function cleanDup(term) {
  console.log("fetching raw data from SIS and filter unique course number...");
  const filteredCourses = [];
  await axios
    .get(
      `https://sis.jhu.edu/api/classes/?key=${key}&term=${term}&school=Krieger School of Arts and Sciences&school=Whiting School of Engineering`
    )
    .then((res) => {
      const data = res.data;

      console.log("length before filter dup is " + data.length);
      for (let i in data) {
        const course = data[i];
        //check if course is a dup
        const index = filteredCourses.findIndex(
          (e) => e.OfferingName == course.OfferingName
        );
        if (index == -1) {
          filteredCourses.push(course);
        }
      }
      console.log("length after filter dup is " + filteredCourses.length);
    })
    .catch((err) => console.log(err));
  return filteredCourses;
}

async function extractProperty(courses, term) {
  let briefCourses = [];
  let dupCount = 0;
  let bp = 0;
  for (let i in courses) {
    const course = courses[i];
    if (!byPass(course)) {
      //check against db for course number
      let courseFromDB = await SISCoursesV.findOne({
        number: course.OfferingName,
        title: course.Title,
      }).exec();
      if (courseFromDB == null) {
        pushNewCourse(course.OfferingName, course.SectionName, briefCourses, term);
      } else {
        //update terms offered and add version
        //console.log("-----found dup in db: ", courseFromDB.title);
        //courseFromDB.terms.splice(0, 1);
        courseFromDB.terms.unshift(course.Term);
        pushNewVersion(course.OfferingName, course.SectionName, courseFromDB, term);
        dupCount++;
      }
    } else {
      console.log("******bypassed ", course.Title, course.OfferingName, course.Credits);
      bp++;
    }
  }
  await sleep(10000);
  console.log("new course amount saved to db: " + briefCourses.length);
  console.log("dupCount across db: " + dupCount);
  console.log("bypassed: " + bp);
  return briefCourses;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function pushNewCourse(offeringName, section, briefCourses, TERM) {
  const regex = /\./g;
  const number = offeringName.replace(regex, "") + section;
  await axios
    .get(`https://sis.jhu.edu/api/classes/${number}/${TERM}?key=${key}`)
    .then((res) => {
      const course = res.data[res.data.length - 1];
      const details = course.SectionDetails[0];
      //extract attributes
      let brief = {
        title: course.Title,
        number: course.OfferingName,
        terms: [course.Term],
        versions: [
          {
            areas: course.Areas,
            term: course.Term,
            school: course.SchoolName,
            department: course.Department,
            credits: Number.parseFloat(course.Credits),
            wi: course.IsWritingIntensive === "Yes" ? true : false,
            level: course.Level,
            bio: details.Description,
            preReq: details.Prerequisites,
            coReq: details.CoRequisites,
            restrictions: details.Restrictions,
            tags: details.PosTags.length == 0 ? [] : getField(details.PosTags, "Tag"),
          },
        ],
      };
      if (brief.title != undefined) {
        briefCourses.push(brief);
      }
      console.log("$$$$$new course:", brief.title);
    })
    .catch((err) => console.log(err));
}

async function pushNewVersion(offeringName, section, courseFromDB, TERM) {
  const regex = /\./g;
  const number = offeringName.replace(regex, "") + section;
  await axios
    .get(`https://sis.jhu.edu/api/classes/${number}/${TERM}?key=${key}`)
    .then((res) => {
      const course = res.data[res.data.length - 1];
      const details = course.SectionDetails[0];
      //extract attributes
      let version = {
        areas: course.Areas,
        term: course.Term,
        school: course.SchoolName,
        department: course.Department,
        credits: Number.parseFloat(course.Credits),
        wi: course.IsWritingIntensive === "Yes" ? true : false,
        level: course.Level,
        bio: details.Description,
        preReq: details.Prerequisites,
        coReq: details.CoRequisites,
        restrictions: details.Restrictions,
        tags: details.PosTags.length == 0 ? [] : getField(details.PosTags, "Tag"),
      };
      if (version.wi != undefined) {
        courseFromDB.versions.unshift(version);
        courseFromDB.save();
      }
    })
    .catch((err) => console.log(err));
}

/*
  Example 
  "arr": [
              {
                  "field": "xxx",
              },
              {
                  "field": "yyy",
              },
              {
                  "field": "zzz",
              },
          ]
  brief = ["xxx", "yyy", "zzz"];
  */
function getField(arr, field) {
  let brief = [];
  for (let i = 0; i < arr.length; i++) {
    const p = arr[i];
    if (!brief.includes(p[field])) {
      brief.push(p[field]);
    }
  }
  //console.log("processed field array:", brief);
  return brief;
}
