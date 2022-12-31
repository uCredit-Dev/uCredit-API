import mongoose from "mongoose";
import supertest from "supertest";
import createApp from "../../app";
import { TEST_TOKEN_1, TEST_PLAN_1, TEST_PLAN_2, TEST_TOKEN_2 } from "./testVars"; 

const request = supertest(createApp());
let plan = [];

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/plans", { useNewUrlParser: true })
    .then(async () => {
      const response = await request
        .post("/api/plans")
        .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
        .send(TEST_PLAN_1);
      plan = response.body.data;
      done();
    });
});

afterEach(async () => {
  await mongoose.connection.db.collection("plans").drop(); 
  await mongoose.connection.close();
});

describe("Plan routes", () => {
  it("Should return plan with the given _id", async () => {
    const id = plan._id;
    const res = await request
      .get(`/api/plans/${id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  it("Should return created plan ", async () => {
    const res = await request
      .post(`/api/plans`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send(TEST_PLAN_2);
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.name).toBe(TEST_PLAN_2.name);
  });

  it("Should return updated plan ", async () => {
    const res = await request
      .patch(`/api/plans/update`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        plan_id: plan._id,
        name: "testPlan2",
      });
    expect(res.status).toBe(200);
    const data = res.body.data._doc;
    expect(data.name).toBe("testPlan2");
  });

  it("Should return deleted plan ", async () => {
    const id = plan._id;
    const res = await request
      .delete(`/api/plans/${id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data._id).toBe(id);
  });
});
