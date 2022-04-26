const mongoose = require("mongoose");
const supertest = require("supertest");
const createApp = require("../../app");
const plan = require("../../model/Plan");
const request = supertest(createApp());
let plan1 = [];
const planName = "testPlan";
const userName = "User1";
const users = require("../../model/User");

//INCOMPLETE
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
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

describe("Plan Routes", () => {
  it("Should return plan with the given _id", async () => {
    const id = plan1._id;
    const res = await request.get(`/api/plans/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  //Broken but why? Is this endpoint not working? I dont think this is an endpoint anymore
  // it("Should return all plans of a user", async () => {
  //   const test = await plan.find({});
  //   const userId = test[0].user_id;
  //   await request.get(`/api/plansByUser/${userId}`).then((res) => {
  //     expect(res.status).toBe(200);
  //     expect(res.body.data.userId).toBe(userId);
  //   });
  // });

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
