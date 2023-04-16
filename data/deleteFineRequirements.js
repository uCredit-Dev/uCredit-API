const db = require('./db');
const fineRequirements = require('../model/FineRequirement.js');

deleteFineRequirementsDocuments();

// Delete all Distributions Documents
async function deleteFineRequirementsDocuments() {
  await db.connect(); // comment out this line before running jest test
  fineRequirements
    .deleteMany({})
    .then(() => {
      console.log('Fine Requirements documents deleted');
    })
    .catch((error) => {
      console.log(error);
    });
}
