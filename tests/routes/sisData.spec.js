import mongoose from "mongoose";
import supertest from "supertest";
import createApp from "../../app";

const TEST_NAME = "test";

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/user", { useNewUrlParser: true })
    .then(async () => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("POST /api/sis/studentRecords student records", () => {
  it("should return posted data on post", async () => {
    const resp = await request
      .post("/api/sis/studentRecords")
      .send({ name: TEST_NAME });
    expect(resp.status).toBe(200);
    expect(resp.body.data.name).toBe(TEST_NAME);
  });

  it("should return status 400 on null data on post", async () => {
    const resp = await request.post("/api/sis/studentRecords").send(null);
    expect(resp.status).toBe(400);
  });
});

const data = { test: true };
