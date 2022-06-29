const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let major1 = [];
let plan1 = [];
let course1 = [];

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
      major1 = response1.body.data;
      const response2 = await request.post("/api/plans").send(samplePlan);
      plan1 = response2.body.data;
      const course = {
        title: "TEST_COURSE",
        user_id: 'TEST_USER',
        term: "spring",
        distribution_ids: [],
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

describe("add new course to plan", () => {
  it("should return posted course", async () => {
    expect(course1.title).toBe("TEST_COURSE");
    expect(course1.user_id).toBe("TEST_USER");
    expect(course1.year).toBe("Junior");
    exepct(course1.term).toBe("Spring");
    exepct(course1.credits).toBe(4);
  });
  it("should be associated with one of the plan object", async () => {
    const plan = await plans.findById(plan1._id);
    const course = await courses.findById(course1._id);
    expect(plan._id).toBe(course.plan_id);
    expect(plan.user_id).toBe(course.user_id);
  });
  it("should be associated with one of the plan's year objects", async () => {
    const plan = await plans.findById(plan1._id);
    const course = await courses.findById(course1._id);
    const year = await years.findById(course.year_id);
    expect(
      plan.year_ids.find((id) => id === course.year_id).exists()
    ).toBeTruthy();
    expect(year.plan_id).toBe(plan._id);
    expect(year.user_id).toBe(plan.user_id);
    expect(year.courses.find((course) => course === course._id)).toBeTruthy();
  });
  it("should be associated with one or more of the plan's distribution objects", async () => {
    const plan = await plans.findById(plan1._id);
    const course = await courses.findById(course1._id);
    const distIds = course.distributions_ids;
    distIds.forEach((distId) => {
      expect(
        plan.distribution_ids.find((id) => id === distId).exists()
      ).toBeTruthy();
      let dist = await distributions.findById(distId);
      expect(dist.plan_id).toBe(plan._id);
      expect(dist.user_id).toBe(plan.user_id);
      expect(dist.major_id).toBe(plan.major_id);
      expect(dist.planned).toBe(course.credits);
      expect(
        dist.courses.find((courseId) => courseId === course._id).exists()
      ).toBeTruthy(); 
      // check that fine_req satisfied if applicable
    });
  });
});

const data = { test: true };