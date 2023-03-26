import mongoose, { trusted } from "mongoose";
import supertest from "supertest";
import Courses from "../../model/Course";
import Users from "../../model/User";
import Majors from "../../model/Major";
import Distributions from "../../model/Distribution";
import createApp from "../../app";
import { getMajor } from "../../data/majors";
import {
  TEST_USER_1,
  TEST_TOKEN_1,
  TEST_TOKEN_2,
  TEST_CS,
  SAMEPLE_COURSES,
  INVALID_ID,
  TEST_USER_2,
  TEST_AMS,
  TEST_PLAN_1,
} from "./testVars";

const request = supertest(createApp());
mongoose.set("strictQuery", true);

let plan;
let distribution;
let courses;

beforeAll((done) => {
  mongoose.connect("mongodb://localhost:27017/course", {
    useNewUrlParser: true,
  });
  done();
});

beforeEach(async () => {
  // make sample user
  await Users.create(TEST_USER_1);
  await Users.create(TEST_USER_2);
  // make majors
  await Majors.create(getMajor(TEST_CS));
  await Majors.create(getMajor(TEST_AMS));
  // make sample plan
  let res = await request
    .post("/api/plans")
    .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
    .send(TEST_PLAN_1);
  plan = res.body.data;
  // set plan_id and distribution_ids
  SAMEPLE_COURSES.forEach((sample) => {
    sample.plan_id = plan._id;
    sample.year_id = plan.years[3]._id;
  });
  // create courses
  for (let course of SAMEPLE_COURSES) {
    await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(course);
  }
  courses = await Courses.find({});
  distribution = await Distributions.findOne({ plan_id: plan._id });
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Course Routes: GET /api/courses/:id", () => {
  it("Should return course with the given _id", async () => {
    const course = courses[0];
    const res = await request
      .get(`/api/courses/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    const resCourse = res.body.data;
    expect(JSON.stringify(resCourse._id)).toBe(JSON.stringify(course._id));
    expect(resCourse.name).toBe(course.name);
  });

  it("Should return status 400 for invalid id", async () => {
    const res = await request
      .get(`/api/courses/${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });
});

describe("Course Routes: GET /api/coursesByDistribution/:distribution_id", () => {
  it("Should return all courses with the distribution id", async () => {
    // get courses in distribution (should be all)
    const res = await request
      .get(`/api/coursesByDistribution/${distribution._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    const resCourses = res.body.data;
    // java in cs core req
    expect(resCourses.length).toBe(1);
    // confirm course distribution id
    resCourses.forEach((course) => {
      expect(JSON.stringify(course.distribution_ids[0])).toBe(
        JSON.stringify(distribution._id)
      );
    });
  });

  it("Should return status 403 for invalid user", async () => {
    // wrong user
    let res = await request
      .get(`/api/coursesByDistribution/${distribution._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
    // no user (jwt token)
    res = await request.get(`/api/coursesByDistribution/${distribution._id}`);
    expect(res.status).toBe(403);
  });

  it("Should return status 400 for invalid id", async () => {
    const res = await request
      .get(`/api/coursesByDistribution/${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });
});

describe("Course Routes: GET /api/coursesByPlan/:plan_id", () => {
  // it("Should return all courses associated with the plan id", async () => {
  //   await SISCourseV.insertMany({ })
  //   courses = await Courses.find({});
  //   // get all courses in plan (should be all)
  //   const res = await request
  //     .get(`/api/coursesByPlan/${plan._id}`)
  //     .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
  //   expect(res.status).toBe(200);
  //   const resCourses = res.body.data;
  //   expect(resCourses.length).toBe(courses.length);
  //   // confirm course plan id
  //   resCourses.forEach((course) => {
  //     expect(JSON.stringify(course.plan_id)).toBe(JSON.stringify(plan._id));
  //   });
  // });

  it("Should return status 403 for no user", async () => {
    // no user (jwt token)
    const res = await request.get(`/api/coursesByPlan/${plan._id}`);
    expect(res.status).toBe(403);
  });

  it("Should return status 500 for invalid id", async () => {
    const res = await request
      .get(`/api/coursesByPlan/${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });
});

describe("Course Routes: GET /api/coursesByTerm/:plan_id", () => {
  it("Should return all courses of a users terms for a plan", async () => {
    // find courses in Junior fall; gateway, expo, physics
    const res = await request
      .get(`/api/coursesByTerm/${plan._id}?year=Junior&term=fall`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
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

  it("Should return status 403 for invalid user", async () => {
    // wrong user
    let res = await request
      .get(`/api/coursesByTerm/${plan._id}?year=Junior&term=fall`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
    // no user (jwt token)
    res = await request.get(
      `/api/coursesByTerm/${plan._id}?year=Junior&term=fall`
    );
    expect(res.status).toBe(403);
  });

  it("Should return status 400 for invalid plan id", async () => {
    const res = await request
      .get(`/api/coursesByTerm/${INVALID_ID}?year=Junior&term=fall`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });

  it("Should return status 400 for missing params", async () => {
    // missing term
    let res = await request
      .get(`/api/coursesByTerm/${plan._id}?year=Junior`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
    // missing year
    res = await request
      .get(`/api/coursesByTerm/${plan._id}?term=fall`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });
});

describe("Course Routes: POST /api/courses", () => {
  it("Should return created course via post request", async () => {
    // set request course body
    const course = SAMEPLE_COURSES[0];
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

  it("Should return status 403 for invalid user", async () => {
    // set request course body
    const course = SAMEPLE_COURSES[0];
    // wrong user
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send(course);
    expect(res.status).toBe(403);
  });

  it("Should return status 400 for undefined body", async () => {
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });

  it("Should return status 400 for empty body", async () => {
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("Should return status 400 for incomplete body", async () => {
    // course body missing plan_id
    const course = SAMEPLE_COURSES[0];
    delete course.plan_id;
    // make reqest
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(course);
    expect(res.status).toBe(400);
  });

  // TODO: test credit update
});

describe("Course Routes: DELETE /api/courses/:id", () => {
  it("Should return deleted course", async () => {
    let course = courses[0];
    // delete the course
    const res = await request
      .delete(`/api/courses/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    // expect res.body.data to be course obj
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body.data._id)).toBe(JSON.stringify(course._id));
    // check course deleted
    course = await Courses.findById(course._id);
    expect(course).toBeNull();
  });

  it("Should return status 403 for invalid user", async () => {
    let course = courses[0];
    // wrong user
    let res = await request
      .delete(`/api/courses/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
    // no user (jwt token)
    res = await request.delete(`/api/courses/${course._id}`);
    expect(res.status).toBe(403);
    // check course still exists
    course = await Courses.findById(course._id);
    expect(course).toBeTruthy();
  });

  it("Should return status 500 for invalid id", async () => {
    const res = await request
      .delete(`/api/courses/${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });

  // TODO: test distributions
});

describe("Course Routes: PATCH /api/courses/changeStatus/:course_id", () => {
  it("Should return course with changed status", async () => {
    // course.taken is false by default

    let course = courses[0];
    expect(course.taken).toBe(false);
    // change taken status to true
    const res = await request
      .patch(`/api/courses/changeStatus/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ taken: true });
    expect(res.status).toBe(200);
    expect(res.body.data.taken).toBe(true);
    // check db updatd
    course = await Courses.findById(course._id);
    expect(course.taken).toBe(true);
  });

  it("Should return status 403 for invalid user", async () => {
    // course.taken is false by default

    let course = courses[0];
    // attempt to change taken status
    const res = await request
      .patch(`/api/courses/changeStatus/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ taken: true });
    expect(res.status).toBe(403);
    // check status still false
    course = await Courses.findById(course._id);
    expect(course.taken).toBe(false);
  });

  it("Should return status 500 for invalid id", async () => {
    const res = await request
      .patch(`/api/courses/changeStatus/${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ taken: true });
    expect(res.status).toBe(500);
  });

  it("Should return status 400 for missing taken", async () => {
    let course = courses[0];
    const res = await request
      .patch(`/api/courses/changeStatus/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });

  it("Should return status 400 for invalid taken", async () => {
    let course = courses[0];
    const res = await request
      .patch(`/api/courses/changeStatus/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ taken: 1 });
    expect(res.status).toBe(400);
  });
});

describe("Course Routes: PATCH /api/courses/dragged", () => {
  it("Should return course with changed year", async () => {
    // course.taken is false by default

    let course = courses[0];
    const body = {
      courseId: course._id,
      oldYear: plan.years[3]._id,
      newYear: plan.years[1]._id,
      newTerm: "spring",
    };
    // change year and term
    const res = await request
      .patch(`/api/courses/dragged`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(body);
    // returns update course
    expect(res.status).toBe(200);
    expect(res.body.data.year_id).toBe(body.newYear);
    expect(res.body.data.term).toBe(body.newTerm);
    // check db updatd
    course = await Courses.findById(course._id);
    expect(JSON.stringify(course.year_id)).toBe(JSON.stringify(body.newYear));
    expect(course.term).toBe(body.newTerm);
  });

  it("Should return status 403 for invalid user", async () => {
    let course = courses[0];
    const body = {
      courseId: course._id,
      oldYear: plan.years[3]._id,
      newYear: plan.years[1]._id,
      newTerm: "spring",
    };
    // attempt to change year and term
    const res = await request
      .patch(`/api/courses/dragged`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send(body);
    expect(res.status).toBe(403);
    // check db not updated
    course = await Courses.findById(course._id);
    expect(course.year_id.toString()).toBe(body.oldYear.toString());
    expect(course.term).toBe(course.term);
  });

  it("Should return status 400 for undefined id", async () => {
    let course = courses[0];
    const body = {
      courseId: undefined,
      oldYear: plan.years[3]._id,
      newYear: plan.years[1]._id,
      newTerm: "spring",
    };
    const res = await request
      .patch(`/api/courses/dragged`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(body);
    expect(res.status).toBe(400);
  });

  it("Should return status 400 for undefined id", async () => {
    let course = courses[0];
    const body = {
      courseId: undefined,
      oldYear: plan.years[3]._id,
      newYear: plan.years[1]._id,
      newTerm: "spring",
    };
    const res = await request
      .patch(`/api/courses/dragged`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(body);
    expect(res.status).toBe(400);
  });

  it("Should return status 400 for undefined newYear", async () => {
    let course = courses[0];
    const body = {
      courseId: course._id,
      oldYear: plan.years[3]._id,
      newYear: null,
      newTerm: "spring",
    };
    const res = await request
      .patch(`/api/courses/dragged`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(body);
    expect(res.status).toBe(400);
  });

  it("Should return status 500 for invalid id", async () => {
    let course = courses[0];
    const body = {
      courseId: INVALID_ID,
      oldYear: plan.years[3]._id,
      newYear: plan.years[1]._id,
      newTerm: "spring",
    };
    const res = await request
      .patch(`/api/courses/dragged`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(body);
    expect(res.status).toBe(500);
  });
});
