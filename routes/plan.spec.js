const mongoose = require("mongoose");
const supertest = require("supertest");
const { returnData } = require("./helperMethods");
const plans = require("../model/Plan");
const createApp = require("../app");
const { user, createUser } = require("./testUtils");

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/plans", { useNewUrlParser: true })
    .then(() => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("plan api", () => {
  it("should return the newly created plan", async () => {
    const plan = await createPlan(planData);
    expect(plan).toMatchObject(planDocument);
  });

  it("should return a plan by its id", async () => {
    const plan = await createPlan(planData);
    const actual = await getPlan(plan._id);
    expect(actual).toMatchObject(planDocument);
  });

  it("should return all plans a user has", async () => {
    createUser();
    const plan1 = await createPlan({ ...planData, user_id: "user" });
    const plan2 = await createPlan({ ...planData, name: "Plan 2", user_id: "user" });
    const plans = await getAllPlans("user");
    expect(plans.length).toEqual(2);
    expect(plans[0].name).toEqual(plan1.name);
    expect(plans[1].name).toEqual(plan2.name);
  });

  it("should return a deleted plan", async () => {
    const plan = await createPlan(planData);
    const deleted = await deletePlan(plan._id);
    expect(deleted).toMatchObject(planDocument);
  });

  it("should return a plan with updated major", async () => {
    const plan = await createPlan(planData);
    const updated = await updatePlan(plan._id, { majors: ["B.A. Economics"] });
    expect(updated.majors).toEqual(["B.A. Economics"]);
  });

  it("should return a plan with only major updated", async () => {
    const plan = await createPlan(planData);
    const updated = await updatePlan(plan._id, { majors: ["B.A. Economics"] });
    expect(updated).toMatchObject({ ...planDocument, majors: ["B.A. Economics"] });
  });

  it("should return a plan with updated name", async () => {
    const plan = await createPlan(planData);
    const updated = await updatePlan(plan._id, { name: "Plan 2" });
    expect(updated.name).toEqual("Plan 2");
  });

  it("should return a plan with only name updated", async () => {
    const plan = await createPlan(planData);
    const updated = await updatePlan(plan._id, { name: "Plan 2" });
    expect(updated).toMatchObject({ ...planDocument, name: "Plan 2" });
  });
});

describe("plan database", () => {
  it("should create a new plan for a guest", async () => {
    await createPlan(planData);
    const plan = await plans.findOne({
      name: planData.name,
      user_id: planData.user_id,
      majors: planData.majors,
    });
    expect(plan).toBeTruthy();
  });

  it("should delete a plan by its id", async () => {
    const plan = await createPlan(planData);
    await deletePlan(plan._id);
    const actual = await plans.findOne({
      name: plan.name,
      user_id: plan.user_id,
      majors: plan.majors,
    });
    expect(actual).toBeFalsy();
  });
});

const planData = {
  name: "Unnamed Plan",
  user_id: "guestUser",
  majors: ["B.S. Computer Science (OLD - Pre-2021)"],
  year: "AE UG Freshman",
  expireAt: Date.now() + 60 * 60 * 24,
};

const planDocument = {
  name: planData.name,
  user_id: planData.user_id,
  majors: planData.majors,
};

async function createPlan(data) {
  const res = await request.post("/api/plans").send(data);
  return res.body.data;
}

async function getPlan(planId) {
  const res = await request.get(`/api/plans/${planId}`);
  return res.body.data;
}

async function getAllPlans(userId) {
  const res = await request.get(`/api/plansByUser/${userId}`);
  return res.body.data;
}

async function deletePlan(planId) {
  const res = await request.delete(`/api/plans/${planId}`);
  return res.body.data;
}

async function updatePlan(planId, data) {
  data.plan_id = planId;
  const res = await request.patch("/api/plans/update").send(data);
  return res.body.data;
}
