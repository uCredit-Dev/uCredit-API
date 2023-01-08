import mongoose from "mongoose";
import supertest from "supertest";
import createApp from "../../app";
import Plans from "../../model/Plan";
import Comments from "../../model/Comment";
import Threads from "../../model/Thread";
import Users from "../../model/User";
import Courses from "../../model/Course";
import { INVALID_ID, SAMEPLE_COURSES, TEST_PLAN_1, TEST_PLAN_2, TEST_TOKEN_1, TEST_TOKEN_2, TEST_USER_1, TEST_USER_2, VALID_ID } from "./testVars";

const request = supertest(createApp());
mongoose.set('strictQuery', true);

let user1; 
let user2; 
let plan1; 
let plan2; 
let thread; 
let comment; 

const COMMENT_BODY = {
  commenter_id: TEST_USER_1._id,
  visible_user_id: TEST_USER_1._id,
  thread_id: undefined, 
  message: "this is a new test thread",
  date: new Date(),
}
const THREAD_BODY = {
  plan_id: undefined,
  location_type: undefined,
  location_id: undefined,
}

beforeAll(async () => {
  mongoose.connect("mongodb://localhost:27017/comment", { useNewUrlParser: true }); 
});

beforeEach(async () => {
  user1 = await Users.create(TEST_USER_1);
  user2 = await Users.create(TEST_USER_2);
  plan1 = await Plans.create(TEST_PLAN_1);
  plan2 = await Plans.create(TEST_PLAN_2);
  // set thread location 
  THREAD_BODY.plan_id = plan1._id; 
  THREAD_BODY.location_type = "Plan"; 
  THREAD_BODY.location_id = plan1._id; 
  let res = await request
    .post(`/api/thread/new`)
    .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
    .send({
      thread: THREAD_BODY, 
      comment: COMMENT_BODY
    });
  thread = res.body.data; 
  comment = res.body.data.comments[0]; 
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Comment Routes: GET /api/thread/getByPlan/:plan_id", () => {
  it("Should return all threads", async () => {
    let res = await request
      .get(`/api/thread/getByPlan/${plan1._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`); 
    expect(res.status).toBe(200);
    // check response data 
    let threads = res.body.data; 
    expect(threads.length).toBe(1);
    expect(threads[0]._id.toString()).toBe(thread._id);
    let comments = threads[0].comments; 
    expect(comments.length).toBe(1);
    expect(comments[0]._id.toString()).toBe(comment._id);
    // check db 
    thread = await Threads.findById(threads[0]._id); 
    expect(thread).toBeTruthy();
    comment = await Comments.findById(comments[0]._id); 
    expect(comment).toBeTruthy();
  });

  it("Should return no threads", async () => {
    let res = await request
      .get(`/api/thread/getByPlan/${plan2._id}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`); 
    expect(res.status).toBe(200);
    // check response data 
    let threads = res.body.data; 
    expect(threads.length).toBe(0);
  });

  it("Should return 403 for no user", async () => {
    let res = await request
      .get(`/api/thread/getByPlan/${plan1._id}`);
    expect(res.status).toBe(403);
  });

  it("Should return 404 for valid but nonexistent plan id", async () => {
    let res = await request
      .get(`/api/thread/getByPlan/${VALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`); 
    expect(res.status).toBe(404);
  });

  it("Should return 500 for invalid plan id", async () => {
    let res = await request
      .get(`/api/thread/getByPlan/${INVALID_ID}`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`); 
    expect(res.status).toBe(500);
  });
});

describe("Comment Routes: POST /api/thread/new", () => {
  it("Should create new comment (and thread) for plan", async () => {
    // set thread location 
    THREAD_BODY.plan_id = plan1._id; 
    THREAD_BODY.location_type = "Plan"; 
    THREAD_BODY.location_id = plan1._id; 
    // make new comment 
    let res = await request 
      .post(`/api/thread/new`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        thread: THREAD_BODY, 
        comment: COMMENT_BODY
      }); 
    expect(res.status).toBe(200);
    let thread = res.body.data; 
    let comment = res.body.data.comments[0]; 
    expect(thread._id).toBeTruthy();
    expect(comment._id).toBeTruthy();
    // query db 
    const dbThread = await Threads.findById(thread._id);
    const dbComment = await Comments.findById(comment._id);
    expect(dbThread).toBeTruthy();
    expect(dbComment).toBeTruthy();
    expect(dbThread.plan_id.toString()).toBe(plan1._id.toString());
    expect(dbComment.commenter_id.toString()).toBe(user1._id.toString());
    expect(dbComment.message).toBe(COMMENT_BODY.message);    
  });

  it("Should create new comment (and thread) for course", async () => {
    // make new year 
    const body = { ...SAMEPLE_COURSES[0], plan_id: plan1._id }; 
    const course = await Courses.create(body); 
    // set thread location 
    THREAD_BODY.plan_id = plan1._id; 
    THREAD_BODY.location_type = "Course"; 
    THREAD_BODY.location_id = course._id; 
    // make new comment 
    let res = await request 
      .post(`/api/thread/new`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        thread: THREAD_BODY, 
        comment: COMMENT_BODY
      }); 
    expect(res.status).toBe(200);
    let thread = res.body.data; 
    let comment = res.body.data.comments[0]; 
    // query db 
    const dbThread = await Threads.findById(thread._id);
    const dbComment = await Comments.findById(comment._id);
    expect(dbThread).toBeTruthy();
    expect(dbComment).toBeTruthy();
    expect(dbThread.plan_id.toString()).toBe(plan1._id.toString());
    expect(dbThread.location_id.toString()).toBe(THREAD_BODY.location_id.toString());
    expect(dbComment.commenter_id.toString()).toBe(user1._id.toString());
    expect(dbComment.message).toBe(COMMENT_BODY.message);    
  });

  it("Should return 400 for empty request body", async () => {
    let res = await request 
      .post(`/api/thread/new`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({}); 
    expect(res.status).toBe(400);
  });

  it("Should return 403 for wrong user", async () => {
    // set thread location 
    THREAD_BODY.plan_id = plan1._id; 
    THREAD_BODY.location_type = "Plan"; 
    THREAD_BODY.location_id = plan1._id; 
    // make new comment 
    let res = await request 
      .post(`/api/thread/new`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({
        thread: THREAD_BODY, 
        comment: COMMENT_BODY
      }); 
    expect(res.status).toBe(403);
  });

  it("Should return 500 for thread body missing fields", async () => {
    // set thread location 
    THREAD_BODY.plan_id = plan1._id; 
    THREAD_BODY.location_type = "Plan"; 
    delete THREAD_BODY.location_id; 
    // make new comment 
    let res = await request 
      .post(`/api/thread/new`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        thread: THREAD_BODY, 
        comment: COMMENT_BODY
      }); 
    expect(res.status).toBe(500);
  });

  it("Should return 500 for thread body location_type not one of enum", async () => {
    // set thread location 
    THREAD_BODY.plan_id = plan1._id; 
    THREAD_BODY.location_type = "KEKW"; 
    THREAD_BODY.location_id = plan1._id; 
    // make new comment 
    let res = await request 
      .post(`/api/thread/new`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        thread: THREAD_BODY, 
        comment: COMMENT_BODY
      }); 
    expect(res.status).toBe(500);
  });

  it("Should return 500 for thread body invalid plan_id", async () => {
    // set thread location 
    THREAD_BODY.plan_id = INVALID_ID; 
    THREAD_BODY.location_type = "Plan"; 
    THREAD_BODY.location_id = INVALID_ID; 
    // make new comment 
    let res = await request 
      .post(`/api/thread/new`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        thread: THREAD_BODY, 
        comment: COMMENT_BODY
      }); 
    expect(res.status).toBe(500);
  });
});

describe("Comment Routes: POST /api/thread/reply", () => {
  it("Should return new comment", async () => {
    const REPLY_BODY = { ...COMMENT_BODY }; 
    REPLY_BODY.thread_id = thread._id; 
    REPLY_BODY.commenter_id = TEST_USER_2._id; 
    REPLY_BODY.message = "this is a new reply"; 
    let res = await request 
      .post(`/api/thread/reply`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({
        comment: REPLY_BODY
      }); 
    expect(res.status).toBe(200);
    let reply = res.body.data; 
    expect(reply).toBeTruthy();
    expect(reply.commenter_id).toBe(TEST_USER_2._id);
    expect(reply.message).toBe(REPLY_BODY.message);
    expect(reply.thread_id).toBe(thread._id);
  });

  it("Should return 400 for empty request body", async () => {
    let res = await request 
      .post(`/api/thread/reply`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({}); 
    expect(res.status).toBe(400);
  });

  it("Should return 403 for wrong user", async () => {
    // set thread location 
    const REPLY_BODY = { ...COMMENT_BODY }; 
    REPLY_BODY.thread_id = thread._id; 
    REPLY_BODY.commenter_id = TEST_USER_2._id; 
    REPLY_BODY.message = "this is a new reply"; 
    // make new comment 
    let res = await request 
      .post(`/api/thread/reply`)
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({
        comment: REPLY_BODY
      }); 
    expect(res.status).toBe(403);
  });  
  
  it("Should return 500 for comment body missing fields", async () => {
    const REPLY_BODY = { ...COMMENT_BODY }; 
    REPLY_BODY.thread_id = thread._id; 
    REPLY_BODY.commenter_id = TEST_USER_2._id; 
    REPLY_BODY.message = null; 
    // make new comment 
    let res = await request 
      .post(`/api/thread/reply`)
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({
        comment: REPLY_BODY
      }); 
    expect(res.status).toBe(500);
  });
});

describe("Comment Routes: PATCH /api/thread/resolve", () => {
  it("Should resolve existing thread", async () => {
    const thread_id = thread._id; 
    let res = await request 
      .patch("/api/thread/resolve")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ thread_id }); 
    expect(res.status).toBe(200);
    // check db 
    let updated = await Threads.findById(thread_id); 
    expect(updated.resolved).toBe(true); 
  });

  it("Should return 403 for users other than plan owner", async () => {
    const thread_id = thread._id; 
    let res = await request 
      .patch("/api/thread/resolve")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ thread_id }); 
    expect(res.status).toBe(403);
    // check db 
    let updated = await Threads.findById(thread_id); 
    expect(updated.resolved).toBe(false); 
  });

  it("Should return 400 for missing thread_id", async () => {
    let res = await request 
      .patch("/api/thread/resolve")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });
  
  it("Should return 400 for null thread_id", async () => {
    const thread_id = null; 
    let res = await request 
      .patch("/api/thread/resolve")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ thread_id });
    expect(res.status).toBe(400);
  });

  it("Should return 404 for non existent thread_id", async () => {
    const thread_id = VALID_ID; 
    let res = await request 
      .patch("/api/thread/resolve")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ thread_id });
    expect(res.status).toBe(404);
  });

  it("Should return 500 for invalid thread_id", async () => {
    const thread_id = INVALID_ID; 
    let res = await request 
      .patch("/api/thread/resolve")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ thread_id });
    expect(res.status).toBe(500);
  });
});

describe("Comment Routes: PATCH /api/comment", () => {
  it("Should update message", async () => {
    const comment_id = comment._id; 
    const message = "editing message...";
    let res = await request 
      .patch("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ comment_id, message }); 
    expect(res.status).toBe(200);
    // check db 
    let updated = await Comments.findById(comment_id); 
    expect(updated.message).toBe(message); 
  });

  it("Should return 400 for missing message", async () => {
    const comment_id = comment._id; 
    let res = await request 
      .patch("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ comment_id }); 
    expect(res.status).toBe(400);
  });

  it("Should return 400 for null comment_id", async () => {
    const comment_id = null; 
    const message = "editing message...";
    let res = await request 
      .patch("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ comment_id, message }); 
    expect(res.status).toBe(400);
  });

  it("Should return 403 for non commenter", async () => {
    const comment_id = comment._id; 
    const message = "editing message...";
    let res = await request 
      .patch("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ comment_id, message }); 
    expect(res.status).toBe(403);
  });

  it("Should return 500 for invalid comment id", async () => {
    const comment_id = INVALID_ID; 
    const message = "editing message...";
    let res = await request 
      .patch("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ comment_id, message }); 
    expect(res.status).toBe(500);
  });

  it("Should return 404 for nonexistent comment id", async () => {
    const comment_id = VALID_ID; 
    const message = "editing message...";
    let res = await request 
      .patch("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ comment_id, message }); 
    expect(res.status).toBe(404);
  });

  it("Should return 400 for empty string message", async () => {
    const comment_id = comment._id; 
    const message = "";
    let res = await request 
      .patch("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ comment_id, message }); 
    expect(res.status).toBe(400);
  });
});

describe("Comment Routes: DELETE /api/comment", () => {
  it("Should delete comment", async () => {
    const comment_id = comment._id; 
    let res = await request 
      .delete("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ comment_id }); 
    expect(res.status).toBe(200); 
    let deleted = res.body.data; 
    expect(deleted._id.toString()).toBe(comment_id);
    // db check 
    deleted = await Comments.findById(comment_id); 
    expect(deleted).toBeNull();
  });

  it("Should return 400 for missing comment id", async () => {
    let res = await request 
      .delete("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({  }); 
    expect(res.status).toBe(400); 
  });

  it("Should return 403 for not commenter", async () => {
    const comment_id = comment._id; 
    let res = await request 
      .delete("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ comment_id }); 
    expect(res.status).toBe(403); 
  });

  it("Should return 404 for nonexistent comment", async () => {
    const comment_id = VALID_ID; 
    let res = await request 
      .delete("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ comment_id }); 
    expect(res.status).toBe(404); 
  });

  it("Should return 500 for invalid comment id", async () => {
    const comment_id = INVALID_ID; 
    let res = await request 
      .delete("/api/comment")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ comment_id }); 
    expect(res.status).toBe(500); 
  });
});

describe("Comment Routes: DELETE /api/thread", () => {
  it("Should delete comment", async () => {
    const thread_id = thread._id; 
    let res = await request 
      .delete("/api/thread")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ thread_id }); 
    expect(res.status).toBe(200); 
    let deleted = res.body.data; 
    expect(deleted._id.toString()).toBe(thread_id);
    // db check 
    deleted = await Threads.findById(thread_id); 
    expect(deleted).toBeNull();
  });

  it("Should return 400 for missing thread id", async () => {
    let res = await request 
      .delete("/api/thread")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ }); 
    expect(res.status).toBe(400); 
  });

  it("Should return 403 for not commenter", async () => {
    const thread_id = thread._id; 
    let res = await request 
      .delete("/api/thread")
      .set("Authorization", `Bearer ${TEST_TOKEN_2}`)
      .send({ thread_id }); 
    expect(res.status).toBe(403); 
  });

  it("Should return 404 for nonexistent thread", async () => {
    const thread_id = VALID_ID; 
    let res = await request 
      .delete("/api/thread")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ thread_id }); 
    expect(res.status).toBe(404); 
  });

  it("Should return 500 for invalid comment id", async () => {
    const thread_id = INVALID_ID; 
    let res = await request 
      .delete("/api/thread")
      .set("Authorization", `Bearer ${TEST_TOKEN_1}`)
      .send({ thread_id }); 
    expect(res.status).toBe(500); 
  });
});

