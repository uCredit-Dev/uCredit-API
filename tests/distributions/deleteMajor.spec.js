const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let major1 = [];
let plan1 = [];
let course1 = [];

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributions", { useNewUrlParser: true })
    .then(async () => {
      const response1 = await request.post("/api/majors").send(allMajors[0]);
      major1 = response1.body.data;
      const response2 = await request.post("/api/plans").send({
        name: "plan1",
        user_id: 'TESTUSER',
        majors: ["CS"],
        expireAt: new Date(),
        year: "Junior",
      });
      plan1 = response2.body.data;
      const course = {
        user_id: "TESTUSER",
        distribution_ids: plan1.distribution_ids,
        title: "Test Course",
        term: "spring",
        credits: 4,
        year: "Junior",
        year_id: "" + plan1.year_ids[3],
        plan_id: plan1._id,
      };
      const response3 = await request.post("/api/courses").send(course);
      course1 = response3.body.data;
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.collection("distributions").drop(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("Deleting a major", () => {
  it("should delete associated distribution objects", async () => {
    const deadMajor = await request.delete(`/api/majors/${major1._id}`);
    // for id : plan.distribution_ids[] 
        // assert distributions.findById(id).major_id != deadMajor_id  
  });
  it("should not delete other major distribution objects", async () => {
  });
});

const data = { test: true };