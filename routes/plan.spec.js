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

});

const planData = {
  name: "Unnamed Plan",
  user_id: "guestUser",
  majors: ["B.S. Computer Science (OLD - Pre-2021)"],
  year: "AE UG Freshman",
  expireAt: Date.now() + 60 * 60 * 24,
};

async function createPlan() {
  await request.post("/api/plans").send(planData);
}

