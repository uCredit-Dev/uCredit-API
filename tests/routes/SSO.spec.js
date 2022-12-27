import mongoose from "mongoose";
import supertest from "supertest";
import createApp from "../../app";
import User from "../../model/User";

const request = supertest(createApp());
jest.setTimeout(10000);

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/SSO", { useNewUrlParser: true })
    .then(() => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
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
    await User.create({ name: userID, _id: userID });
    const res = await request.get("/api/backdoor/verification/" + userID);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(userID);
  });
});
