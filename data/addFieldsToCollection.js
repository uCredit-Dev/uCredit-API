/*
    If you want to add fields to the entire collection/model, 
    add them to the schema first and make sure they have a default value.
    Then run this script with the model you want to update.
*/

const db = require("./db");
const plans = require("../model/Plan.js");
const users = require("../model/User.js");

addFieldsToCollection(users);
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
