const mongoose = require("mongoose");
const supertest = require("supertest");
const createApp = require("../../app");
const request = supertest(createApp());
const User = require("../../model/User");
jest.setTimeout(10000);

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/SSO", { useNewUrlParser: true })
    .then(() => done());
});

afterEach((done) => {
  mongoose.connection.db.collection("SSO").drop(() => {
    mongoose.connection.close(() => done());
  });
});

describe("GET SSO Routes", () => {
  it("GET /api/verifyLogin/:hash/: Should return 404 for empty hash ", async () => {
    const hash = "";
    const res = await request.get("/api/verifyLogin/" + hash);
    expect(res.status).toBe(404);
  });

  it("GET /api/backdoor/verification/:id: Should return dev login for a user", async () => {
    const userID = "wtong10";
    const res = await request.get("/api/backdoor/verification/" + userID);
    console.log(res);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(userID);
  });
});
