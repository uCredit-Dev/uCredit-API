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
    });
});

afterEach((done) => {
  mongoose.connection.db.collection("distributions").drop(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("create a plan", () => {
    it("should create associated year objects", async () => {
        for (let id of plan1.year_ids) {
          expect(years.findById(id)).toBeTruthy();
        }
      });
      it("should create associated distribution objects", async () => {
        expect(distributions
          .find({ plan_id: plan1._id }))
          .toBeTruthy();
      });
  });