users = require("../model/User");

const user = {
  _id: "user",
  name: "user",
  email: "none",
  affiliation: "STUDENT",
  school: "none",
  grade: "AE UG Freshman",
  plan_ids: [],
};

function createUser() {
  users.create(user);
}

module.exports = { user, createUser };
