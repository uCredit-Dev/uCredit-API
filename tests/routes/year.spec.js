import mongoose from "mongoose";
import supertest from "supertest";
import createApp from "../../app";
import Plans from "../../model/Plan";
import Users from "../../model/User";
import Courses from "../../model/Course";
import Distributions from "../../model/Distribution";
import Years from "../../model/Year";

import { TEST_USER_1, TEST_USER_2, TEST_PLAN_1, TEST_PLAN_2, TEST_TOKEN_1, TEST_TOKEN_2 } from "./testVars"; 

let plan; 

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/years", { useNewUrlParser: true })
    .then(async () => {
      const resp1 = await request
        .post("/api/plans")
        .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
        .send(TEST_PLAN_1);
      plan = resp1.body.data; 
      const resp2 = await request
        .post("/api/plans")
        .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
        .send(TEST_PLAN_2);
      for (let i = 0; i < 5; i++) {
        const plan = i < 3 ? resp1.body.data : resp2.body.data;
        const courseResp = await Courses.create({
          name: `course${i}`,
          plan_id: plan._id,
          year_id: plan.years[0]._id,
          user_id: TEST_USER_1._id,
          year: "Freshman",
          term: "fall",
          credits: 0,
          title: i,
          level: "Lower Level Undergraduate"
        });

        await Years.findByIdAndUpdate(plan.years[0]._id, {
          $push: { courses: courseResp._id },
        });
        const distributionResp = await Distributions.create({
          plan_id: plan._id,
          course_id: courseResp._id,
          user_id: TEST_USER_1._id,
          year: "Freshman",
          term: "fall",
          name: i,
          required: 0,
          year_id: plan.years[0]._id,
        });
        await Distributions.findByIdAndUpdate(distributionResp._id, {
          $push: { courses: courseResp._id },
        });
        await Courses.findByIdAndUpdate(courseResp._id, {
          $push: { distribution_ids: distributionResp._id },
        });
      }
      done();
    });
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase(); 
  await mongoose.connection.close();
});

const request = supertest(createApp());

describe("year GET /api/years/:plan_id route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const id = plan._id;
    const resp = await request
      .get("/api/years/" + id)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(200);
    expect(resp.body.data.length).toBe(5);
  });

  it("should return status 400 for invalid id", async () => {
    const resp = await request
      .get("/api/years/%00")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(400);
  });
});

describe("year POST /api/years route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const id = plan._id;
    const resp = await request
      .post("/api/years")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        name: TEST_PLAN_1.name,
        user_id: TEST_USER_1._id,
        year: 2001,
        plan_id: id,
      });
    expect(resp.status).toBe(200);
    expect(resp.body.data.name).toBe(TEST_PLAN_1.name);
    expect(resp.body.data.user_id).toBe(TEST_USER_1._id);
    expect(resp.body.data.year).toBe(2001);
  });

  it("should return status 400 for missing name", async () => {
    const id = plan._id;
    const resp = await request
      .post("/api/years")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        user_id: TEST_USER_1._id,
        year: 2001,
        plan_id: id,
      });
    expect(resp.status).toBe(400);
  });

  it("should return status 400 for missing user_id", async () => {
    const id = plan._id;
    const resp = await request
      .post("/api/years")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        name: TEST_PLAN_1.name,
        year: 2001,
        plan_id: id,
      });
    expect(resp.status).toBe(400);
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
    const resp = await request
      .patch("/api/years/changeOrder")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ plan_id: id, year_ids: yearsTot });
    expect(resp.status).toBe(200);
    const respYearIDs = resp.body.data.year_ids;
    expect(respYearIDs.length).toBe(5);
    for (let i = 0; i < respYearIDs.length; i++) {
      expect(JSON.stringify(respYearIDs[i])).toBe(JSON.stringify(yearsTot[i]));
    }
  });

  it("should throw 400 for invalid plan id", async () => {
    const resp = await request
      .patch("/api/years/changeOrder")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ plan_id: "no_exist", year_ids: [] });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for missing plan id", async () => {
    const resp = await request
      .patch("/api/years/changeOrder")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_ids: [] });
    expect(resp.status).toBe(400);
  });
});

describe("year PATCH /api/years/updateName route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const NEW_NAME = "new test";
    const id = plan.years[0]._id;
    const resp = await request
      .patch("/api/years/updateName")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: id, name: NEW_NAME });
    expect(resp.status).toBe(200);
    expect(resp.body.data.name).toBe(NEW_NAME);
  });

  it("should throw 400 for invalid year id", async () => {
    const resp = await request
      .patch("/api/years/updateName")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: "no_exist", name: TEST_PLAN_1.name });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for invalid missing name", async () => {
    const id = plan.years[0]._id;
    const resp = await request
      .patch("/api/years/updateName")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: id });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for invalid missing year_id", async () => {
    const resp = await request
      .patch("/api/years/updateName")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ name: TEST_PLAN_1.name });
    expect(resp.status).toBe(400);
  });
});

const NEW_YEAR = 2002;
describe("year PATCH /api/years/updateYear route", () => {
  it("should return a list of years corresponding to a valid plan", async () => {
    const id = plan.years[0]._id;
    const resp = await request
      .patch("/api/years/updateYear")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: id, year: NEW_YEAR });
    expect(resp.status).toBe(200);
    expect(resp.body.data.year).toBe(NEW_YEAR);
  });

  it("should throw 400 for invalid year id", async () => {
    const resp = await request
      .patch("/api/years/updateYear")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: "no_exist", year: NEW_YEAR });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for invalid missing year", async () => {
    const id = plan.years[0]._id;
    const resp = await request
      .patch("/api/years/updateYear")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year_id: id });
    expect(resp.status).toBe(400);
  });

  it("should throw 400 for invalid missing year_id", async () => {
    const resp = await request
      .patch("/api/years/updateYear")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ year: NEW_YEAR });
    expect(resp.status).toBe(400);
  });
});

describe("year DELETE /api/years/:year_id route", () => {
  it("should return deleted first year", async () => {
    const id = plan.years[0]._id;
    const resp = await request
      .delete("/api/years/" + id)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(JSON.stringify(id));
    const planListAfter = await Plans.find({ name: TEST_PLAN_1.name });
    for (let year_id of planListAfter[0]._doc.year_ids) {
      expect(JSON.stringify(year_id)).not.toBe(JSON.stringify(id));
    }
    const courseList = await Courses.find({ year_id: id });
    expect(courseList.length).toBe(0);
  });

  it("should return deleted non-first year", async () => {
    const id = plan.years[plan.years.length - 1]._id;
    const resp = await request
      .delete("/api/years/" + id)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(JSON.stringify(id));
    const planListAfter = await Plans.find({ name: TEST_PLAN_1.name });
    for (let year_id of planListAfter[0]._doc.year_ids) {
      expect(JSON.stringify(year_id)).not.toBe(JSON.stringify(id));
    }
    const courseList = await Courses.find({ year_id: id });
    expect(courseList.length).toBe(0);
  });

  it("should throw 400 for invalid null year_id", async () => {
    const resp = await request
      .delete("/api/years/%00")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(400);
  });

  it("should throw 500 for invalid year_id", async () => {
    const resp = await request
      .delete("/api/years/asdffdsad")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(500);
  });
});
