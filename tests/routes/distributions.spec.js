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

describe("POST /api/distributions", () => {
  it("should return the created distribution", async () => {
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const newDistribution = {
      name: "core courses",
      required: 3,
      description: "testing cs minor core courses distributions",
      criteria: "EN Computer Science[D]^OR^CSCI-OTHER[T]^OR^Gateway Computing[N]",
      min_credits_per_course: 1,
      plan_id: plan_id,
      major_id: "62b407fbf4dae1c26277a420",
      user_id: TEST_USER_1,
    };
    const resp = await request.post("/api/distributions").send(newDistribution);
    console.log(resp.body.data);
    expect(resp.body.data).toBeTruthy();
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data.plan_id)).toBe(
      JSON.stringify(plan_id)
    );
    const updatedPlans = await plans.find({ _id: plan_id });
    expect(updatedPlans).toBeTruthy();
    expect(JSON.stringify(updatedPlans[0].distribution_ids[3])).toBe(
      JSON.stringify(resp.body.data._id)
    );
  });

  it("should throw status 400 on empty body", async () => {
    const response = await request.post("/api/distributions");
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on incomplete body", async () => {
    const response = await request.post("/api/distributions").send({});
    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/distributions/updateRequiredCredit", () => {
  it("should return the updated distribution", async () => {
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const distributionID = planList[0].distribution_ids[0];
    const resp = await request.patch(
      "/api/distributions/updateRequiredCredits" +
        "?id=" +
        distributionID +
        "&required=1"
    );
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(
      JSON.stringify(distributionID)
    );
    expect(resp.body.data.required).toBe(1);
    const updatedPlans = await plans.find({ _id: plan_id });
    expect(updatedPlans).toBeTruthy();
    expect(JSON.stringify(updatedPlans[0].distribution_ids[0])).toBe(
      JSON.stringify(distributionID)
    );
    const updatedDistribution = await distributions.find({
      _id: updatedPlans[0].distribution_ids[0],
    });
    expect(updatedDistribution[0].required).toBe(1);
  });

  it("should throw status 400 on empty query", async () => {
    const response = await request.patch(
      "/api/distributions/updateRequiredCredits"
    );
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on null id", async () => {
    const response = await request.patch(
      "/api/distributions/updateRequiredCredits?id=%00&required=1"
    );
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on null required", async () => {
    const planList = await plans.find({});
    const distributionID = planList[0].distribution_ids[0];
    const response = await request.patch(
      "/api/distributions/updateRequiredCredits?id=" +
        distributionID +
        "&required=%00"
    );
    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/distributions/updateName", () => {
  it("should return the updated distribution", async () => {
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const distributionID = planList[0].distribution_ids[0];
    const resp = await request.patch(
      "/api/distributions/updateName" + "?id=" + distributionID + "&name=new"
    );
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(
      JSON.stringify(distributionID)
    );
    expect(resp.body.data.name).toBe("new");
    const updatedPlans = await plans.find({ _id: plan_id });
    expect(updatedPlans).toBeTruthy();
    expect(JSON.stringify(updatedPlans[0].distribution_ids[0])).toBe(
      JSON.stringify(distributionID)
    );
    const updatedDistribution = await distributions.find({
      _id: updatedPlans[0].distribution_ids[0],
    });
    expect(updatedDistribution[0].name).toBe("new");
  });

  it("should throw status 400 on empty query", async () => {
    const response = await request.patch("/api/distributions/updateName");
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on null id", async () => {
    const response = await request.patch(
      "/api/distributions/updateName?id=%00&name=new"
    );
    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/distributions/:d_id", () => {
  it("should return the deleted distribution", async () => {
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const distributionID = planList[0].distribution_ids[0];
    const resp = await request.delete("/api/distributions/" + distributionID);
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(
      JSON.stringify(distributionID)
    );
    const updatedPlans = await plans.find({ _id: plan_id });
    expect(updatedPlans).toBeTruthy();
    updatedPlans[0].distribution_ids.forEach((id) => {
      expect(JSON.stringify(id)).not.toBe(JSON.stringify(distributionID));
    });
  });

  it("should throw status 400 on invalid id", async () => {
    const resp = await request.delete("/api/distributions/invalid");
    expect(resp.status).toBe(400);
  });
});

const data = { test: true };
