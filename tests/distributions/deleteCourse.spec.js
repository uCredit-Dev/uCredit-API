const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let major1 = [];
let major2 = [];
let plan1 = [];
let course1 = [];
const samplePlan = {
  name: "TEST_PLAN",
  user_id: 'TEST_USER',
  majors: [allMajors[0].name],
  expireAt: new Date(),
  year: "Junior",
};

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/dist", { useNewUrlParser: true })
    .then(async () => {
      major1 = request.post("/api/majors").send(allMajors[0]);
      major2 = request.post("/api/majors").send(allMajors[5]);
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
      const body = {
        id: plan1._id, 
        majors: [plan1.major[0].name], 
        name: plan1.name,
      };
      request.patch(`/api/plans/update/`).send(body);
      deadCourse = await request.delete(`/api/courses/${course1._id}`);
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

  // Course should not be associated with any of the plan's distribution objects

  const request = supertest(createApp());

describe("delete course from plan", () => {
  it("should be deleted ", async () => {
    expect(courses.findById(deadCourse._id)).toBeFalsy();
    expect(plan._id).toBe(deadCourse.plan_id);
    expect(plan.user_id).toBe(deadCourse.user_id);
    expect().tonotbe
  });
  it("should not be associated with one of the plan's year objects", async () => {
    const plan = await plans.findById(plan1._id);
    const year = await years.findById(deadCourse.year_id);
    expect(year.plan_id).toBe(plan._id);
    expect(year.user_id).toBe(plan.user_id);
    expect(year.courses.find((course) => course === deadCourse._id)).toBeFalsy();
  });
  it("should not be associated with one or more of the plan's distribution objects", async () => {
    const plan = await plans.findById(plan1._id);
    const distIds = deadCourse.distributions_ids;
    distIds.forEach((distId) => {
      let dist = await distributions.findById(distId);
      expect(dist.plan_id).toBe(plan._id);
      expect(dist.user_id).toBe(plan.user_id);
      expect(dist.major_id).toBe(plan.major_id);
      expect(
        dist.courses.find((courseId) => courseId === deadCourse._id).exists()
      ).toBeFalsy(); 
    });
  });
});

const data = { test: true };