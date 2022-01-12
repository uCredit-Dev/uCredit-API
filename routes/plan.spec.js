const mongoose = require("mongoose");
const supertest = require("supertest");
const { returnData } = require("./helperMethods");
const plans = require("../model/Plan");
const createApp = require("../app");

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/majors", { useNewUrlParser: true })
    .then(() => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("plan routes", () => {
  it("should create a new plan", async () => {
    await createPlan();
    const plan = await plans.findOne({
      name: "Unnamed Plan",
      user_id: "guestUser",
      majors: ["B.S. Computer Science (OLD - Pre-2021)"],
    });
    expect(plan).toBeTruthy();
  });

  it("should return the newly created plan", async () => {
    const data = await createPlan();
    expect(data).toMatchObject(planDocument);
  });

  it("should return a plan by its id", async () => {
    const data = await getPlan();
    expect(data).toMatchObject(planDocument);
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
  name: "Unnamed Plan",
  user_id: "guestUser",
  majors: ["B.S. Computer Science (OLD - Pre-2021)"],
};

async function createPlan() {
  const res = await request.post("/api/plans").send(planData);
  return res.body.data;
}

async function getPlan() {
  const data = await createPlan();
  const res = await request.get(`/api/plans/${data._id}`);
  return res.body.data;
}
