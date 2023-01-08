import mongoose from "mongoose";
import supertest from "supertest";
import Users from "../../model/User";
import Reviews from "../../model/PlanReview";
import createApp from "../../app";
import { INVALID_ID, TEST_PLAN_1, TEST_PLAN_2, TEST_TOKEN_1, TEST_TOKEN_2, TEST_USER_1, TEST_USER_2, VALID_ID } from "./testVars";

const request = supertest(createApp());
mongoose.set('strictQuery', true);

let plan; 
let user1; 
let user2; 
let review; 

beforeAll((done) => {
  mongoose.connect("mongodb://localhost:27017/planReview", { useNewUrlParser: true }); 
  done();
});

beforeEach(async () => {
  user1 = await Users.create(TEST_USER_1);
  user2 = await Users.create(TEST_USER_2);
  let res = await request.post("/api/plans")
    .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
    .send(TEST_PLAN_1);
  plan = res.body.data; 
  const plan_id = plan._id;
  const reviewee_id = user1._id;
  const reviewee_name = user1.name; 
  const reviewer_id = user2._id;
  res = await request
    .post("/api/planReview/request")
    .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
    .send({ plan_id, reviewer_id, reviewee_id, reviewee_name });
  review = res.body.data; 
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase(); 
});

afterAll(async () => {
  await mongoose.connection.close();
})

describe("Review Routes: POST /api/planReview/requests", () => {
  it("Should create a new plan review and return the updated plan", async () => {
    // make new plan 
    let res = await request.post("/api/plans")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send(TEST_PLAN_2);
    const plan2 = res.body.data; 
    expect(plan)
    // set params 
    const plan_id = plan2._id;
    const reviewee_id = user2._id;
    const reviewee_name = user2.name; 
    const reviewer_id = user1._id;
    res = await request
      .post("/api/planReview/request")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ plan_id, reviewer_id, reviewee_id, reviewee_name });
    expect(res.status).toBe(200);
    const review = res.body.data;
    expect(JSON.stringify(review.plan_id)).toBe(JSON.stringify(plan_id));
    expect(review.reviewer_id.toString()).toContain(reviewer_id.toString());
  });

  it("Should throw 403 with wrong user", async () => {
    const plan_id = plan._id;
    const reviewee_id = user2._id; 
    const reviewee_name = user2.name; 
    const reviewer_id = user1._id; 
    const res = await request
      .post("/api/planReview/request")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ plan_id, reviewer_id, reviewee_id, reviewee_name });
    expect(res.status).toBe(403);
  });

  it("Should throw 400 with no plan_id", async () => {
    const reviewee_id = user2._id; // User1
    const reviewee_name = user2.name; // User One
    const reviewer_id = user1._id; // User2 
    const res = await request
      .post("/api/planReview/request")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ reviewer_id, reviewee_id, reviewee_name });
    expect(res.status).toBe(400);
  });

  it("Should throw 409 with same request twice", async () => {
    const plan_id = plan._id;
    const reviewee_id = user2._id;
    const reviewer_id = user1._id;
    const reviewee_name = user2.name; 
    let res = await request
      .post("/api/planReview/request")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ plan_id, reviewer_id, reviewee_id, reviewee_name });
    expect(res.status).toBe(200);
    res = await request
      .post("/api/planReview/request")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ plan_id, reviewer_id, reviewee_id, reviewee_name });
    expect(res.status).toBe(409);
  });
});

describe("Review Routes: POST /api/planReview/confirm", () => {
  it("Should confirm specified review", async () => {
    let res = await request
      .post("/api/planReview/confirm")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: review._id });
    expect(res.status).toBe(200);
    // check returned data
    review = res.body.data; 
    expect(review.status).toBe("UNDERREVIEW"); 
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("UNDERREVIEW"); 
  }); 

  it("Should throw 404 for an id to nonexistent review", async () => {
    let res = await request
      .post("/api/planReview/confirm")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: VALID_ID });
    expect(res.status).toBe(404);
  }); 

  it("Should throw 400 for missing review_id", async () => {
    let res = await request
      .post("/api/planReview/confirm")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({  });
    expect(res.status).toBe(400);
  }); 

  it("Should throw 400 for null review_id", async () => {
    let res = await request
      .post("/api/planReview/confirm")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: null });
    expect(res.status).toBe(400);
  }); 

  it("Should throw 500 for invalid review_id", async () => {
    let res = await request
      .post("/api/planReview/confirm")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: INVALID_ID });
    expect(res.status).toBe(500);
  }); 

  it("Should throw 403 for unauthorized user", async () => {
    let res = await request
      .post("/api/planReview/confirm")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`) // User1 is reviewee 
      .send({ review_id: review._id });
    expect(res.status).toBe(403);
  }); 

  it("Should throw 400 if reviewer already confirmed", async () => {
    let res = await request
      .post("/api/planReview/confirm")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: review._id });
    expect(res.status).toBe(200);
    // confirm already confirmed review 
    res = await request
      .post("/api/planReview/confirm")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: review._id });
    expect(res.status).toBe(400);
  }); 
});

describe("Review Routes: GET /api/planReview/getReviewers", () => {
  it("Should return reviewer for plan", async () => {
    let res = await request
      .get(`/api/planReview/getReviewers?plan_id=${plan._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); 
    expect(res.status).toBe(200); 
    const reviews = res.body.data; 
    expect(reviews.length).toBe(1);
    expect(reviews[0].reviewee_id).toBe(review.reviewee_id);
    expect(reviews[0].reviewer_id._id).toBe(review.reviewer_id);
    expect(reviews[0]._id).toBe(review._id);
  }); 

  it("Should throw 400 for missing plan_id", async () => {
    let res = await request
      .get(`/api/planReview/getReviewers`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); 
    expect(res.status).toBe(400); 
  }); 

  it("Should throw 500 for invalid plan_id", async () => {
    let res = await request
      .get(`/api/planReview/getReviewers?plan_id=${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); 
    expect(res.status).toBe(500); 
  }); 

  it("Should throw 404 for nonexistent plan_id", async () => {
    let res = await request
      .get(`/api/planReview/getReviewers?plan_id=${VALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); 
    expect(res.status).toBe(404); 
  }); 

  it("Should throw 403 for wrong user", async () => {
    let res = await request
      .get(`/api/planReview/getReviewers?plan_id=${plan._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`); 
    expect(res.status).toBe(403); 
  }); 
});

describe("Review Routes: GET /api/planReview/plansToReview", () => {
  it("Should get reviewer's plans", async () => {
    let res = await request
      .get(`/api/planReview/plansToReview?reviewer_id=${review.reviewer_id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`); 
    expect(res.status).toBe(200);
    const reviews = res.body.data; 
    expect(reviews.length).toBe(1);
    expect(reviews[0].reviewee_id._id).toBe(review.reviewee_id);
    expect(reviews[0].reviewer_id).toBe(review.reviewer_id);
    expect(reviews[0]._id).toBe(review._id);
  }); 

  it("Should throw 400 for missing reviewer_id", async () => {
    let res = await request
      .get(`/api/planReview/plansToReview?`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`); 
    expect(res.status).toBe(400); 
  }); 

  it("Should throw 404 for nonexistent reviewer_id", async () => {
    let res = await request
      .get(`/api/planReview/plansToReview?reviewer_id=${VALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`); 
    expect(res.status).toBe(404); 
  }); 

  it("Should throw 403 for wrong user", async () => {
    let res = await request
      .get(`/api/planReview/plansToReview?reviewer_id=${review.reviewer_id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); 
    expect(res.status).toBe(403); 
  }); 
});

describe("Review Routes: POST /api/planReview/changeStatus", () => {
  it("Should update review status to approved", async () => {
    // reviewer confirms request 
    let res = await request
      .post("/api/backdoor/planReview/confirm")
      .send({ reviewer_id: review.reviewer_id });
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("UNDERREVIEW"); 
    // approve the plan 
    res = await request
      .post(`/api/planReview/changeStatus`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: review._id, status: "APPROVED"}); 
    expect(res.status).toBe(200); 
    // returned review check 
    review = res.body.data; 
    expect(review.status).toBe("APPROVED"); 
    // database doc check 
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("APPROVED"); 
  }); 

  it("Should update review status to rejected", async () => {
    // reviewer confirms request 
    let res = await request
      .post("/api/backdoor/planReview/confirm")
      .send({ reviewer_id: review.reviewer_id });
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("UNDERREVIEW");
    // reject plan  
    res = await request
      .post(`/api/planReview/changeStatus`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: review._id, status: "REJECTED"}); 
    expect(res.status).toBe(200); 
    // returned review check 
    review = res.body.data; 
    expect(review.status).toBe("REJECTED"); 
    // database doc check 
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("REJECTED"); 
  }); 

  it("Should throw 400 if review_id missing", async () => {
    // reviewer confirms request 
    let res = await request
      .post("/api/backdoor/planReview/confirm")
      .send({ reviewer_id: review.reviewer_id });
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("UNDERREVIEW"); 
    res = await request
      .post(`/api/planReview/changeStatus`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ status: "REJECTED"}); 
    expect(res.status).toBe(400); 
    // should not modify review 
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("UNDERREVIEW"); 
  }); 

  it("Should throw 400 if status is null", async () => {
    // reviewer confirms request 
    let res = await request
      .post("/api/backdoor/planReview/confirm")
      .send({ reviewer_id: review.reviewer_id });
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("UNDERREVIEW"); 
      res = await request
      .post(`/api/planReview/changeStatus`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: review._id, status: null }); 
    expect(res.status).toBe(400); 
    // should not modify review 
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("UNDERREVIEW"); 
  }); 

  it("Should throw 400 if status is invalid", async () => {
    // reviewer confirms request 
    let res = await request
      .post("/api/backdoor/planReview/confirm")
      .send({ reviewer_id: review.reviewer_id });
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("UNDERREVIEW"); 
    res = await request
      .post(`/api/planReview/changeStatus`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: review._id, status: "HELLO_WORLD" }); 
    expect(res.status).toBe(400); 
    // should not modify review 
    review = await Reviews.findById(review._id); 
    expect(review.status).toBe("UNDERREVIEW"); 
  }); 

  it("Should throw 404 if no review associated with review_id", async () => {
    let res = await request
      .post(`/api/planReview/changeStatus`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: VALID_ID,  status: "REJECTED"}); 
    expect(res.status).toBe(404); 
  }); 

  it("Should throw 500 if review_id is invalid", async () => {
    let res = await request
      .post(`/api/planReview/changeStatus`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: INVALID_ID,  status: "REJECTED"}); 
    expect(res.status).toBe(500); 
  }); 

  it("Should throw 400 if review is still pending", async () => {
    expect(review.status).toBe("PENDING"); 
    let res = await request
      .post(`/api/planReview/changeStatus`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ review_id: review._id,  status: "REJECTED"}); 
    expect(res.status).toBe(400); 
  }); 
});

describe("Review Routes: DELETE /api/planReview/removeReview", () => {
  it("Should delete a plan review and return the plan with the removed plan review", async () => {
    let res = await request
      .delete(`/api/planReview/removeReview?review_id=${review._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    // response body check 
    review = res.body.data;
    expect(JSON.stringify(review.plan_id)).toBe(JSON.stringify(plan._id));
    // database doc check 
    review = await Reviews.findById(review._id); 
    expect(review).toBeNull();
  });

  it("Should throw 400 for missing review_id", async () => {
    let res = await request
      .delete(`/api/planReview/removeReview?`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
    // check that review not deleted  
    review = await Reviews.findById(review._id); 
    expect(JSON.stringify(review.plan_id)).toBe(JSON.stringify(plan._id));
  });

  it("Should throw 500 for invalid review_id", async () => {
    let res = await request
      .delete(`/api/planReview/removeReview?review_id=${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
    // check that review not deleted  
    review = await Reviews.findById(review._id); 
    expect(JSON.stringify(review.plan_id)).toBe(JSON.stringify(plan._id));
  });

  it("Should throw 404 for nonexistent review_id", async () => {
    let res = await request
      .delete(`/api/planReview/removeReview?review_id=${VALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it("Should throw 403 for no jwt token", async () => {
    // must be reviewer or reviewee 
    let res = await request
      .delete(`/api/planReview/removeReview?review_id=${VALID_ID}`); 
    expect(res.status).toBe(403);
  });
});
