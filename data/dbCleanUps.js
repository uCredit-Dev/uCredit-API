const db = require("./db");
const plans = require("../model/Plan.js");
const Users = require("../model/User.js");
const siscoursev = require("../model/SISCourseV.js");

deleteRemovedPlansFromUser();
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
    Takes up to 10 minutes to run 
*/ 
async function deleteDupVersionsFromCourse() {
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