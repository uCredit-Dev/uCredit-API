const mongoose = require("mongoose");
const supertest = require("supertest");
const createApp = require("../../app");
const plan = require("../../model/Plan");
const request = supertest(createApp());
let plan1 = [];
const planName = "testPlan";
const userName = "User1";
const users = require("../../model/User");

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/plans", { useNewUrlParser: true })
    .then(async () => {
      const response = await request.post("/api/plans").send({
        name: planName,
        user_id: userName,
        majors: ["CS"],
        expireAt: new Date(),
        year: "Junior",
      });
      plan1 = response.body.data;
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.collection("plans").drop(() => {
    mongoose.connection.close(() => done());
  });
});

describe("Plan routes", () => {
  it("Should return plan with the given _id", async () => {
    const id = plan1._id;
    const res = await request.get(`/api/plans/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  it("Should return created plan ", async () => {
    const plan = {
      name: "testPlan2",
      user_id: "User2",
      majors: ["CS"],
      expireAt: new Date(),
      year: "Junior",
    };
    const res = await request.post(`/api/plans`).send(plan);
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.name).toBe(plan.name);
  });

  it("Should return updated plan ", async () => {
    const res = await request.patch(`/api/plans/update`).send({
      plan_id: plan1._id,
      name: "testPlan2",
    });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.name).toBe("testPlan2");
  });

  it("Should return deleted plan ", async () => {
    const planId = plan1._id;
    const res = await request.delete(`/api/plans/${planId}`);
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data._id).toBe(planId);
  });
});
