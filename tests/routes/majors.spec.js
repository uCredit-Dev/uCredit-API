import mongoose from "mongoose";
import supertest from "supertest";
import Majors from "../../model/Major";
import createApp from "../../app";
import { allMajors } from "../../data/majors";

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/majors", { useNewUrlParser: true }, async () => done()); 
});

afterEach(async () => {
  await mongoose.connection.db.collection("majors").drop(); 
  await mongoose.connection.close();
});

const request = supertest(createApp());

describe("major routes", () => {
  it("should create a new major", async () => {
    const bsCS_Old = allMajors[1]; 
    await request
      .post("/api/majors")
      .send(bsCS_Old); 
    // major obj from db 
    let major = await Majors.find({ degree_name: bsCS_Old.degree_name }); 
    expect(major).toBeTruthy();
  });

  it("should throw error on invalid major data", async () => {
    const response = await request.post("/api/majors").send({});
    expect(response.status).toBe(400);
  });

  it("should return a major after posting", async () => {
    const bsCS_Old = allMajors[1]; 
    await request
      .post("/api/majors")
      .send(bsCS_Old)
      .then(async (res) => {
        const data = res.body.data;
        expect(data.degree_name).toBe(bsCS_Old.degree_name);
      });
  });

  it("should return 0 majors when calling all majors initially", async () => {
    const resp = await request.get("/api/majors/all");
    expect(resp.body.data.length).toBe(0);
  });

  it("should return one major when calling all majors after one post", async () => {
    await request.post("/api/majors").send(allMajors[0]);
    const resp = await request.get("/api/majors/all");
    const majors = resp.body.data; 
    expect(majors.length).toBe(1);
    expect(majors[0].degree_name).toBe(allMajors[0].degree_name);
  });

  it("should return 2 majors when calling all majors after two posts", async () => {
    await request.post("/api/majors").send(allMajors[0]);
    await request.post("/api/majors").send(allMajors[1]);
    const resp = await request.get("/api/majors/all");
    const majors = resp.body.data; 
    expect(majors.length).toBe(2);
  });
});

const data = { test: true };
