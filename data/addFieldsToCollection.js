/*
    If you want to add fields to the entire collection/model, 
    add them to the schema first and make sure they have a default value.
    Then run this script with the model you want to update.
*/

const db = require("./db");
const plans = require("../model/Plan.js");
const users = require("../model/User.js");
const siscoursev = require("../model/SISCourseV.js");

//addFieldsToCollection(users);
//updateFieldsInCollection(plans, {}, { reviewers: [] });
//updateFieldsInCollection(users, {}, { whitelisted_plan_ids: [] });
// removeTerms(); 

// functions that makes sure terms and versions are unique per term offered 
// takes ~10 minutes to run 
async function removeTerms() {
  await db.connect();
  console.log("db connected~\n");
  // aggregate assigns correct terms field with no duplicate terms 
  siscoursev.aggregate([
    {"$addFields": {
      "terms": {"$setUnion": ["$terms", []]}
    }}
  ]).then(async (res) => {
    console.log("Finished aggregating!\n");
    let count = 0; 
    for (let c of res) {
      // get corresponding course 
      const course = await siscoursev.findById(c._id); 
      if (course.terms.length != c.terms.length) {
        // update with unique terms 
        course.terms = c.terms; 
        // update with unique versions 
        const terms = []; 
        const versions = [];
        course.versions.forEach((v) => {
          if (!terms.includes(v.term)) {
            terms.push(v.term);
            versions.push(v);
          }
        })
        course.versions = versions; 
        // save document 
        course.save(); 
        count++; 
        console.log(c.title + " updated!\n"); 
      }
    }
    console.log(count + " courses successfully updated!\n")
  })
  .catch((err) => console.log(err));
}

async function addFieldsToCollection(model) {
  await db.connect();
  model
    .find()
    .then((collection) => {
      collection.forEach((doc) => {
        doc.save();
      });
      console.log(
        "Done! Check DB to confirm the field has been added to all documents."
      );
    })
    .catch((err) => console.log(err));
}

/*
  matchCriteria: an object that filters the document
  modification: an object that specificed the modified field and its new value
*/
async function updateFieldsInCollection(model, matchCriteria, modification) {
  await db.connect();
  model.updateMany(matchCriteria, modification).then((res) => {
    console.log(res.matchedCount, "documents matched.");
    console.log(res.modifiedCount, "documents modified.");
  });
}
