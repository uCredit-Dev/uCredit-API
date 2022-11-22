const db = require("./db");
const plans = require("../model/Plan.js");
const Users = require("../model/User.js");
const siscoursev = require("../model/SISCourseV.js");

// deleteRemovedPlansFromUser();
// deleteDupVersionsFromCourse();

/* Remove plan ids that no longer exist in the Plan collection from users's plan_ids field */
async function deleteRemovedPlansFromUser() {
  await db.connect();
  await Users.find()
    .then(async (users) => {
      await users.forEach(async (u) => {
        await u.plan_ids.forEach(async (plan_id) => {
          let plan = await plans.findById(plan_id).exec();
          if (plan === null) {
            const updatedUser = await Users.updateOne(
              { _id: u._id },
              { $pull: { plan_ids: plan_id } }
            ).exec();
            console.log(u.name, "removed plan", plan_id);
          }
        });
      });
    })
    .catch((err) => console.log(err));
  console.log("clean up finished!");
}

/* 
    Function that removes duplicate terms and versions of a SISCourse with versions 
*/ 
async function deleteDupVersionsFromCourse() {
    await db.connect();
    console.log("db connected~\n");
    // aggregate assigns correct terms field with no duplicate terms 
    siscoursev.find({}).then(async (res) => {
      console.log("Fetched all courses!\n");
      let count = 0; 
      for (let course of res) {
        // get terms array with no duplicates 
        const terms = [];
        course.terms.forEach((term) => {
          if (!terms.includes(term)) {
            terms.push(term);
          }
        });
        // if there were duplicates, 
        if (course.terms.length != terms.length) {
          // update with unique terms 
          course.terms = terms; 
          // update with unique versions 
          const newTerms = []; 
          const versions = [];
          course.versions.forEach((v) => {
            if (!newTerms.includes(v.term)) {
              newTerms.push(v.term);
              versions.push(v);
            }
          })
          course.versions = versions; 
          // save document 
          course.save(); 
          count++; 
          console.log(course.title + " updated!\n"); 
        }
      }
      console.log(count + " courses successfully updated!\n")
    })
    .catch((err) => console.log(err));
  }