const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const courses = require("../../model/Course");
const distributions = require("../../model/Distribution");
const years = require("../../model/Year");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let plan1 = [];
let course1 = [];
let deadPlan = {};

const samplePlan = {
  name: "TEST_PLAN",
  user_id: 'TEST_USER',
  majors: [allMajors[0].name],
  expireAt: new Date(),
  year: "Junior",
};

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributions", { useNewUrlParser: true })
    .then(async () => {
      const response1 = await request.post("/api/majors").send(allMajors[0]);
      const response2 = await request.post("/api/plans").send(samplePlan);
      plan1 = response2.body.data;
      const course = {
        title: "TEST_COURSE",
        user_id: plan1.user_id,
        term: "spring",
        credits: 4,
        year: "Junior",
        plan_id: plan1._id,
      };      
      const response3 = await request.post("/api/courses").send(course);
      course1 = response3.body.data;
      deadPlan = await request.delete(`/api/plans/${plan1._id}`);
      deadPlan = deadPlan.body.data; 
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
    deadPlan.year_ids.forEach(async (id) => {
      const search = await years.findById(id);
      expect(search).toBeFalsy();
    })
  });
  it("should delete associated distribution objects", async () => {
    const search = await distributions.find({ plan_id: deadPlan._id });
    expect(search.length).toBe(0);
  });
  it("should delete associated course objects", async () => {
    const search = await courses.find({ plan_id: deadPlan._id });
    expect(search.length).toBe(0);
  });
});

const data = { test: true };