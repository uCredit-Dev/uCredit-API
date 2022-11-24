const db = require("./db");
const plans = require("../model/Plan.js");
const courses = require("../model/Course.js"); 
const years = require("../model/Year.js");
const comments = require("../model/Comment.js"); 

cleanGuestUsers();
cleanTestUsers();

/* 
  Remove years and comments resulting from playwright tests.
  Test accounts are REVIEWER_DEV and TEST_DEV. 
*/ 
async function cleanTestUsers() {
  await db.connect();
  const deleteAccs = (model, criteria) => {
    model.deleteMany(criteria).then((res) => {
      console.log(model, criteria)
      console.log(res.deletedCount, "documents deleted!");   
    })
  }; 
  deleteAccs(years, {user_id: "REVIEWER_DEV"}); 
  deleteAccs(years, {user_id: "TEST_DEV"}); 
  deleteAccs(comments, {commenter_id: "REVIEWER_DEV"}); 
  deleteAccs(comments, {commenter_id: "TEST_DEV"}); 
}

/* 
  Remove courses, plans, and years associated with guest users.
*/ 
async function cleanGuestUsers() {
  await db.connect();
  await deleteExpired(courses, { user_id: "guestUser" }); 
  await deleteExpired(plans, { user_id: "guestUser" }); 
  await deleteExpired(years, { user_id: "guestUser" }); 
}

/*
  Deletes documents that meet matchCriteria and are expired. 
  model:            an object that specifies a collection in db
  matchCriteria:    an object that filters the document
*/
async function deleteExpired(model, matchCriteria) {
  const now = new Date().toISOString(); 
  let matchExpired = { ...matchCriteria, expireAt: { $lt: now }}; 
  model.deleteMany(matchExpired).then((res) => {
    console.log(model, matchCriteria)
    console.log(res.deletedCount, "documents deleted.");
  }); 
}
