const db = require("./db");
const Plans = require("../model/Plan.js");

deleteDistributionsFieldFromPlan();

// Delete all Distributions Documents
async function deleteDistributionsFieldFromPlan() {
  await db.connect(); // comment out this line before running jest test
  Plans.find()
    .then((document) => {
      for (let doc of document) {
        doc.distribution_ids = undefined;
        doc.save();
      }
      console.log(
        "Done! Check DB to confirm the field has been eliminated from all documents."
      );
    })
    .catch((err) => console.log(err));
}
