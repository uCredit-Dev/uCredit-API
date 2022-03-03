// Run test suite with: npm run test tests/routes/reviewer.test.js

const mongoose = require("mongoose");
const supertest = require("supertest");
const createApp = require("../../app");

const request = supertest(createApp());
const endpoint = "/api/planReview/addReviewer";

beforeEach(async () => {
  await mongoose.connect(global.__MONGO_URI__);
});

describe(`Test endpoint ${endpoint}`, () => {
  describe("HTTP POST request", () => {
    test("Return 401 if missing plan_id or reviewer_id in request body", async () => {
        const response1 = await request.post(`${endpoint}`).send({
            plan_id: "asdfjksla"
        });
        const response2 = await request.post(`${endpoint}`).send({
            reviewer_id: "asdfjkl"
        });
        expect(response1.status).toBe(401);
        expect(response2.status).toBe(401);
    });

    // test("Return 402 if reviewer already added on plan", async () => {

    // });

    test("Return 200 if successfully added reviewer", async () => {
      const response = await request.post(`${endpoint}`).send({
        plan_id: "asdfjksla",
        reviewer_id: "asdfjkl",
      });
      expect(response.status).toBe(200);
    });

  });
});

afterEach(async () => {
  await mongoose.disconnect();
});
