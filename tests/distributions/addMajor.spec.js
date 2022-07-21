const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const plans = require("../../model/Plan");
const distributions = require("../../model/Distribution");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let planRes = {};
const request = supertest(createApp());

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/dist", { useNewUrlParser: true, useUnifiedTopology: true })
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
        plan_id: planRes._id, 
        majors: [bsCS_Old.degree_name, bsAMS.degree_name], 
        major_ids: [bsCS_Old._id, bsAMS._id],
      };
      const response4 = await request.patch(`/api/plans/update/`).send(body);
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

describe("Adding a major", () => {
  it("should add a major to plan", async () => {
    const updatedPlan = await plans.findById(planRes._id);
    expect(updatedPlan).toBeTruthy();
    expect(updatedPlan.major_ids.length).toBe(2);
  });
  it("should create associated distribution objects with correct major_id", async () => {
    const updatedPlan = await plans.findById(planRes._id);
    expect(updatedPlan).toBeTruthy(); 
    expect(distributions.count({ plan_id: planRes._id }) > 0);
    distributions
      .find({ plan_id: planRes._id })
      .then((dist) => {
        for (d in dist) {
          expect(d.major_id === updatedPlan.major_ids[0] || d.major_id === updatedPlan.major_ids[1]);
        }
      })
  });
  it("should be associated with one or more of the plan's distribution objects", async () => {
    const distIds = await distributions.find({plan_id: planRes._id});
    expect(distIds.length).toBe(5); // five dists in bsCS
    for (let distId of distIds) {
      let dist = await distributions.findById(distId);
      expect(dist.plan_id.toString()).toBe(planRes._id.toString());
      expect(
        planRes.major_ids.find((m_id) => m_id.toString() === dist.major_id.toString()))
      .toBeTruthy(); 
      expect(
        planRes.major_ids.find((m_id) => m_id.toString() === dist.major_id.toString()))
      .toBeTruthy();
    };
  });
  // check course has been added to distribution 
});