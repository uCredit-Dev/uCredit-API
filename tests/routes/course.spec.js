import mongoose, { trusted } from "mongoose";
import supertest from "supertest";
import Courses from "../../model/Course";
import Users from "../../model/User";
import Years from "../../model/Year";
import Distributions from "../../model/Distribution";
import createApp from "../../app";
import {
  TEST_USER_1,
  TEST_TOKEN_1,
  TEST_TOKEN_2,
  TEST_PLAN_NAME_1,
  TEST_CS,
  SAMEPLE_COURSES,
  TEST_DATE,
  INVALID_ID,
  VALID_ID,
  TEST_USER_2,
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
  // make sample plan
  let res = await request
    .post("/api/plans")
    .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
    .send({
      name: TEST_PLAN_NAME_1,
      user_id: TEST_USER_1._id,
      majors: [TEST_CS],
      expireAt: TEST_DATE,
      year: "Junior",
    });
  plan = res.body.data;
  // make sample distribution
  res = await request
    .post("/api/distributions")
    .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
    .send({
      plan_id: plan._id,
      user_id: TEST_USER_1._id,
      name: "testDistribution",
      required: 1,
    });
  distribution = res.body.data;
  // set plan_id and distribution_ids
  SAMEPLE_COURSES.forEach((sample) => {
    sample.plan_id = plan._id;
    sample.year_id = plan.years[3]._id;
    sample.distribution_ids = [distribution._id];
  });
  // create courses
  await Courses.insertMany(SAMEPLE_COURSES);
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
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Course Routes: GET /api/courses/:id", () => {
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

  it("Should return status 400 for invalid id", async () => {
    const res = await request
      .get(`/api/courses/${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });
});

describe("Course Routes: GET /api/coursesByDistribution/:distribution_id", () => {
  it("Should return all courses with the distribution id", async () => {
    courses = await Courses.find({});
    // get courses in distribution (should be all)
    const res = await request
      .get(`/api/coursesByDistribution/${distribution._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    const resCourses = res.body.data;
    expect(resCourses.length).toBe(courses.length);
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
    courses = await Courses.find({});
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

  it("Should return status 500 for undefined body", async () => {
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });

  it("Should return status 500 for empty body", async () => {
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({});
    expect(res.status).toBe(500);
  });

  it("Should return status 500 for incomplete body", async () => {
    // course body missing plan_id
    const course = SAMEPLE_COURSES[0];
    delete course.plan_id;
    // make reqest
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(course);
    expect(res.status).toBe(500);
  });

  it("Should return status 500 for mismatch between plan_id and distribution_ids", async () => {
    // set request course body
    const course = SAMEPLE_COURSES[0];
    course.distribution_ids = [VALID_ID]; // random objectid
    // make request
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(course);
    expect(res.status).toBe(500);
  });
});

describe("Course Routes: DELETE /api/courses/:id", () => {
  it("Should return deleted course", async () => {
    courses = await Courses.find({});
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
    courses = await Courses.find({});
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
});

describe("Course Routes: PATCH /api/courses/changeStatus/:course_id", () => {
  it("Should return course with changed status", async () => {
    // course.taken is false by default
    courses = await Courses.find({});
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
    courses = await Courses.find({});
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
    courses = await Courses.find({});
    let course = courses[0];
    const res = await request
      .patch(`/api/courses/changeStatus/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });

  it("Should return status 400 for invalid taken", async () => {
    courses = await Courses.find({});
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
    courses = await Courses.find({});
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
    courses = await Courses.find({});
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
    courses = await Courses.find({});
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

  it("Should return status 400 for trying to add identical course twice", async () => {
    courses = await Courses.find({});
    let course = courses[0];
    const res = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(course);
    expect(res.status).toBe(200);
    const res2 = await request
      .post(`/api/courses/`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(course);
    expect(res2.status).toBe(400);

  });

  it("Should return status 400 for undefined id", async () => {
    courses = await Courses.find({});
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
    courses = await Courses.find({});
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
    courses = await Courses.find({});
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



describe("Course Routes: PATCH /api/courses/:course_id", () => {
  it("Should return the new course added", async () => {
    courses = await Courses.find({});
    let oldCourse = courses[0];
    const newCourse = SAMEPLE_COURSES[0];
    // change taken status to true
    const res = await request
      .patch(`/api/courses/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(newCourse);
    
    expect(res.status).toBe(200);
    // check course deleted
    oldCourse = await Courses.findById(oldCourse._id);
    expect(oldCourse).toBeNull();
    // check new course returned
    const returnedCourse = res.body.data;
    expect(returnedCourse.title).toBe(newCourse.title);
    expect(returnedCourse.term).toBe(newCourse.term);
    expect(returnedCourse.number).toBe(newCourse.number);
    expect(returnedCourse.level).toBe(newCourse.level);
    expect(returnedCourse.user_id).toBe(newCourse.user_id);
    expect(returnedCourse.plan_id).toBe(newCourse.plan_id);
  });

  it("Should return status 403 for invalid user", async () => {
    // course.taken is false by default
    courses = await Courses.find({});
    let course = courses[0];
    // attempt to change taken status
    const res = await request
      .patch(`/api/courses/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send(SAMEPLE_COURSES[0]);
    expect(res.status).toBe(403);
    // check old course still there
    const thatCourse = await Courses.findById(course._id);
    expect(thatCourse.title).toBe(course.title);
  });

  it("Should return status 500 for invalid id", async () => {
    const res = await request
      .patch(`/api/courses/changeStatus/${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send(SAMEPLE_COURSES[0]);
    expect(res.status).toBe(500);
  });

  it("Should return status 400 for missing taken", async () => {
    courses = await Courses.find({});
    let course = courses[0];
    const res = await request
      .patch(`/api/courses/changeStatus/${course._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });
});
