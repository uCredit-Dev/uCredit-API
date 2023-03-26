import mongoose from "mongoose";
import supertest from "supertest";
import createApp from "../../app";
import Plans from "../../model/Plan";
import Users from "../../model/User";
import Courses from "../../model/Course";
import Majors from "../../model/Major";
import {
  TEST_USER_1,
  TEST_PLAN_1,
  TEST_TOKEN_1,
  TEST_CS,
  TEST_AMS,
  TEST_USER_2,
} from "./testVars";
import { getMajor } from "../../data/majors";

const request = supertest(createApp());
mongoose.set("strictQuery", true);

let plan;

beforeAll((done) => {
  mongoose.connect("mongodb://localhost:27017/year", { useNewUrlParser: true });
  done();
});

beforeEach(async () => {
  await Users.create(TEST_USER_1);
  await Users.create(TEST_USER_2);
  // make majors
  await Majors.create(getMajor(TEST_CS));
  await Majors.create(getMajor(TEST_AMS));
  const res = await request
    .post("/api/plans")
    .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
    .send(TEST_PLAN_1);
  plan = res.body.data;
  for (let i = 0; i < 5; i++) {
    await request
      .post("/api/courses")
      .send({
        name: `course${i}`,
        plan_id: plan._id,
        year_id: plan.years[0]._id,
        user_id: TEST_USER_1._id,
        year: "Freshman",
        term: "fall",
        credits: 0,
        title: i,
        level: "Lower Level Undergraduate",
      })
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
  }
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("year GET /api/years/:plan_id route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const id = plan._id;
    const res = await request
      .get("/api/years/" + id)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
  });

  it("should return status 400 for invalid id", async () => {
    const res = await request
      .get("/api/years/%00")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });
});

describe("year POST /api/years route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const id = plan._id;
    const res = await request
      .post("/api/years")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        name: TEST_PLAN_1.name,
        user_id: TEST_USER_1._id,
        year: 2001,
        plan_id: id,
      });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(TEST_PLAN_1.name);
    expect(res.body.data.user_id).toBe(TEST_USER_1._id);
    expect(res.body.data.year).toBe(2001);
  });

  it("should return status 400 for missing name", async () => {
    const id = plan._id;
    const res = await request
      .post("/api/years")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        user_id: TEST_USER_1._id,
        year: 2001,
        plan_id: id,
      });
    expect(res.status).toBe(400);
  });

  it("should return status 400 for missing user_id", async () => {
    const id = plan._id;
    const res = await request
      .post("/api/years")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        name: TEST_PLAN_1.name,
        year: 2001,
        plan_id: id,
      });
    expect(res.status).toBe(400);
  });
});

describe("year PATCH /api/years/changeOrder route", () => {
  it("given a new order of years for a plan, the order of years should change", async () => {
    const planList = await Plans.find({ name: TEST_PLAN_1.name });
    const firstPlan = { ...planList[0]._doc };
    const id = firstPlan._id;
    const yearsTot = firstPlan.year_ids;
    const tmp = yearsTot[0];
    yearsTot[0] = yearsTot[1];
    yearsTot[1] = tmp;
    const res = await request
      .patch("/api/years/changeOrder")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ plan_id: id, year_ids: yearsTot });
    expect(res.status).toBe(200);
    const resYearIDs = res.body.data.year_ids;
    expect(resYearIDs.length).toBe(5);
    for (let i = 0; i < resYearIDs.length; i++) {
      expect(JSON.stringify(resYearIDs[i])).toBe(JSON.stringify(yearsTot[i]));
    }
  });

  it("should throw 400 for invalid plan id", async () => {
    const res = await request
      .patch("/api/years/changeOrder")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ plan_id: "no_exist", year_ids: [] });
    expect(res.status).toBe(400);
  });

  it("should throw 400 for missing plan id", async () => {
    const res = await request
      .patch("/api/years/changeOrder")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_ids: [] });
    expect(res.status).toBe(400);
  });
});

describe("year PATCH /api/years/updateName route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const NEW_NAME = "new test";
    const id = plan.years[0]._id;
    const res = await request
      .patch("/api/years/updateName")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: id, name: NEW_NAME });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(NEW_NAME);
  });

  it("should throw 400 for invalid year id", async () => {
    const res = await request
      .patch("/api/years/updateName")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: "no_exist", name: TEST_PLAN_1.name });
    expect(res.status).toBe(400);
  });

  it("should throw 400 for invalid missing name", async () => {
    const id = plan.years[0]._id;
    const res = await request
      .patch("/api/years/updateName")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: id });
    expect(res.status).toBe(400);
  });

  it("should throw 400 for invalid missing year_id", async () => {
    const res = await request
      .patch("/api/years/updateName")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ name: TEST_PLAN_1.name });
    expect(res.status).toBe(400);
  });
});

const NEW_YEAR = 2002;
describe("year PATCH /api/years/updateYear route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const id = plan.years[0]._id;
    const res = await request
      .patch("/api/years/updateYear")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: id, year: NEW_YEAR });
    expect(res.status).toBe(200);
    expect(res.body.data.year).toBe(NEW_YEAR);
  });

  it("should throw 400 for invalid year id", async () => {
    const res = await request
      .patch("/api/years/updateYear")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: "no_exist", year: NEW_YEAR });
    expect(res.status).toBe(400);
  });

  it("should throw 400 for invalid missing year", async () => {
    const id = plan.years[0]._id;
    const res = await request
      .patch("/api/years/updateYear")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: id });
    expect(res.status).toBe(400);
  });

  it("should throw 400 for invalid missing year_id", async () => {
    const res = await request
      .patch("/api/years/updateYear")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year: NEW_YEAR });
    expect(res.status).toBe(400);
  });
});

describe("year DELETE /api/years/:year_id route", () => {
  it("should return deleted first year", async () => {
    const id = plan.years[0]._id;
    const res = await request
      .delete("/api/years/" + id)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body.data._id)).toBe(JSON.stringify(id));
    const planListAfter = await Plans.find({ name: TEST_PLAN_1.name });
    for (let year_id of planListAfter[0]._doc.year_ids) {
      expect(JSON.stringify(year_id)).not.toBe(JSON.stringify(id));
    }
    const courseList = await Courses.find({ year_id: id });
    expect(courseList.length).toBe(0);
  });

  it("should return deleted non-first year", async () => {
    const id = plan.years[plan.years.length - 1]._id;
    const res = await request
      .delete("/api/years/" + id)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body.data._id)).toBe(JSON.stringify(id));
    const planListAfter = await Plans.find({ name: TEST_PLAN_1.name });
    for (let year_id of planListAfter[0]._doc.year_ids) {
      expect(JSON.stringify(year_id)).not.toBe(JSON.stringify(id));
    }
    const courseList = await Courses.find({ year_id: id });
    expect(courseList.length).toBe(0);
  });

  it("should throw 400 for invalid null year_id", async () => {
    const res = await request
      .delete("/api/years/%00")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });

  it("should throw 500 for invalid year_id", async () => {
    const res = await request
      .delete("/api/years/asdffdsad")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });
});
