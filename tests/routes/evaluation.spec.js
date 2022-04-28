const mongoose = require("mongoose");
const evaluation = require("../../model/Evaluation");
const supertest = require("supertest");
const createApp = require("../../app");
const request = supertest(createApp());
const sampleEval = {
  n: "Test Course",
  num: "AS.420.690",
};

beforeEach(() => {
  mongoose.connect("mongodb://localhost:27017/evaluations", {
    useNewUrlParser: true,
  });
});

afterEach((done) => {
  mongoose.connection.db.collection("evaluations").drop(() => {
    mongoose.connection.close(() => done());
  });
});

describe("Evaluation Routes", () => {
  it("Should return evaluation with the given _id", async () => {
    const num = sampleEval.num;
    await evaluation.create(sampleEval);
    let req = await request.get(`/api/evals/${num}`);
    expect(req.status).toBe(200);
    expect(req.body.data.num).toBe(num);
  });
});
