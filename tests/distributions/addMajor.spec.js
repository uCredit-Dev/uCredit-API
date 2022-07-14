const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const plans = require("../../model/Plan");
const distributions = require("../../model/Distribution");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let planRes = {};
const request = supertest(createApp());

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributions", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      let majorRes = await request.post("/api/majors").send(allMajors[0]);
      const bsCS_Old = await majors.findById(majorRes.body.data._id);
      majorRes = await request.post("/api/majors").send(allMajors[6]);
      const bsAMS = await majors.findById(majorRes.body.data._id);
      const samplePlan = {
        name: "TEST_PLAN",
        user_id: 'TEST_USER',
        majors: [bsCS_Old.degree_name],
        major_ids: [bsCS_Old._id],
        expireAt: new Date(),
        year: "Junior",
      };
      const response2 = await request.post("/api/plans").send(samplePlan);
      planRes = response2.body.data;
      const course = {
        title: "TEST_COURSE",
        user_id: 'TEST_USER',
        term: "spring",
        credits: 4,
        year: "Junior",
        plan_id: planRes._id,
      };
      const response3 = await request.post("/api/courses").send(course);
      // adding AMS
      const body = {
        id: planRes._id, 
        majors: [bsCS_Old.degree_name, bsAMS.degree_name], 
        major_ids: [bsCS_Old._id, bsAMS._id],
      };
      await request.patch(`/api/plans/update/`).send(body);
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.collection("distributions").drop(() => {
    mongoose.connection.close(() => done());
  });
});

describe("Adding a major", () => {
  it("should add a major to plan", async () => {
    const updatedPlan = await plans.findById(planRes._id);
    expect(updatedPlan).toBeTruthy(); 
    expect(updatedPlan.major_ids.length).toBe(2);
    expect(updatedPlan.majors).toBe([allMajors[0].degree_name, allMajors[6].degree_name]);
  });
  it("should create associated distribution objects with correct major_id", async () => {
    const updatedPlan = await plans.findById(planRes._id);
    expect(updatedPlan).toBeTruthy(); 
    expect(distributions.count({ plan_id: planRes._id }) > 0);
    distributions
      .find({ plan_id: planRes._id })
      .then((dist) => {
        expect(dist.major_id).toBe(updatedPlan.major_ids);
      })
  });
  // check course has been added to distribution 
});