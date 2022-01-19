const mongoose = require("mongoose");
const supertest = require("supertest");
const { returnData } = require("./helperMethods");
const majors = require("../model/Major");
const createApp = require("../app");

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

describe("major api", () => {
  it("should return a major after posting", async () => {
    const major = await createMajor(majorData);
    expect(major).toMatchObject(majorData);
  });

  it("should return a major that was just created", async () => {
    const major = await createMajor(majorData);
    const allMajors = await getMajors();
    expect(allMajors).toContainEqual(major);
    expect(allMajors).toHaveLength(1);
  });

  it("should return all majors", async () => {
    const major1 = await createMajor(majorData);
    const major2 = await createMajor({
      ...majorData,
      degree_name: "B.S. Computer Science",
    });
    const allMajors = await getMajors();
    expect(allMajors).toContainEqual(major1);
    expect(allMajors).toContainEqual(major2);
    expect(allMajors).toHaveLength(2);
  });
});

describe("major db", () => {
  it("should create a new major", async () => {
    await createMajor(majorData);
    const major = await majors.findOne({ department: "Computer Science" });
    expect(major).toBeTruthy();
  });
});

const majorData = {
  degree_name: "B.A. Computer Science",
  department: "Computer Science",
  total_degree_credit: 120,
  wi_credit: 12,
  distributions: [
    {
      name: "Core",
      required_credits: 15,
      min_cedits_per_course: 3,
      description: "Core courses",
      criteria: "Criteria",
      user_select: false, //if true, user can put any course into this distribution
      double_count: true, //courses being classified to this distribution might also be double counted for another distribution
      exception: "exception?", //course that match the exception expression cannot be added toward this distirbution
      fine_requirements: [
        {
          description: "Data Structures",
          required_credits: 4,
          criteria: "Fine requirement criteria",
          exception: "Fine exception?",
          exclusive: false,
        },
      ],
    },
  ],
};

async function createMajor(data) {
  const res = await request.post("/api/majors").send(data);
  return res.body.data;
}

async function getMajors() {
  const res = await request.get("/api/majors/all");
  return res.body.data;
}
