//cache extra fields from sis
require("dotenv").config(); //search for env variables
const SISCourses = require("../model/SISCourse.js");
const db = require("./db.js");
const axios = require("axios");
const { all } = require("../routes/course.js");
const key = process.env.SIS_API_KEY;

async function update() {
  const regex = /\./g;
  db.connect()
    .then(async () => {
      console.log("connected");
      SISCourses.find({ level: null }, "number").then((allCourses) => {
        console.log("found all courses");
        for (let dbCourse of allCourses) {
          try {
            const number = dbCourse.number.replace(regex, "");
            let res1 = await axios.get(`https://sis.jhu.edu/api/classes/${number}?key=${key}`)
            //last element in array is the most up to date course
            const section = res1.data[res1.data.length - 1].SectionName;
            const numberWithSec = number + section;
            console.log("axios for", numberWithSec);
            let res2 = await axios.get(`https://sis.jhu.edu/api/classes/${numberWithSec}?key=${key}`)
            addProperty(dbCourse, res2.data[res2.data.length - 1]);
          } catch (err) { console.log(err); }
        }
      });
    })
    .catch((err) => console.log(err));
}

function addProperty(course, res) {
  const details = res.SectionDetails[0];
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
  for (let p of arr) {
    if (!brief.includes(p[field])) {
      brief.push(p[field]);
    }
  }
  return brief;
}

update();
