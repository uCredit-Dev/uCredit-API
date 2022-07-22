const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const courses = require("../../model/Course");
const users = require("../../model/User");
const years = require("../../model/Year");
const distributions = require("../../model/Distribution")
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
let deadCogsNeuro = [];

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/dist", { useNewUrlParser: true })
    .then(async () => {
      const response1 = await request.post("/api/majors").send(allMajors[3]); // cogsci 
      let cogsci = response1.body.data;
      const planBody = {
        name: "TEST_PLAN",
        user_id: 'TEST_USER',
        majors: [cogsci.degree_name],
        major_ids: [cogsci._id],
        expireAt: new Date(),
        year: "Junior",
      };
      const response2 = await request.post("/api/plans").send(planBody);
      plan = response2.body.data;
<<<<<<< HEAD
=======
      done();

>>>>>>> parent of db512e1 (deleteCourse: debugging tests)
      var plan1 = response2.body.data;
      const course = {
        title: "TEST_COURSE",
        user_id: 'TEST_USER',
        term: "spring",
        credits: 4,
        year: "Senior",
        plan_id: plan1._id,
      };
      // const gatewayCourse = {
      //   title: "Gateway Computing: Java",
      //   department: "EN Computer Science",
      //   number: "EN.500.112",
      //   user_id: 'TEST_USER',
      //   term: "spring",
      //   credits: 4,
      //   year: "Junior",
      //   plan_id: planRes._id,
      // };
      // const twoTagsBody = {
      //   title: "TWO_TAGS",
      //   user_id: 'TEST_USER',
      //   tags: ['COGS-COGPSY', 'COGS-LING'], // One Course from each Focal Area, Two Focal Areas
      //   term: "spring",
      //   credits: 3,
      //   year: "Junior",
      //   plan_id: plan._id,
      //   number: "adsf"
      // };
      const response3 = await request.post("/api/courses").send(course);
      console.log(response3);

      course1 = response3.body.data;
      deadCourse = await request.delete(`/api/courses/${response3._id}`);

      const body = {
        id: plan1._id,
        majors: [plan1.majors[0]],
        name: plan1.name,
      };
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
    expect(await courses.findById(deadCourse._id)).toBeFalsy();
  });
  it("should not be associated with one of the plan's year objects", async () => {
    //const plan = await plans.findById(plan1._id);
    const year = years.findById(deadCourse.year_id);
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
    const plan = await plans.findById(plan1._id);
    const distIds = deadCourse.distributions_ids;
    for (let distId in distIds) {
      let dist = await distributions.findById(distId);
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
      number: "adsf", // NOT upper elective due to exclusive 
      tags: ["COGS-NEURO"], // One Course from each Focal Area, Two Focal Areas
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    const cogsCompcgBody = {
      title: "COGS-COMPCG",
      user_id: "TEST_USER",
      number: "afds", // NOT upper elective due to exclusive 
      tags: ["COGS-COMPCG"], // One Course from each Focal Area, Two Focal Areas
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
<<<<<<< HEAD
    let course = await request.post("/api/courses").send(cogsNeuroBody);
    course = course.body.data; 
=======
    const cogNeuro = await request.post("/api/courses").send(cogsNeuroBody);
>>>>>>> parent of db512e1 (deleteCourse: debugging tests)
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    //delete course
    const deadCogsNeuro = await request.delete(`/api/courses/${cogNeuro._id}`);
    //const deadCompcg = await request.delete(`/api/courses/${compcg._id}`);
    expect(deadCogsNeuro.distribution_ids).toBeTruthy;

    let found = false; 
    for (let d_id of deadNeuro.distribution_ids) {
      await distributions
        .findById(d_id)
        .then(async (dist) => {
          if (dist.name === "Two Focal Areas") {
            found = true; 
            expect(dist.planned).toBe(12); // 24 but overflow 
            await fineRequirements
              .find({plan_id: plan._id, distribution_id: dist._id})
              .then((fineObjs) => {
                let names = [];
                for (let fine of fineObjs) {
                  console.log(fine.planned);
                  console.log(fine.required_credits);
                  if (fine.satisfied) {
                    names.push(fine.criteria);
                  }
                } 
                console.log(names);
                expect(names.length).toBe(1);
                expect(names).toContain("COGS-COMPCG[T]");
                expect(names).toContain("COGS-NEURO[T]").toBeFalsy();
                expect(dist.satisfied).toBeFalsy();


              })
          }
        })
    }
    expect(found).toBeTruthy();
  }); 
  
});

const data = { test: true };