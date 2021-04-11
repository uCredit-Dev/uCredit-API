//cache extra fields from sis
require("dotenv").config(); //search for env variables
const SISCourses = require("../model/SISCourse.js");
const db = require("./db.js");
const axios = require("axios");
const key = process.env.SIS_API_KEY;

async function update() {
  const regex = /\./g;
  db.connect()
    .then(async () => {
      console.log("connected");
      SISCourses.find({ level: null }, "number").then((allCourses) => {
        console.log("found all courses");
        for (let i = 0; i < allCourses.length; i++) {
          let dbCourse = allCourses[i];
          //console.log(dbCourse);
          const number = dbCourse.number.replace(regex, "");
          //console.log("axios for course", number);
          axios
            .get(`https://sis.jhu.edu/api/classes/${number}?key=${key}`)
            .then((res) => {
              //last element in array is the most up to date course
              const section = res.data[res.data.length - 1].SectionName;
              const numberWithSec = number + section;
              console.log("axios for", numberWithSec);
              axios
                .get(
                  `https://sis.jhu.edu/api/classes/${numberWithSec}?key=${key}`
                )
                .then((res) =>
                  addProperty(dbCourse, res.data[res.data.length - 1])
                );
            })
            .catch((err) => console.log(err));
        }
      });
    })
    .catch((err) => console.log(err));
}

function addProperty(course, res) {
  const details = res.SectionDetails[0];
  //console.log(details);
  course.level = res.Level;
  course.bio = details.Description;
  course.preReq = details.Prerequisites;
  course.coReq = details.CoRequisites;
  course.restrictions = details.Restrictions;
  course.tags =
    details.PosTags.length == 0 ? [] : getField(details.PosTags, "Tag");
  console.log("-------saving", course.number);
  course.save();
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

update();
