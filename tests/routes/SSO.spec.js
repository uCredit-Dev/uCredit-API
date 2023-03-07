import mongoose from "mongoose";
import supertest from "supertest";
import createApp from "../../app";
import Users from "../../model/User";
import Sessions from "../../model/Session";
import cryptoRandomString from "crypto-random-string";
import { decodeToken } from "../../util/token";
import { TEST_USER_1 } from "./testVars";

const request = supertest(createApp());
mongoose.set("strictQuery", true);

beforeAll((done) => {
  mongoose.connect("mongodb://localhost:27017/SSO", { useNewUrlParser: true });
  done();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("SSO Routes: GET /api/verifyLogin/:hash", () => {
  it("Should get user with hash", async () => {
    await Users.create(TEST_USER_1);
    const hash = cryptoRandomString({ length: 20, type: "url-safe" });
    await Sessions.findByIdAndUpdate(
      TEST_USER_1._id,
      { createdAt: Date.now() + 60 * 60 * 24 * 1000, hash },
      { upsert: true, new: true }
    ).exec();
    const res = await request.get("/api/verifyLogin/" + hash);
    expect(res.status).toBe(200);
    const data = res.body.data;
    // check user
    expect(data.retrievedUser._id).toBe(TEST_USER_1._id);
    expect(data.retrievedUser.name).toBe(TEST_USER_1.name);
    expect(data.retrievedUser.affiliation).toBe(TEST_USER_1.affiliation);
    // check token
    expect(data.token).toBeTruthy();
    const decoded = decodeToken(data.token);
    expect(decoded._id).toBe(TEST_USER_1._id);
    expect(decoded.name).toBe(TEST_USER_1.name);
    expect(decoded.affiliation).toBe(TEST_USER_1.affiliation);
  });

  it("Should return 404 for empty hash ", async () => {
    const hash = "";
    const res = await request.get("/api/verifyLogin/" + hash);
    expect(res.status).toBe(404);
  });

  it("Should return 401 for no session (not logged in)", async () => {
    // don't create session
    const hash = cryptoRandomString({ length: 20, type: "url-safe" });
    const res = await request.get("/api/verifyLogin/" + hash);
    expect(res.status).toBe(401);
  });
});

describe("SSO Routes: DELETE /api/verifyLogin/:hash", () => {
  it("Should get user with hash", async () => {
    await Users.create(TEST_USER_1);
    const hash = cryptoRandomString({ length: 20, type: "url-safe" });
    await Sessions.findByIdAndUpdate(
      TEST_USER_1._id,
      { createdAt: Date.now() + 60 * 60 * 24 * 1000, hash },
      { upsert: true, new: true }
    ).exec();
    const res = await request.delete("/api/verifyLogin/" + hash);
    expect(res.status).toBe(200);
    // check no session
    const session = await Sessions.findById(TEST_USER_1._id);
    expect(session).toBeNull();
  });

  it("Should return 404 for empty hash", async () => {
    const hash = "";
    const res = await request.delete("/api/verifyLogin/" + hash);
    expect(res.status).toBe(404);
  });

  it("Should return 404 for no session", async () => {
    // don't create session
    const hash = cryptoRandomString({ length: 20, type: "url-safe" });
    const res = await request.delete("/api/verifyLogin/" + hash);
    expect(res.status).toBe(404);
  });
});

describe("SSO Routes: get /api/metadata", () => {
  it("Should get metadata", async () => {
    const res = await request.get("/api/metadata");
    expect(res.status).toBe(200);
    expect(res.type).toBe("application/xml");
  });
});
