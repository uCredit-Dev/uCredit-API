const mongoose = require("mongoose");
const users = require("../model/User");
const { addSampleUsers } = require("../data/userSamples");
const SAMPLES = [
  {
    _id: "csStudent",
    major: "cs",
  },
  {
    _id: "mathStudent",
    major: "math",
  },
  {
    _id: "bioStudent",
    major: "bio",
  },
];

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/userSamples", { useNewUrlParser: true })
    .then(() => {
      addSampleUsers(users);
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.collection("userSamples").drop(() => {
    mongoose.connection.close(() => done());
  });
});

describe("userSamples should create new sample users", () => {
  it("userSamples should create 3 students", async () => {
    const userList = await users.find({});
    expect(userList.length).toBe(SAMPLES.length);
  });

  it("first student id should match first sample id", async () => {
    const userList = await users.find({});
    expect(userList[0]._id).toBe(SAMPLES[0]._id);
  });

  it("second student id should match for second sample id", async () => {
    const userList = await users.find({});
    expect(userList[1]._id).toBe(SAMPLES[1]._id);
  });

  it("third student id should match for third sample id", async () => {
    const userList = await users.find({});
    expect(userList[2]._id).toBe(SAMPLES[2]._id);
  });
});
