// Run test suite with: npm run test tests/routes/reviewer.test.js

const mongoose = require("mongoose");
const supertest = require("supertest");
const createApp = require("../../app");

const request = supertest(createApp());
const endpoint = "/api/planReview/addReviewer";

describe(`Test endpoint ${endpoint}`, () => {

  describe("HTTP POST request", () => {
    test("Return 400 if missing plan_id or reviewer_id in request body", async () => {
      // console.log(await request.post(`${endpoint}`).send({
      //   plan_id: "asdfjakl"
      // }).expect(400));
      console.log(await request.post(`${endpoint}`).send({plan_id: "asdfjakl"}).body);
      // console.log(await request.post(`${endpoint}`);
        // const response = await request.post(`${endpoint}`).send({
        //     plan_id: "asdfjksla"
        // })
        // .then(async (res) => {
        //   expect(res.status).toBe(400);
        // });
        // console.log(response);
        // expect(response.status).toBe(400);
    });

    test("Return 400 if reviewer already added on plan", async () => {
      
    });

    test("Return 200 if successfully added reviewer", async() => {

    });
  });

});