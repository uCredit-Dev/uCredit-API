const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let plan1 = [];
let course1 = [];
let deadPlan = [];

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
        user_id: 'TEST_USER',
        term: "spring",
        credits: 4,
        year: "Junior",
        plan_id: plan1._id,
      };      
      const response3 = await request.post("/api/courses").send(course);
      course1 = response3.body.data;
      done();
      deadPlan = await request.delete(`/api/plans/${plan1._id}`);
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
    for (let id of deadPlan.year_ids) {
      expect(years.findById(id)).toBeFalsy();
    }
  });
  it("should delete associated distribution objects", async () => {
    expect(distributions.find({ plan_id: deadPlan._id })).toBeFalsy(); 
  });
  it("should delete associated course objects", async () => {
    expect(courses.findById(course1._id)).toBeFalsy();
  });
});

const data = { test: true };