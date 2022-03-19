/*
    If you want to add fields to the entire collection/model, 
    add them to the schema first and make sure they have a default value.
    Then run this script with the model you want to update.
*/

const db = require("./db");
const plans = require("../model/Plan.js");
const users = require("../model/User.js");

//addFieldsToCollection(users);
//updateFieldsInCollection(plans, {}, { reviewers: [] });
//updateFieldsInCollection(users, {}, { whitelisted_plan_ids: [] });

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
