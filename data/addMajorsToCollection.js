/*
    If you want to add majors to the production majors collection, 
    first add them to majors.js and allMajors array.
    Then run this script.
*/

const db = require("./db");
const plans = require("../model/Plan.js");
const users = require("../model/User.js");
const { allMajors } = require("./majors");
const majors = require("../model/Major");


// Add ALL majors in allMajors array to production DB
async function addAllMajors() {
    await db.connect();  // comment out this line before running jest test
    majors.insertMany(allMajors)
    .catch((err) => console.log(err));
    console.log(allMajors.length.toString() + " majors added.");
    console.log("Done! Check DB to confirm the documents have been added to the collection.");
  }

// Add a specified major in allMajors array to production DB
  async function addOneMajor(majorName) {
    await db.connect();   // comment out this line before running jest test
    let documentAdded = false;
    for (let major of allMajors) {
        if (major.degree_name === majorName) {
            await majors
            .create(major)
            .then((majorDocument) => {
                documentAdded = true;
                console.log(majorDocument.degree_name + " added.");
                console.log("Done! Check DB to confirm the document has been added to the collection.");
            })
            .catch((err) => console.log(err));
        } 
    }
    if (!documentAdded) {
        console.log("No documents were added to the collection.");
    }
  }

  module.exports = {
    addAllMajors,
    addOneMajor,
  };