import mongoose from 'mongoose';
import supertest from 'supertest';
import createApp from '../../app';
import Users from '../../model/User';
import {
  TEST_TOKEN_1,
  TEST_PLAN_1,
  TEST_PLAN_2,
  TEST_TOKEN_2,
  INVALID_ID,
  TEST_USER_1,
  TEST_CS,
  TEST_AMS,
} from './testVars';

const request = supertest(createApp());
const TEST_URI = process.env.TEST_URI || 'mongodb://localhost:27017/notification';
mongoose.set('strictQuery', true);

let plan = [];

beforeAll((done) => {
  mongoose.connect(TEST_URI, { useNewUrlParser: true });
  done();
});

beforeEach(async () => {
  await Users.create(TEST_USER_1);
  const response = await request
    .post('/api/plans')
    .set('Authorization', `Bearer ${TEST_TOKEN_1}`)
    .send(TEST_PLAN_1);
  plan = response.body.data;
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Plan Routes: GET /api/plans/:plan_id', () => {
  it('Should return plan with the given _id', async () => {
    const res = await request
      .get(`/api/plans/${plan._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(plan._id);
  });

  it('Should return stauts 403 with different user', async () => {
    const res = await request
      .get(`/api/plans/${plan._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });

  it('Should return stauts 500 with invalid plan_id', async () => {
    const res = await request
      .get(`/api/plans/${INVALID_ID}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });
});

describe('Plan Routes: GET /api/plansByUser/:user_id', () => {
  it('Should return plan by User1', async () => {
    const res = await request
      .get(`/api/plansByUser/${TEST_USER_1._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    const plans = res.body.data;
    expect(plans.length).toBe(1);
    expect(plans[0].name).toBe(TEST_PLAN_1.name);
  });

  it('Should return stauts 403 with different user', async () => {
    const res = await request
      .get(`/api/plansByUser/${TEST_USER_1._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });
});

describe('Plan Routes: POST /api/plans', () => {
  it('Should return created plan', async () => {
    const res = await request
      .post(`/api/plans`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`)
      .send(TEST_PLAN_2);
    expect(res.status).toBe(200);
    const plan = res.body.data;
    expect(plan.name).toBe(TEST_PLAN_2.name);
  });

  it('Should return status 403 with wrong user', async () => {
    const res = await request
      .post(`/api/plans`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`)
      .send(TEST_PLAN_2);
    expect(res.status).toBe(403);
  });

  it('Should return status 400 with no user_id', async () => {
    const body = { ...TEST_PLAN_2, user_id: null };
    const res = await request
      .post(`/api/plans`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`)
      .send(body);
    expect(res.status).toBe(400);
  });
});

describe('Plan Routes: DELETE /api/plans/:plan_id', () => {
  it('Should return deleted plan', async () => {
    const res = await request
      .delete(`/api/plans/${plan._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data._id).toBe(plan._id);
  });

  it('Should return status 403 with unauthorized user', async () => {
    const res = await request
      .delete(`/api/plans/${plan._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });

  it('Should return status 500 with invalid plan_id', async () => {
    const res = await request
      .delete(`/api/plans/${INVALID_ID}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });
});

describe('Plan Routes: PATCH /api/plans/update', () => {
  it('Should update majors', async () => {
    const body = {
      plan_id: plan._id,
      majors: [TEST_CS, TEST_AMS],
    };
    const res = await request
      .patch(`/api/plans/update`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`)
      .send(body);
    expect(res.status).toBe(200);
    const newPlan = res.body.data._doc;
    expect(newPlan._id).toBe(plan._id);
    expect(newPlan.majors).toStrictEqual(body.majors);
  });

  it('Should update name', async () => {
    const body = {
      plan_id: plan._id,
      name: 'New Plan Name',
    };
    const res = await request
      .patch(`/api/plans/update`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`)
      .send(body);
    expect(res.status).toBe(200);
    const newPlan = res.body.data._doc;
    expect(newPlan._id).toBe(plan._id);
    expect(newPlan.name).toBe(body.name);
  });

  it('Should return status 403 for different user', async () => {
    const body = {
      plan_id: plan._id,
      name: 'New Plan Name',
    };
    const res = await request
      .patch(`/api/plans/update`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`)
      .send(body);
    expect(res.status).toBe(403);
  });

  it('Should return status 400 for missing params', async () => {
    const res = await request
      .patch(`/api/plans/update`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`)
      .send({});
    expect(res.status).toBe(400);
  });
});
