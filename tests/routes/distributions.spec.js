import mongoose from "mongoose";
import createApp from "../../app";
import supertest from "supertest";
import Plans from "../../model/Plan";
import Users from "../../model/User";
import Courses from "../../model/Course";
import Distributions from "../../model/Distribution";
import { INVALID_ID, TEST_CS, TEST_PLAN_1, TEST_PLAN_2, TEST_TOKEN_1, TEST_TOKEN_2, VALID_ID } from "./testVars";

const request = supertest(createApp());
let user; 
let plan; 
let distributions; 

beforeAll((done) => {
  mongoose.connect("mongodb://localhost:27017/distributions", {
    useNewUrlParser: true,
  });
  done();
});

beforeEach(async () => {
  // make sample user
  user = await Users.create(TEST_USER_1);
  // make sample plan
  plan = await Plans.create(TEST_PLAN_1);
  // get distributions 
  distributions = await Distributions.find({ plan_id: plan._id });
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Distribution routes: GET /api/distributions/:distribution_id", () => {
  it("should return a distribution by distribution id", async () => {
    const distribution = distributions[0]; 
    const res = await request
      .get("/api/distributions/" + distribution._id)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data._id.toString()).toBe(
      distribution._id.toString()
    );
    expect(res.body.data.user_id.toString()).toBe(user._id.toString()); 
    expect(res.body.data.plan._id.toString()).toBe(plan._id.toString()); 
  });

  it("should throw status 500 on null id", async () => {
    const res = await request
      .get(`/api/distributions/${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });

  it("should throw status 404 on no distribution", async () => {
    const res = await request
      .get(`/api/distributions/${VALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it("should throw status 403 on missing or invalid jwt", async () => {
    let res = await request
      .get(`/api/distributions/${VALID_ID}`);
    expect(response.status).toBe(403);
    res = await request
      .get(`/api/distributions/${VALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`);
    expect(response.status).toBe(403);
  });
});

describe("Distribution routes: GET /api/distributionsByPlan/:plan_id", () => {
  it("should return distributions by plan id", async () => {
    const CS = await Majors.findById(plan.majors[0]); 
    const AMS = await Majors.findById(plan.majors[1]); 
    let res = await request
      .get(`/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${CS._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.length).toBe(CS.distribution_ids.length);
    res = await request
      .get(`/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${AMS._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.length).toBe(AMS.distribution_ids.length);
  });

  it("should throw status 500 on null plan id", async () => {
    const res = await request
      .get(`/api/distributionsByPlan/?plan_id=${INVALID_ID}&major_id=${TEST_CS}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });

  it("should throw status 500 on null major id", async () => {
    const res = await request
      .get(`/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });


  it("should throw status 404 on plan not found", async () => {
    const res = await request
    .get(`/api/distributionsByPlan/?plan_id=${VALID_ID}&major_id=${TEST_CS}`)
    .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it("should throw status 404 on major not found", async () => {
    const res = await request
    .get(`/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${VALID_ID}`)
    .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it("should throw status 403 on missing or invalid jwt", async () => {
    let res = await request
      .get(`/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${TEST_CS}`); 
    expect(response.status).toBe(403);
    res = await request
      .get(`/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${TEST_CS}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`);
    expect(response.status).toBe(403);
  });
});

describe("PATCH /api/distributions/updateRequiredCredit", () => {
  it("should return the updated distribution", async () => {
    const distribution_id = distributions[0]._id;
    const res = await request.patch(
      "/api/distributions/updateRequiredCredits" +
        "?id=" +
        distribution_id +
        "&required=1"
    );
    expect(res.status).toBe(200);
    let updated = res.body.data; 
    expect(updated._id.toString()).toBe(
      distribution_id.toString()
    );
    expect(updated.required_credits).toBe(1);
    plan = await Plans.findById(plan._id); 
    expect(plan).toBeTruthy();
    expect(plan.distribution_ids[0].toString()).toBe(
      distribution_id.toString()
    );
    updated = await Distributions.findById(distribution_id); 
    expect(updated.required_credits).toBe(1);
  });

  it("should throw status 400 on empty query", async () => {
    const response = await request.patch(
      "/api/distributions/updateRequiredCredits"
    );
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on invalid id", async () => {
    const response = await request.patch(
      `/api/distributions/updateRequiredCredits?id=${INVALID_ID}&required=1`
    );
    expect(response.status).toBe(500);
  });

  it("should throw status 500 on non numerical required value", async () => {
    const distribution_id = distributions[0]._id;
    const response = await request.patch(
      `/api/distributions/updateRequiredCredits?id=${distribution_id}&required=${INVALID_ID}`
    );
    expect(response.status).toBe(500);
  });
});

describe("PATCH /api/distributions/updateName", () => {
  it("should return the updated distribution", async () => {
    const distribution_id = distributions[0]._id;
    const res = await request.patch(
      `/api/distributions/updateName?id=${distribution_id}&name=NEW`
    );
    expect(res.status).toBe(200);
    let updated = res.body.data; 
    expect(updated._id.toString()).toBe(
      distribution_id.toString()
    );
    expect(updated.name).toBe("NEW");
    plan = await Plans.findById(plan._id); 
    expect(plan).toBeTruthy();
    expect(plan.distribution_ids[0].toString()).toBe(
      distribution_id.toString()
    );
    updated = await Distributions.findById(distribution_id); 
    expect(updated.name).toBe("NEW");
  });

  it("should throw status 400 on empty query", async () => {
    const response = await request.patch(
      "/api/distributions/updateName"
    );
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on invalid id", async () => {
    const response = await request.patch(
      `/api/distributions/updateName?id=${INVALID_ID}&name=NEW`
    );
    expect(response.status).toBe(500);
  });

  it("should throw status 500 on non string name value", async () => {
    const distribution_id = distributions[0]._id;
    const response = await request.patch(
      `/api/distributions/updateName?id=${distribution_id}&name=${INVALID_ID}`
    );
    expect(response.status).toBe(500);
  });
});

const data = { test: true };
