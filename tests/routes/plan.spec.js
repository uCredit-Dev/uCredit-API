const mongoose = require("mongoose");
const supertest = require("supertest");
const createApp = require("../../app");
const plan = require("../../models/plan");
const request = supertest(createApp());

//INCOMPLETE
beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/majors", { useNewUrlParser: true })
    .then(() => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

describe("Plan Routes", () => {
  it("Should return plan with the given _id", async () => {
    const id = "61cce47ca2ec790004427200";
    await request.get(`/api/plans/${id}`).then((res) => {
      res.code.should.equal(200);
      const data = res.body.data;
      data._id.should.equal(id);
    });
  });

  it("Should return all plans of a user", async () => {
    const userId = "guestUser";
    await request.get(`/api/plans/${userId}`).then((res) => {
      res.code.should.equal(200);
      const data = res.body.data;
      data.userId.should.equal(userId);
    });
  });

  it("Should return created plan ", async () => {
    const userId = "guestUser";
    const plan = "";
    await request
      .post(`/api/plans/${userId}`)
      .send(plan)
      .then((res) => {
        res.code.should.equal(200);
        const data = res.body.data;
        data.userId.should.equal(userId);
      });
  });

  it("Should return updated plan ", async () => {
    const userId = "guestUser";
    const planId = "";
    await request
      .post(`/api/plans/${userId}`)
      .send(plan)
      .then((res) => {
        res.code.should.equal(200);
        const data = res.body.data;
        data.userId.should.equal(userId);
      });
  });

  it("Should return deleted plan ", async () => {
    const userId = "guestUser";
    const planId = "";
    await request
      .post(`/api/plans/${userId}`)
      .send(plan)
      .then((res) => {
        res.code.should.equal(200);
        const data = res.body.data;
        data.userId.should.equal(userId);
      });
  });
});
