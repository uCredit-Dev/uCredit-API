const mongoose = require("mongoose");
const supertest = require("supertest");
const courses = require("../../model/Course");
const distributions = require("../../model/Distribution");
const fineRequirements = require("../../model/FineRequirement");
const plans = require("../../model/Plan");
const majors = require("../../model/Major");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let planRes = {};
let java = {};
let bsAMS = {};
let bsCS_Old = {};

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
        majors: [bsCS_Old.degree_name, bsAMS.degree_name],
        major_ids: [bsCS_Old._id, bsAMS._id],
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
      // removing AMS
      const body = {
        plan_id: planRes._id,
        majors: [bsCS_Old.degree_name],
        major_ids: [bsCS_Old._id],
      };
      const response4 = await request.patch(`/api/plans/update/`).send(body);
      planRes = response4.body.data;
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("Deleting a major", () => {
  it("should delete associated distribution objects", async () => {
    const updatedPlan = plans.findById(planRes._id);
    expect(updatedPlan).toBeTruthy();
    distributions.find({ plan_id: updatedPlan._id }).then((dists) => {
      dists.forEach((dist) => {
        expect(dist).toBeTruthy();
        expect(dist.major_id).toBe(bsCS_Old._id);
      });
    });
  });
  it("should not delete course objects", async () => {
    let course = await courses.findById(java._id);
    expect(course).toBeTruthy();
  });
  it("should delete distributions and finereqs of major", async () => {
    let course = await courses.findById(java._id);
    for (let id of course.distribution_ids) {
      let dist = await distributions.findById(id);
      expect(dist).toBeTruthy();
      expect(dist.major_id.toString()).toBe(bsCS_Old._id.toString());
    }
    for (let id of course.fineReq_ids) {
      let dist = await fineRequirements.findById(id);
      expect(dist).toBeTruthy();
      expect(dist.major_id.toString()).toBe(bsCS_Old._id.toString());
    }
  });
});

const data = { test: true };
