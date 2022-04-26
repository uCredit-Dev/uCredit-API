const mongoose = require("mongoose");
const supertest = require("supertest");
const { returnData } = require("../../routes/helperMethods");
const majors = require("../../model/Major");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

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

describe("major routes", () => {
  it("should create a new major", async () => {
    await request
      .post("/api/majors")
      .send(allMajors[0])
      .then(async () => {
        const major = await majors.findOne({
          department: "EN Computer Science",
        });
        expect(major).toBeTruthy();
      });
  });

  it("should throw error on invalid major data", async () => {
    const response = await request.post("/api/majors").send({});
    expect(response.status).toBe(400);
  });

  it("should return a major after posting", async () => {
    await request
      .post("/api/majors")
      .send(allMajors[0])
      .then(async (res) => {
        const data = res.body.data;
        expect(data).toMatchObject(allMajors[0]);
      });
  });

  it("should return 0 majors when calling all majors initially", async () => {
    const resp = await request.get("/api/majors/all");
    expect(resp.body.data.length).toBe(0);
  });

  it("should return one major when calling all majors after one post", async () => {
    await request.post("/api/majors").send(allMajors[0]);
    const resp = await request.get("/api/majors/all");
    expect(resp.body.data.length).toBe(1);
    expect(resp.body.data[0]).toMatchObject(allMajors[0]);
  });

  it("should return 2 majors when calling all majors after two posts", async () => {
    await request.post("/api/majors").send(allMajors[0]);
    await request.post("/api/majors").send(allMajors[1]);
    const resp = await request.get("/api/majors/all");
    expect(resp.body.data.length).toBe(2);
    expect(resp.body.data[0]).toMatchObject(allMajors[0]);
    expect(resp.body.data[1]).toMatchObject(allMajors[1]);
  });
});

const data = { test: true };
