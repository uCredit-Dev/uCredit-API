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

describe("add new course to plan", () => {
  it("should be associated with one of the plan's year objects", async () => {
    
    const cs_plan = await plans.findById(plan1._id);
    const cs_reqs = cs_plan.distributions[0];
    // get year objects by course.year_id[i] 
      // check if plan_id == plan1._id 
  });
  it("should be associated with one or more of the plan's distribution objects", async () => {
    
    const cs_plan = await plans.findById(plan1._id);
    const cs_reqs = cs_plan.distributions[0];
    // get year objects by course.distribution_id[i] 
      // check if plan_id == plan1._id 
      // check that courses[] contains course 
      // check that planned = course.credits 
      // check that fine_req satisfied if applicable
      // assert satisfied != true 
  });
  it("cannot be added to different plan object", async () => {
    
    const cs_plan = await plans.findById(plan1._id);
    // get year objects by course.year_id[i] 
      // check if plan_id == plan1._id 
  });
});

const data = { test: true };