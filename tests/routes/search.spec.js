const mongoose = require("mongoose");
const supertest = require("supertest");
const createApp = require("../../app");
const request = supertest(createApp());
jest.setTimeout(30000);

beforeAll(() => {
  mongoose.connect("mongodb://localhost:27017/search", {
    useNewUrlParser: true,
  });
});

describe("GET Search Routes", () => {
  it("GET /api/search/all: Should return list of all SIS courses", async () => {
    const res = await request.get("/api/search/all");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it("GET /api/search/skip/:num: Should return list of SIS courses of size num", async () => {
    const num = Math.floor(Math.random() * 100);
    const res = await request.get("/api/search/skip/" + 0 + "?mod=" + num);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(num);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it("GET /api/search/: Should return list of SIS courses matching query", async () => {
    const query = {
      query: "software",
      credits: "3",
    };
    const res = await request.get("/api/search?query=" + query.query);
    const courses = res.body.data;
    expect(res.status).toBe(200);
    expect(courses.length).toBeGreaterThan(0);
    courses.forEach((course) => {
      expect(course.name.toLowerCase()).toContain(query.query.toLowerCase());
    });

    res = await request.get("/api/search?credits=" + query.credits);
    expect(res.status).toBe(200);
    expect(courses.length).toBeGreaterThan(0);
    courses.forEach((course) => {
      expect(course.credits).toBe(query.credits);
    });
  });

  it("GET /api/searchVersion: Should return a specific version of a course", async () => {
    const query = {
      version: "Fall 2021",
      title: "Honors Single Variable Calculus",
      number: "AS.110.113",
    };
    const res = await request.get(
      "/api/searchVersion?version=" +
        query.version +
        "&title=" +
        query.title +
        "&number=" +
        query.number
    );
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe(query.title);
    expect(res.body.data.number).toBe(query.number);
    expect(res.body.data.versions[0].term).toBe(query.version);
  });
});
