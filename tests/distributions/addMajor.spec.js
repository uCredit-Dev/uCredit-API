const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const plans = require("../../model/Plan");
const courses = require("../../model/Course");
const distributions = require("../../model/Distribution");
const fineRequirements = require("../../model/FineRequirement");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let planRes = {};
let java = {};
let bsAMS = {};
let bsCS_Old = {};
const request = supertest(createApp());

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/dist", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      let majorRes = await request.post("/api/majors").send(allMajors[0]);
      bsCS_Old = await majors.findById(majorRes.body.data._id);
      majorRes = await request.post("/api/majors").send(allMajors[7]);
      bsAMS = await majors.findById(majorRes.body.data._id);
      const samplePlan = {
        name: "TEST_PLAN",
        user_id: "TEST_USER",
        majors: [bsCS_Old.degree_name],
        major_ids: [bsCS_Old._id],
        expireAt: new Date(),
        year: "Junior",
      };
      const response2 = await request.post("/api/plans").send(samplePlan);
      planRes = response2.body.data;
      const course = {
        title: "Gateway Computing: Java",
        department: "EN Computer Science",
        number: "EN.500.112",
        user_id: "TEST_USER",
        term: "spring",
        credits: 4,
        year: "Junior",
        plan_id: planRes._id,
      };
      const response3 = await request.post("/api/courses").send(course);
      java = response3.body.data;
      // adding AMS
      const body = {
        plan_id: planRes._id,
        majors: [bsCS_Old.degree_name, bsAMS.degree_name],
        major_ids: [bsCS_Old._id, bsAMS._id],
      };
      const response4 = await request.patch(`/api/plans/update/`).send(body);
      planRes = response4.body.data._doc;
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
  it("should be associated with one or more of the plan's distribution objects", async () => {
    const distIds = await distributions.find({ plan_id: planRes._id });
    expect(distIds.length).toBe(13); // 5 in bsCS, 8 in ams
    for (let distId of distIds) {
      let dist = await distributions.findById(distId);
      expect(dist.plan_id.toString()).toBe(planRes._id.toString());
      expect(
        planRes.major_ids.find(
          (m_id) => m_id.toString() === dist.major_id.toString()
        )
      ).toBeTruthy();
    }
  });
  it("should create associated distribution objects with new major_id", async () => {
    const updatedPlan = await plans.findById(planRes._id);
    expect(updatedPlan).toBeTruthy();
    expect(distributions.count({ plan_id: planRes._id }) > 0);
    const csCount = await distributions.count({
      plan_id: planRes._id,
      major_id: updatedPlan.major_ids[0],
    });
    const amsCount = await distributions.count({
      plan_id: planRes._id,
      major_id: updatedPlan.major_ids[1],
    });
    expect(csCount).toBe(5);
    expect(amsCount).toBe(8);
  });
  it("should create associated fineReq objects with new major_id", async () => {
    const updatedPlan = await plans.findById(planRes._id);
    expect(updatedPlan).toBeTruthy();
    expect(fineRequirements.count({ plan_id: planRes._id }) > 0);
    const csCount = await fineRequirements.count({
      plan_id: planRes._id,
      major_id: updatedPlan.major_ids[0],
    });
    const amsCount = await fineRequirements.count({
      plan_id: planRes._id,
      major_id: updatedPlan.major_ids[1],
    });
    expect(csCount).toBe(9);
    expect(amsCount).toBe(15);
  });
  it("should create associate fineReq objects with distribution objects", async () => {
    const updatedPlan = await plans.findById(planRes._id);
    expect(updatedPlan).toBeTruthy();
    let csCount = 0;
    await distributions
      .find({ plan_id: updatedPlan._id, major_id: updatedPlan.major_ids[0] })
      .then((dists) => {
        for (let dist of dists) {
          csCount += dist.fineReq_ids.length;
        }
      });
    let amsCount = 0;
    await distributions
      .find({ plan_id: updatedPlan._id, major_id: updatedPlan.major_ids[1] })
      .then((dists) => {
        for (let dist of dists) {
          amsCount += dist.fineReq_ids.length;
        }
      });
    expect(csCount).toBe(9);
    expect(amsCount).toBe(15);
  });
  it("should should add existing courses to new distribution objects", async () => {
    java = await courses.findById(java._id);
    expect(java.distribution_ids.length).toBe(2);
    for (let distId of java.distribution_ids) {
      const dist = await distributions.findById(distId);
      expect(dist).toBeTruthy();
      expect(dist.major_id === bsCS_Old._id || dist.major_id === bsAMS._id);
      if (dist.major_id === bsCS_Old._id) {
        expect(dist.name).toBe("Computer Science");
      }
      if (dist.major_id === bsAMS._id) {
        expect(dist.name).toBe("Computer Languages and Programming");
      }
      expect(dist.planned).toBe(4);
    }
    expect(java.fineReq_ids.length).toBe(1);
    const fine = await fineRequirements.findById(java.fineReq_ids[0]);
    expect(fine).toBeTruthy();
    expect(fine.description.includes("Lower Level Undergraduate")).toBeTruthy();
    expect(fine.planned).toBe(4);
  });
});
