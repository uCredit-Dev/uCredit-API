const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const users = require("../../model/User");
const years = require("../../model/Year");
const distributions = require("../../model/Distribution");
const plans = require("../../model/Plan");
const fineRequirements = require("../../model/FineRequirement");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let planRes = {};

const request = supertest(createApp());
beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/dist", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(async () => {
      const majorRes = await request.post("/api/majors").send(allMajors[0]);
      const bsCS_Old = await majors.findById(majorRes.body.data._id);
      const samplePlan = {
        name: "TEST_PLAN",
        user_id: "TEST_USER",
        major_ids: [bsCS_Old._id],
        expireAt: new Date(),
        year: "Junior",
      };
      const response = await request.post("/api/plans").send(samplePlan);
      planRes = response.body.data;
      done();
    })
    .catch((err) => console.log(err));
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

describe("create a plan", () => {
  it("should create a plan", async () => {
    expect(planRes).toBeTruthy();
    expect(plans.findById(planRes._id)).toBeTruthy();
  });
  it("user object should contain new plan id", async () => {
    const user = users.findById(planRes.user_id).exec();
    expect(user).toBeTruthy();
    expect(planRes.user_id).toBe("TEST_USER");
    const plan = await plans.findOne({ user_id: planRes.user_id }).exec();
    expect(plan.user_id).toBe(planRes.user_id);
  });
  it("should be associated with a major object", async () => {
    planRes.major_ids.forEach((m_id) => {
      let major = majors.findById(m_id).exec();
      expect(major).toBeTruthy();
    });
  });
  it("should create associated year objects", async () => {
    planRes.years.forEach(async (y_id) => {
      let year = await years.findById(y_id).exec();
      expect(year).toBeTruthy();
      expect(year.plan_id.toString()).toBe(planRes._id);
    });
  });
  it("should create associated distribution objects", async () => {
    const distObjs = await distributions.find({ plan_id: planRes._id }).exec();
    expect(distObjs).toBeTruthy();
    expect(distObjs.length).toBe(5);
    var count = 0;
    for (let dist of distObjs) {
      expect(dist.plan_id.toString()).toBe(planRes._id);
      const fineReqs = await fineRequirements.find({
        distribution_id: dist._id,
      }).exec();
      expect(fineReqs.length).toBe(dist.fineReq_ids.length);
      count += fineReqs.length;
      fineReqs.forEach((fine) => {
        expect(fine.distribution_id.toString()).toBe(dist._id.toString());
        expect(fine.plan_id.toString()).toBe(planRes._id);
      });
    }
    expect(count).toBe(9);
  });
});
