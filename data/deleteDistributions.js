/*
    If you want to add majors to the production majors collection, 
    first add them to majors.js and allMajors array.
    Then run this script.
*/

const db = require('./db');
const distributions = require('../model/Distribution.js');

deleteDistributionsDocuments();

// Delete all Distributions Documents
async function deleteDistributionsDocuments() {
  await db.connect(); // comment out this line before running jest test
  distributions
    .deleteMany({})
    .then(() => {
      console.log('Distributions documents deleted');
    })
    .catch((error) => {
      console.log(error);
    });
}
