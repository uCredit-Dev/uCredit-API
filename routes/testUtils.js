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

function createUser(id = "user") {
  const createdUser = { ...user, _id: id };
  users.create(createdUser);
  return createdUser;
}

module.exports = { user, createUser };
