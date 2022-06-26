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

describe("delete a plan", () => {
  it("should delete associated year objects", async () => {
    const deadPlan = await request.delete(`/api/plans/${plan1._id}`);
    // for id : deadPlan.year_ids[] 
        // assert years.findById(id) == undefined  
  });
  it("should delete associated distribution objects", async () => {
    // for id : deadPlan.distribution_ids[] 
        // assert distributions.findById(id) == undefined  
  });
  it("should delete associated course objects", async () => {
    // assert courses.findById(course1._id) == undefined  
  });
});

const data = { test: true };