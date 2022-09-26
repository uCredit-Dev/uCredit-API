const mongoose = require("mongoose");
const supertest = require("supertest");
const users = require("../../model/User");
const plans = require("../../model/Plan");
const createApp = require("../../app");
const TEST_PLAN_NAME_1 = "testPlan1";
const TEST_USER_1 = "User1";
const TEST_MAJOR_1 = "Computer Science";
const TEST_MAJOR_2 = "Math";
const TEST_DATE = new Date(1519129864400);
const TEST_YEAR_1 = "AE UG Freshman";
const TEST_PLAN_NAME_2 = "testPlan2";
const TEST_USER_2 = "User2";
const TEST_YEAR_2 = "AE UG Sophomore";
const postBody1 = {
  name: TEST_PLAN_NAME_1,
  user_id: TEST_USER_1,
  majors: [TEST_MAJOR_1, TEST_MAJOR_2],
  expireAt: TEST_DATE,
  year: TEST_YEAR_1,
  reviewers: [],
};

const postBody2 = {
  name: TEST_PLAN_NAME_2,
  user_id: TEST_USER_2,
  majors: [TEST_MAJOR_1],
  expireAt: TEST_DATE,
  year: TEST_YEAR_2,
  reviewers: [],
};

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/planReview", { useNewUrlParser: true })
    .then(async () => {
      await users.create({ _id: TEST_USER_1, whitelisted_plan_ids: [] });
      await users.create({ _id: TEST_USER_2, whitelisted_plan_ids: [] });
      await request.post("/api/plans").send(postBody1);
      await request.post("/api/plans").send(postBody2);
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("planReview POST route /api/planReview/addReviewer", () => {
  it("should create a new plan review and return the updated plan", async () => {
    const userList = await users.find({});
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const reviewer_id = userList[1]._id;
    const res = await request
      .post("/api/planReview/addReviewer")
      .send({ plan_id, reviewer_id });
    const updatedPlan = res.body.data;
    expect(JSON.stringify(updatedPlan._id)).toBe(JSON.stringify(plan_id));
    expect(updatedPlan.reviewers).toContain(reviewer_id);
  });
});

describe("planReview DELETE route /api/planReview/removeReviewer", () => {
  it("should delete a plan review and return the plan with the removed plan review", async () => {
    const userList = await users.find({});
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const reviewer_id = userList[1]._id;
    await request
      .post("/api/planReview/addReviewer")
      .send({ plan_id, reviewer_id });
    const resp = await request
      .delete("/api/planReview/removeReviewer")
      .send({ plan_id, reviewer_id });
    const updatedPlan = resp.body.data;
    expect(JSON.stringify(updatedPlan._id)).toBe(JSON.stringify(plan_id));
    expect(updatedPlan.reviewers).not.toContain(reviewer_id);
  });
});
