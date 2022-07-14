const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const users = require("../../model/User");
const years = require("../../model/Year");
const distributions = require("../../model/Distribution")
const plans = require("../../model/Plan");
const fineRequirements = require("../../model/FineRequirement");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let planRes = {}; 

const request = supertest(createApp());
beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributions", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      const majorRes = await request.post("/api/majors").send(allMajors[0]);
      const bsCS_Old = await majors.findById(majorRes.body.data._id);
      const samplePlan = {
        name: "TEST_PLAN",
        user_id: 'TEST_USER',
        majors: [bsCS_Old.degree_name],
        major_ids: [bsCS_Old._id],
        expireAt: new Date(),
        year: "Junior",
      };
      const response = await request.post("/api/plans").send(samplePlan);
      planRes = response.body.data; 
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.collection("distributions").drop(() => {
    mongoose.connection.close(() => done());
  });
});

describe("create a plan", () => {
  it("should create a plan", async () => {
    expect(planRes).toBeTruthy(); 
    expect(plans
      .findById(planRes._id))
      .toBeTruthy(); 
  });
  it("user object should contain new plan id", async () => {
    const user = users.findById(planRes.user_id); 
    expect(user).toBeTruthy(); 
    expect(planRes.user_id).toBe("TEST_USER");
    const plan = await plans.findOne({ user_id: planRes.user_id }); 
    expect(plan.user_id).toBe(planRes.user_id);
  });
  it("should be associated with a major object", async () => {
    planRes.major_ids.forEach((m_id) => {
      let major = majors.findById(m_id); 
      expect(major).toBeTruthy(); 
    })
  });
  it("should create associated year objects", async () => {
    planRes.years.forEach(async (y_id) => {
      let year = await years.findById(y_id); 
      expect(year).toBeTruthy();
      expect(year.plan_id.toString()).toBe(planRes._id);
    })
  });
  it("should create associated distribution objects", async () => {
    const distObjs = await distributions.find({ plan_id: planRes._id }).exec();
    expect(distObjs).toBeTruthy(); 
    expect(distObjs.length).toBe(5);
    let count = 0; 
    distObjs.forEach(async (dist) => {
      expect(dist.plan_id.toString()).toBe(planRes._id);
      let fineReqs = await fineRequirements.find({distribution_id: dist._id}).exec();
      fineReqs.forEach((fine) => {
        count = count + 1; 
        expect(fine.distribution_id.toString()).toBe(dist._id.toString());
        expect(fine.plan_id.toString()).toBe(planRes._id);
      })
    })
    expect(count).toBe(9);
  });
});