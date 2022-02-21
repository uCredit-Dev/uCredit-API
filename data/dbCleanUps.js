const db = require("./db");
const plans = require("../model/Plan.js");
const Users = require("../model/User.js");

deleteRemovedPlansFromUser();

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
