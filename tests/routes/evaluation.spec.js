import mongoose from "mongoose";
import evaluation from "../../model/Evaluation";
import supertest from "supertest";
import createApp from "../../app";

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

afterEach(async () => {
  await mongoose.connection.db.dropDatabase(); 
  await mongoose.connection.close();
});

describe("Evaluation Routes", () => {
  it("Should return evaluation with the given _id", async () => {
    const num = sampleEval.num;
    await evaluation.create(sampleEval);
    let req = await request.get(`/api/evals/${num}`);
    expect(req.status).toBe(200);
    expect(req.body.data.num).toBe(num);
  });
  it("Should return 404 for non existent evaluation", async () => {
    let req = await request.get(`/api/evals/AS.874.234`);
    expect(req.status).toBe(404);
  });
});
