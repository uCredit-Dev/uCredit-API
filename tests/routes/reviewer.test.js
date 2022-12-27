// Run test suite with: npm run test tests/routes/reviewer.test.js

import mongoose from "mongoose";
import supertest from "supertest";
import createApp from "../../app";

const request = supertest(createApp());
const endpoint = "/api/planReview/addReviewer";

beforeEach(async () => {
  await mongoose.connect(global.__MONGO_URI__);
});

describe(`Test endpoint ${endpoint}`, () => {
  describe("HTTP POST request", () => {
    test("Return 200 on success", async () => {
      const response = await request.post(`${endpoint}`).send({
        plan_id: "asdfjksla",
        reviewer_id: "asdfjkl",
      });
      expect(response.status).toBe(400);
    });
  });
});

afterEach(async () => {
  await mongoose.disconnect();
});
