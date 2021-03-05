const axios = require("axios");
const fs = require("fs");

let courses;
axios
  .get(
    `https://sis.jhu.edu/api/classes?key=c6DTXIBAujqzphi1T19D8pn3qajbp8BX&school=Whiting%20School%20of%20Engineering&term=Fall%202020&term=Fall%202020`
  )
  .then((response) => {
    console.log("retrieved raw courses");
    courses = response.data.filter((course) => course.SectionName === "01"); //filter duplicate section courses
    console.log(courses[0]);
    courses = extractProperty(courses);
    fs.writeFile("ENFA20.json", JSON.stringify(courses), (err) => {
      if (err) {
        throw err;
      }
      console.log("JSON data is saved.");
    });
  })
  .catch((err) => console.log(err));

function extractProperty(courses) {
  let briefCourses = [];
  for (let i in courses) {
    //extract attributes
    let brief = {
      title: courses[i].Title,
      number: courses[i].OfferingName,
      areas: courses[i].Areas,
      term: courses[i].Term,
      school: courses[i].SchoolName,
      department: courses[i].Department,
      credit: courses[i].Credits,
      wi: courses[i].IsWritingIntensive === "Yes" ? true : false,
    };
    briefCourses.unshift(brief);
  }
  console.log("finished processing");
  return briefCourses;
}
