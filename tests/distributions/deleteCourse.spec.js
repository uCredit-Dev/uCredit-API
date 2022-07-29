const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const courses = require("../../model/Course");
const users = require("../../model/User");
const years = require("../../model/Year");
const distributions = require("../../model/Distribution");
const plans = require("../../model/Plan");
const fineRequirements = require("../../model/FineRequirement");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");
const request = supertest(createApp());

let major1 = [];
let major2 = [];
let plan1 = [];
let course1 = [];
let deadCourse = [];

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/dist", { useNewUrlParser: true })
    .then(async () => {
      const response1 = await request.post("/api/majors").send(allMajors[3]); // cogsci
      let cogsci = response1.body.data;
      const planBody = {
        name: "TEST_PLAN",
        user_id: "TEST_USER",
        majors: [cogsci.degree_name],
        major_ids: [cogsci._id],
        expireAt: new Date(),
        year: "Junior",
      };
      const response2 = await request.post("/api/plans").send(planBody);
      plan1 = response2.body.data;

      const course = {
        title: "TEST_COURSE",
        user_id: "TEST_USER",
        term: "spring",
        credits: 4,
        year: "Junior",
        plan_id: plan1._id,
      };
      const response3 = await request.post("/api/courses").send(course);
      course1 = response3.body.data;
      deadCourse = await request.delete(`/api/courses/${course1._id}`);

      const body = {
        id: plan1._id,
        majors: [plan1.majors[0]],
        name: plan1.name,
      };
      request.patch(`/api/plans/update/`).send(body);
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

// Course should not be associated with any of the plan's distribution objects

describe("delete course from plan", () => {
  it("should be deleted ", async () => {
    expect(await courses.findById(deadCourse._id).exec()).toBeFalsy();
  });
  it("should not be associated with one of the plan's year objects", async () => {
    //const plan = await plans.findById(plan1._id);
    const year = years.findById(deadCourse.year_id).exec();
    var flag = true;
    if (year === null || year === undefined) {
      flag = false;
    } else {
      for (cid in year.courses) {
        if (cid === deadCourse._id) {
          flag = false;
        }
      }
    }
    expect(flag).toBeTruthy();
  });
  it("should not be associated with one or more of the plan's distribution objects", async () => {
    const plan = await plans.findById(plan1._id).exec();
    const distIds = deadCourse.distributions_ids;
    for (let distId in distIds) {
      let dist = await distributions.findById(distId).exec();
      expect(dist.plan_id).toBe(plan._id);
      expect(dist.user_id).toBe(plan.user_id);
      expect(dist.major_id).toBe(plan.major_id);
      expect(
        dist.courses.find((courseId) => courseId === deadCourse._id).exists()
      ).toBeFalsy();
      expect(dist.planned).toBe(0);
      expect(dist.satisfied).toBeFalsy();
    }
  });
});

describe("Fine Requirement Testing", () => {
  it("Deleting Courses makes distribution and fine_reqs not satisfied", async () => {
    const cogsNeuroBody = {
      title: "COGS-NEURO",
      user_id: "TEST_USER",
      number: "adsf", // NOT upper elective due to double_count
      tags: ["COGS-NEURO"], // One Course from each Focal Area, Two Focal Areas
      term: "fall",
      year: "Senior",
      plan_id: plan1._id,
      credits: 3,
    };
    const cogsCompcgBody = {
      title: "COGS-COMPCG",
      user_id: "TEST_USER",
      number: "afds", // NOT upper elective due to double_count
      tags: ["COGS-COMPCG"], // One Course from each Focal Area, Two Focal Areas
      term: "fall",
      year: "Senior",
      plan_id: plan1._id,
      credits: 3,
    };
    let cogNeuro = await request.post("/api/courses").send(cogsNeuroBody);
    cogNeuro = cogNeuro.body.data;
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    //delete course
    let deadCogsNeuro = await request.delete(`/api/courses/${cogNeuro._id}`);
    deadCogsNeuro = deadCogsNeuro.body.data;
    //const deadCompcg = await request.delete(`/api/courses/${compcg._id}`);
    expect(deadCogsNeuro.distribution_ids).toBeTruthy();

    let found = false;
    for (let d_id of deadCogsNeuro.distribution_ids) {
      await distributions.findById(d_id).then(async (dist) => {
        if (dist.name === "Two Focal Areas") {
          found = true;
          expect(dist.planned).toBe(9); // 3 credits less than 12
          expect(dist.satisfied).toBeFalsy();
          await fineRequirements
            .find({ plan_id: plan1._id, distribution_id: dist._id })
            .then((fineObjs) => {
              let names = [];
              for (let fine of fineObjs) {
                if (fine.satisfied) {
                  names.push(fine.criteria);
                }
              }
              expect(names.length).toBe(1);
              expect(names).toContain("COGS-COMPCG[T]");
            });
        }
      });
    }
    expect(found).toBeTruthy();
  });
});

const data = { test: true };
