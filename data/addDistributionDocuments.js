const db = require("./db");
const distributions = require("../model/Distribution.js");

// addDistributionsDocuments();

// Delete all Distributions Documents
async function addDistributionsDocuments() {
  await db.connect(); // comment out this line before running jest test
  distributions
    .deleteMany({})
    .then(() => {
      console.log("Distributions documents deleted");
    })
    .catch((error) => {
      console.log(error);
    });
}
