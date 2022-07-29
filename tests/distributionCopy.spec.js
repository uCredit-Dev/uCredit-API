const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../model/Major");
const createApp = require("../app");
const { allMajors } = require("../data/majors");

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/majors", { useNewUrlParser: true })
    .then(() => done());
});

afterEach((done) => {
  mongoose.connection.db.collection("majors").drop(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("create new distribution for major", () => {
  it("should create copy of a major's distribution", async () => {
    await request
      .post("/api/majors")
      .send(allMajors[0])
      .then(async () => {
        const major = await majors.findOne({
          department: "EN Computer Science",
        }).exec();
        expect(major).toBeTruthy();
      });
    const cs_minor = await majors.findOne({degree_name: 'B.S. Computer Science (OLD - Pre-2021)'}).exec();
    const cs_reqs = cs_minor.distributions[0];
    const newDistribution = {
      name: cs_reqs.name,
      required: cs_reqs.required_credits,
      min_credits_per_course: cs_reqs.min_credits_per_course,
      description: cs_reqs.description,
      criteria: cs_reqs.criteria,
      pathing: cs_reqs.pathing, 
      user_select: cs_reqs.user_select,
      double_count: cs_reqs.double_count,
      fine_requirements: cs_reqs.fine_requirements,
      plan_id: '62b407fbf4dae1c26277a420',
      user_id: "CS_minor_user",
      major_id: cs_minor._id,
    };    
    console.log(newDistribution);
    const resp = await request.post("/api/distributions").send(newDistribution);
    console.log(resp.body.data);
    expect(resp.status).toBe(200);
    expect(resp.body.data).toBeTruthy();
  });
});

const data = { test: true };