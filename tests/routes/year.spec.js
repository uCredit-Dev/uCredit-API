const mongoose = require("mongoose");
const supertest = require("supertest");
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
const users = require("../../model/User");
const courses = require("../../model/Course");
const distributions = require("../../model/Distribution");
const years = require("../../model/Year");
const postBody1 = {
  name: TEST_PLAN_NAME_1,
  user_id: TEST_USER_1,
  majors: [TEST_MAJOR_1, TEST_MAJOR_2],
  expireAt: TEST_DATE,
  year: TEST_YEAR_1,
};

const postBody2 = {
  name: TEST_PLAN_NAME_2,
  user_id: TEST_USER_2,
  majors: [TEST_MAJOR_1],
  expireAt: TEST_DATE,
  year: TEST_YEAR_2,
};

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/plans", { useNewUrlParser: true })
    .then(async () => {
      await users.create({ _id: TEST_USER_1 });
      await users.create({ _id: TEST_USER_2 });
      const resp1 = await request.post("/api/plans").send(postBody1);
      const resp2 = await request.post("/api/plans").send(postBody2);
      for (let i = 0; i < 5; i++) {
        const plan = i < 3 ? resp1.body.data : resp2.body.data;
        const courseResp = await courses.create({
          name: `course${i}`,
          plan_id: plan._id,
          year_id: plan.year_ids[0],
          user_id: TEST_USER_1,
          year: TEST_YEAR_1,
          term: "fall",
          credits: 0,
          title: i,
        });

        await years.findByIdAndUpdate(plan.year_ids[0], {
          $push: { courses: courseResp._id },
        });
        const distributionResp = await distributions.create({
          plan_id: plan._id,
          course_id: courseResp._id,
          user_id: TEST_USER_1,
          year: TEST_YEAR_1,
          term: "fall",
          name: i,
          required: true,
          year_id: plan.year_ids[0],
        });
        await distributions.findByIdAndUpdate(distributionResp._id, {
          $push: { courses: courseResp._id },
        });
        await courses.findByIdAndUpdate(courseResp._id, {
          $push: { distribution_ids: distributionResp._id },
        });
      }
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("year GET /api/years/:plan_id route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const id = planList[0]._id;
    const resp = await request.get("/api/years/" + id);
    expect(resp.status).toBe(200);
    expect(resp.body.data.length).toBe(5);
  });

  it("should return status 400 for invalid id", async () => {
    const resp = await request.get("/api/years/%00");
    expect(resp.status).toBe(400);
  });
});

describe("year POST /api/years route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const id = planList[0]._id;
    const resp = await request.post("/api/years").send({
      name: TEST_PLAN_NAME_1,
      user_id: TEST_USER_1,
      year: 2001,
      plan_id: id,
    });
    expect(resp.status).toBe(200);
    expect(resp.body.data.name).toBe(TEST_PLAN_NAME_1);
    expect(resp.body.data.user_id).toBe(TEST_USER_1);
    expect(resp.body.data.year).toBe(2001);
  });

  it("should return status 400 for missing name", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const id = planList[0]._id;
    const resp = await request.post("/api/years").send({
      user_id: TEST_USER_1,
      year: 2001,
      plan_id: id,
    });
    expect(resp.status).toBe(400);
  });

  it("should return status 400 for missing user_id", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const id = planList[0]._id;
    const resp = await request.post("/api/years").send({
      name: TEST_PLAN_NAME_1,
      year: 2001,
      plan_id: id,
    });
    expect(resp.status).toBe(400);
  });
});

describe("year PATCH /api/years/changeOrder route", () => {
  it("given a new order of years for a plan, the order of years should change", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const firstPlan = { ...planList[0]._doc };
    const id = firstPlan._id;
    const yearsTot = firstPlan.year_ids;
    const tmp = yearsTot[0];
    yearsTot[0] = yearsTot[1];
    yearsTot[1] = tmp;
    const resp = await request
      .patch("/api/years/changeOrder")
      .send({ plan_id: id, year_ids: yearsTot });
    expect(resp.status).toBe(200);
    const respYearIDs = resp.body.data.year_ids;
    expect(respYearIDs.length).toBe(5);
    for (let i = 0; i < respYearIDs.length; i++) {
      expect(JSON.stringify(respYearIDs[i])).toBe(JSON.stringify(yearsTot[i]));
    }
  });

  it("should throw 400 for invalid plan id", async () => {
    const resp = await request
      .patch("/api/years/changeOrder")
      .send({ plan_id: "no_exist", year_ids: [] });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for missing plan id", async () => {
    const resp = await request
      .patch("/api/years/changeOrder")
      .send({ year_ids: [] });
    expect(resp.status).toBe(400);
  });
});

describe("year PATCH /api/years/updateName route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const NEW_NAME = "new test";
    const id = planList[0]._doc.year_ids[0];
    const resp = await request
      .patch("/api/years/updateName")
      .send({ year_id: id, name: NEW_NAME });
    expect(resp.status).toBe(200);
    expect(resp.body.data.name).toBe(NEW_NAME);
  });

  it("should throw 400 for invalid year id", async () => {
    const resp = await request
      .patch("/api/years/updateName")
      .send({ year_id: "no_exist", name: TEST_PLAN_NAME_1 });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for invalid missing name", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const id = planList[0]._doc.year_ids[0];
    const resp = await request
      .patch("/api/years/updateName")
      .send({ year_id: id });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for invalid missing year_id", async () => {
    const resp = await request
      .patch("/api/years/updateName")
      .send({ name: TEST_PLAN_NAME_1 });
    expect(resp.status).toBe(400);
  });
});

const NEW_YEAR = 2002;
describe("year PATCH /api/years/updateYear route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const id = planList[0]._doc.year_ids[0];
    const resp = await request
      .patch("/api/years/updateYear")
      .send({ year_id: id, year: NEW_YEAR });
    expect(resp.status).toBe(200);
    expect(resp.body.data.year).toBe(NEW_YEAR);
  });

  it("should throw 400 for invalid year id", async () => {
    const resp = await request
      .patch("/api/years/updateYear")
      .send({ year_id: "no_exist", year: NEW_YEAR });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for invalid missing year", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const id = planList[0]._doc.year_ids[0];
    const resp = await request
      .patch("/api/years/updateYear")
      .send({ year_id: id });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for invalid missing year_id", async () => {
    const resp = await request
      .patch("/api/years/updateYear")
      .send({ year: NEW_YEAR });
    expect(resp.status).toBe(400);
  });
});

describe("year DELETE /api/years/:year_id route", () => {
  it("should return deleted first year", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const id = planList[0]._doc.year_ids[0];
    const resp = await request.delete("/api/years/" + id);
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(JSON.stringify(id));
    const planListAfter = await plans.find({ name: TEST_PLAN_NAME_1 });
    for (let year_id of planListAfter[0]._doc.year_ids) {
      expect(JSON.stringify(year_id)).not.toBe(JSON.stringify(id));
    }
    const courseList = await courses.find({ year_id: id });
    expect(courseList.length).toBe(0);
  });

  it("should return deleted non-first year", async () => {
    const planList = await plans.find({ name: TEST_PLAN_NAME_1 });
    const id = planList[0]._doc.year_ids[planList[0]._doc.year_ids.length - 1];
    const resp = await request.delete("/api/years/" + id);
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(JSON.stringify(id));
    const planListAfter = await plans.find({ name: TEST_PLAN_NAME_1 });
    for (let year_id of planListAfter[0]._doc.year_ids) {
      expect(JSON.stringify(year_id)).not.toBe(JSON.stringify(id));
    }
    const courseList = await courses.find({ year_id: id });
    expect(courseList.length).toBe(0);
  });

  it("should throw 400 for invalid null year_id", async () => {
    const resp = await request.delete("/api/years/%00");
    expect(resp.status).toBe(400);
  });

  it("should throw 500 for invalid year_id", async () => {
    const resp = await request.delete("/api/years/asdffdsad");
    expect(resp.status).toBe(500);
  });
});
