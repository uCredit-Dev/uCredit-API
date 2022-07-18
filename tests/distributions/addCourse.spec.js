const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const distributions = require("../../model/Distribution");
const plans = require("../../model/Plan");
const years = require("../../model/Year");
const courses = require("../../model/Course");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");
const FineRequirement = require("../../model/FineRequirement");

let bsCS_New = {};
let plan1 = {};
let course1 = {};
let course2 = {};

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributinos", { useNewUrlParser: true })
    .then(async () => {
      const response1 = await request.post("/api/majors").send(allMajors[1]);
      bsCS_New = response1.body.data;
      const samplePlan = {
        name: "TEST_PLAN",
        user_id: 'TEST_USER',
        majors: [bsCS_New.degree_name],
        major_ids: [bsCS_New._id],
        expireAt: new Date(),
        year: "Junior",
      };
      const response2 = await request.post("/api/plans").send(samplePlan);
      plan1 = response2.body.data;
      const java = {
        title: "GATEWAY COMPUTING: JAVA",
        user_id: 'TEST_USER',
        term: "spring",
        credits: 3,
        year: "Junior",
        plan_id: plan1._id,
        number: "EN.500.112"
      };
      const expos = {
        title: "expos",
        user_id: "TEST_USER",
        number: "AS.060.113",
        term: "spring",
        year: "Freshman",
        wi: true,
        plan_id: plan1._id,
        credits: 3,
      };
      const response3 = await request.post("/api/courses").send(java);
      const response4 = await request.post("/api/courses").send(expos);
      course1 = response3.body.data;
      course2 = response4.body.data;
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("add new course to plan", () => {
  it("should return posted course", async () => {
    expect(course1.title).toBe("GATEWAY COMPUTING: JAVA");
    expect(course1.user_id).toBe("TEST_USER");
    expect(course1.year).toBe("Junior");
    expect(course1.term).toBe("spring");
    expect(course1.credits).toBe(3);
  });
  it("should be associated with one of the plan object", async () => {
    const plan = await plans.findById(plan1._id);
    const course = await courses.findById(course1._id);
    expect(plan._id.toString()).toBe(course.plan_id.toString());
    expect(plan.user_id).toBe(course.user_id);
  });
  it("should be associated with one of the plan's year objects", async () => {
    const plan = await plans.findById(plan1._id);
    const course = await courses.findById(course1._id);
    const year = await years.findById(course.year_id);
    expect(plan.year_ids.find((id) => id.toString() === course.year_id.toString())).toBeTruthy(); 
    expect(year.plan_id.toString()).toBe(plan._id.toString());
    expect(year.user_id.toString()).toBe(plan.user_id.toString());
    expect(year.courses.find((c) => c.toString() === course._id.toString())).toBeTruthy();
  });
  it("should be associated with one or more of the plan's distribution objects", async () => {
    const plan = await plans.findById(plan1._id);
    const distIds = distributions.find({plan_id: plan._id});
    expect(distIds.length).toBeTruthy();
    expect(distIds.length).toBe(5);
    distIds.forEach(async (distId) => {
      let dist = await distributions.findById(distId);
      expect(dist.plan_id.toString()).toBe(plan._id.toString());
      expect(dist.user_id.toString()).toBe(plan.user_id.toString());
      expect(dist.major_id.toString()).toBe(plan.major_id.toString());
      expect(dist.planned).toBe(6);
      expect(
        dist.courses.find((courseId) => courseId === course._id).exists()
      ).toBeTruthy(); 
      // check that fine_req satisfied if applicable
    });
  });
  it("should be associated with the two course objects", async () => {
    const java = await courses.findById(course1._id); //java
    const wi = await courses.findById(course2._id); //wi
    java.distribution_ids.forEach(async (distId) => {
      const dist = await distributions.findById(distId);
      expect(dist.plan_id.toString()).toBe(java.plan_id.toString());
      expect(dist.user_id.toString()).toBe(java.user_id.toString());
      expect(dist.planned).toBe(java.credits);
      expect(dist.satisfied).toBe(false);
      expect(dist.name).toBe('Computer Science');
      expect(dist.fineReq_ids).toBeTruthy(); 
      const fine = await FineRequirement.findById(dist.fineReq_ids[1]); 
      expect(fine.planned).toBe(java.credits);
      expect(fine.satisfied).toBe(false);
    });
    wi.distribution_ids.forEach(async (distId) => {
      const dist = await distributions.findById(distId);
      expect(dist.plan_id.toString()).toBe(wi.plan_id.toString());
      expect(dist.user_id.toString()).toBe(wi.user_id.toString());
      expect(dist.planned).toBe(wi.credits);
      expect(dist.satisfied).toBe(false);
      if (dist.wi) {
        expect(dist.name).toBe('Writing Intensive');
        const fine = await FineRequirement.findById(dist.fineReq_ids[0]);
        expect(fine.planned).toBe(wi.credits);
      } else {
        expect(dist.name).toBe('Liberal Arts');
      }
      expect(dist.planned).toBe(wi.credits);
      expect(dist.satisfied).toBe(false);
    });
  });
});

const data = { test: true };