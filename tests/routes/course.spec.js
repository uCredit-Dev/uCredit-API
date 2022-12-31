import mongoose, { trusted } from "mongoose";
import supertest from "supertest";
import Courses from "../../model/Course";
import Years from "../../model/Year";
import Distributions from "../../model/Distribution";
import createApp from "../../app";
import { TEST_USER_1, TEST_TOKEN_1, TEST_PLAN_NAME_1, TEST_CS, sampleCourses, TEST_DATE } from "./testVars"; 

let plan;
let distribution;
let courses; 

const request = supertest(createApp());

beforeEach((done) => {
  mongoose.connect("mongodb://localhost:27017/courses", { useNewUrlParser: true }, async () => {
    // make sample plan 
    let response = await request
      .post("/api/plans")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        name: TEST_PLAN_NAME_1,
        user_id: TEST_USER_1._id,
        majors: [ TEST_CS ],
        expireAt: TEST_DATE,
        year: "Junior",
      });
    plan = response.body.data;
    // make sample distribution 
    response = await request
      .post("/api/distributions")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        plan_id: plan._id,
        user_id: TEST_USER_1._id,
        name: "testDistribution",
        required: 1,
      });
    distribution = response.body.data; 
    // set plan_id and distribution_ids 
    sampleCourses.forEach(async (sample) => {
      sample.plan_id = plan._id;
      sample.distribution_ids = [distribution._id];
    });
    // create courses 
    await Courses.insertMany(sampleCourses);
    courses = await Courses.find({});
    for (let course of courses) {
      // insert course into Junior year
      await Years.findByIdAndUpdate(plan.years[3]._id, {
        $push: { courses: course._id },
      });
      // insert course into sample distribution
      await Distributions.findByIdAndUpdate(distribution._id, {
        $push: { courses: course._id },
      });
    }
    done();
  }); 
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase(); 
  await mongoose.connection.close();
});

describe("Course Routes", () => {
  it("Should return course with the given _id", async () => {
    courses = await Courses.find({});
    const course = courses[0];
    const res = await request
      .get(`/api/courses/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); 
    expect(res.status).toBe(200);
    const resCourse = res.body.data;
    expect(JSON.stringify(resCourse._id)).toBe(JSON.stringify(course._id));
    expect(resCourse.name).toBe(course.name);
  });

  it("Should return all courses with the distribution id", async () => {
    courses = await Courses.find({});
    // get courses in distribution (should be all) 
    const res = await request
      .get(`/api/coursesByDistribution/${distribution._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); ;
    expect(res.status).toBe(200);
    const resCourses = res.body.data; 
    expect(resCourses.length).toBe(courses.length);
    // confirm course distribution id 
    resCourses.forEach((course) => {
      expect(JSON.stringify(course.distribution_ids[0]))
        .toBe(JSON.stringify(distribution._id));
    });
  });

  it("Should return all courses associated with the plan id", async () => {
    courses = await Courses.find({});
    // get all courses in plan (should be all) 
    const res = await request
      .get(`/api/coursesByPlan/${plan._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    const resCourses = res.body.data; 
    expect(resCourses.length).toBe(courses.length);
    // confirm course plan id 
    resCourses.forEach((course) => {
      expect(JSON.stringify(course.plan_id)).toBe(JSON.stringify(plan._id));
    });
  });

  it("Should return all courses of a users terms for a plan", async () => {
    courses = await Courses.find({});
    // find courses in Junior fall; gateway, expo, physics
    const res = await request
      .get(
        `/api/coursesByTerm/${plan._id}?year=Junior&term=fall`
      )
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); ;
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3); 
    // term should be fall and year should be Junior 
    courses.forEach((course) => {
      expect(
        res.body.data.find((course) => course._id === course._id).term
      ).toBe("fall");
      expect(
        res.body.data.find((course) => course._id === course._id).year
      ).toBe("Junior");
    });
  });

  it("Should return created course via post request", async () => {
    // set request course body 
    const course = sampleCourses[0]; 
    course.distribution_ids = plan.distribution_ids; 
    course.year_id = plan.years[3]._id; 
    course.plan_id = plan._id; 
    // POST new course 
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(course);
    expect(res.status).toBe(200);
    const newCourse = res.body.data; 
    expect(newCourse.title).toBe(course.title);
    expect(newCourse.term).toBe(course.term);
    expect(newCourse.number).toBe(course.number);
    expect(newCourse.level).toBe(course.level);
    expect(newCourse.user_id).toBe(course.user_id);
    expect(newCourse.plan_id).toBe(course.plan_id);
  });

  it("Should return course with changed status", async () => {
    // course.taken is false by default  
    courses = await Courses.find({});
    const course = courses[0];
    expect(course.taken).toBe(false);
    // change taken status to true 
    const res = await request
      .patch(`/api/courses/changeStatus/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ taken: true });
    expect(res.status).toBe(200);
    expect(res.body.data.taken).toBe(true);
  });

  // it("Should return course with updated distribution", async () => {
  //   const planResp = await plans.find({});
  //   const id = planResp[0]._id;
  //   const oldDistribution = coursesWithIds[0].distribution_ids[0];
  //   const newDistribution = "6001b745e5fd0d8124251e50";

  //   const res = await request
  //     .patch(`/api/courses/changeDistribution/${id}`)
  //     .send({ distribution_ids: [newDistribution] });
  //   expect(res.status).toBe(200);
  //   expect(res.body.data.distribution_ids[0]).toBe(newDistribution);
  // });

  it("Should return deleted course", async () => {
    courses = await Courses.find({});
    const id = courses[0]._id;
    // delete the course 
    const res = await request
      .delete(`/api/courses/${id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); 
    // expect res.body.data to be course obj 
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body.data._id)).toBe(JSON.stringify(id));
  });
});
