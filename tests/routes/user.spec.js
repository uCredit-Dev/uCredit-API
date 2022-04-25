const mongoose = require("mongoose");
const supertest = require("supertest");
const users = require("../../model/User");
const createApp = require("../../app");

const SOPHOMORE = "AE UG SOPHOMORE";
const FRESHMAN = "AE UG FRESHMAN";
const JUNIOR = "AE UG JUNIOR";
const SENIOR = "AE UG SENIOR";

beforeEach((done) => {
  const samples = [];
  mongoose
    .connect("mongodb://localhost:27017/user", { useNewUrlParser: true })
    .then(async () => {
      for (let i = 1; i <= 98; i++) {
        const userObj = { _id: `User${i}`, name: `User${i}` };
        if (i % 4 === 0) {
          userObj.affiliation = FRESHMAN;
        } else if (i % 4 === 1) {
          userObj.affiliation = SOPHOMORE;
        } else if (i % 4 === 2) {
          userObj.affiliation = JUNIOR;
        } else {
          userObj.affiliation = SENIOR;
        }
        samples.push(userObj);
      }
      samples.push({ _id: `mtiavis1`, name: `mtiavis1`, affiliation: JUNIOR });
      samples.push({ _id: `wtong10`, name: `wtong10`, affiliation: SOPHOMORE });
      await users.insertMany(samples);
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("GET user route", () => {
  it("should select a list of users for username number filters", async () => {
    const userResp = await request.get("/api/user?username=1");
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(21);
    for (let user of userResp.body.data) {
      expect(user.name).toContain("1");
    }
  });

  it("should select a list of users for username word filters", async () => {
    const userResp = await request.get("/api/user?username=User");
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(98);
    for (let user of userResp.body.data) {
      expect(user.name).toContain("User");
    }
  });

  it("should select all users for empty username word filters", async () => {
    const userResp = await request.get("/api/user?username=");
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(100);
  });

  it("should select all users for freshman affiliation filters", async () => {
    const userResp = await request.get("/api/user?affiliation=" + FRESHMAN);
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(24);
    for (let user of userResp.body.data) {
      expect(user.affiliation).toBe(FRESHMAN);
    }
  });

  it("should select all users for sophomore affiliation filters", async () => {
    const userResp = await request.get("/api/user?affiliation=" + SOPHOMORE);
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(26);
    for (let user of userResp.body.data) {
      expect(user.affiliation).toBe(SOPHOMORE);
    }
  });

  it("should select all users for junior affiliation filters", async () => {
    const userResp = await request.get("/api/user?affiliation=" + JUNIOR);
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(26);
    for (let user of userResp.body.data) {
      expect(user.affiliation).toBe(JUNIOR);
    }
  });

  it("should select all users for senior affiliation filters", async () => {
    const userResp = await request.get("/api/user?affiliation=" + SENIOR);
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(24);
    for (let user of userResp.body.data) {
      expect(user.affiliation).toBe(SENIOR);
    }
  });

  it("should select all users for empty affiliation word filters", async () => {
    const userResp = await request.get("/api/user?affiliation=");
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(100);
  });

  it("should select all users for empty affiliation and user filters", async () => {
    const userResp = await request.get("/api/user");
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(100);
  });

  it("should select all users for nonempty affiliation and user filters", async () => {
    const userResp = await request.get(
      "/api/user?username=1&affiliation=" + FRESHMAN
    );
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(2);
    for (let user of userResp.body.data) {
      expect(user.name).toContain("1");
      expect(user.affiliation).toBe(FRESHMAN);
    }
  });
});

const data = { test: true };
