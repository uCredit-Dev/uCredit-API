// Run test suite with: npm run test tests/routes/reviewer.test.js

const supertest = require("supertest");
const createApp = require("../../app");

const request = supertest(createApp());
const endpoint = "/api/planReview/addReviewer";

describe(`Test endpoint ${endpoint}`, () => {

  describe("HTTP POST request", () => {
    // test("Return 400 if missing plan_id or reviewer_id in request body", async () => {
    //     const response1 = await request.post(`${endpoint}`).send({
    //         plan_id: "asdfjksla"
    //     });
    //     const response2 = await request.post(`${endpoint}`).send({
    //         reviewer_id: "asdfjkl"
    //     });
    //     expect(response1.status).toBe(400);
    //     expect(response2.status).toBe(400);
    // });

    test("Return 200 on success", async () => {
        const response = await request.post(`${endpoint}`).send({
            plan: "asdfjksla",
            reviewer: "asdfjkl"
        });
        expect(response.status).toBe(200);
    });
    // test("Return 400 if reviewer already added on plan", async () => {
      
    // });

    // test("Return 200 if successfully added reviewer", async() => {

    // });
  });

});