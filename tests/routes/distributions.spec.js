import mongoose from 'mongoose';
import createApp from '../../app';
import supertest from 'supertest';
import Users from '../../model/User';
import Majors from '../../model/Major';
import Distributions from '../../model/Distribution';
import {
  INVALID_ID,
  TEST_AMS,
  TEST_CS,
  TEST_PLAN_1,
  TEST_TOKEN_1,
  TEST_TOKEN_2,
  TEST_USER_1,
  VALID_ID,
} from './testVars';
import { getMajor } from '../../data/majors';

const request = supertest(createApp());
let user;
let plan;
let distributions;

beforeAll((done) => {
  mongoose.connect('mongodb://localhost:27017/distributions', {
    useNewUrlParser: true,
  });
  done();
});

beforeEach(async () => {
  // make sample user
  user = await Users.create(TEST_USER_1);
  await Majors.create(getMajor(TEST_CS));
  await Majors.create(getMajor(TEST_AMS));
  // make sample plan
  const res = await request
    .post('/api/plans')
    .set('Authorization', `Bearer ${TEST_TOKEN_1}`)
    .send(TEST_PLAN_1);
  plan = res.body.data;
  // get distributions
  distributions = await Distributions.find({ plan_id: plan._id });
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Distribution routes: GET /api/distributions/:distribution_id', () => {
  it('should return a distribution by distribution id', async () => {
    const distribution_id = distributions[0]._id;
    const res = await request
      .get('/api/distributions/' + distribution_id)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data._id.toString()).toBe(distribution_id.toString());
    expect(res.body.data.user_id.toString()).toBe(user._id.toString());
    expect(res.body.data.plan_id.toString()).toBe(plan._id.toString());
  });

  it('should throw status 500 on null id', async () => {
    const res = await request
      .get(`/api/distributions/${INVALID_ID}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });

  it('should throw status 404 on no distribution', async () => {
    const res = await request
      .get(`/api/distributions/${VALID_ID}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it('should throw status 403 on missing or invalid jwt', async () => {
    let res = await request.get(`/api/distributions/${VALID_ID}`);
    expect(res.status).toBe(403);
    res = await request
      .get(`/api/distributions/${VALID_ID}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });
});

describe('Distribution routes: GET /api/distributionsByPlan/:plan_id', () => {
  it('should return distributions by plan id', async () => {
    // note that request doesn't encode params to UTF-8, unlike axios
    let res = await request
      .get(
        `/api/distributionsByPlan/?plan_id=${
          plan._id
        }&major_id=${TEST_CS.replace('&', '%26')}`,
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.length).toBe(getMajor(TEST_CS).distributions.length);
    res = await request
      .get(
        `/api/distributionsByPlan/?plan_id=${
          plan._id
        }&major_id=${TEST_AMS.replace('&', '%26')}`,
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.length).toBe(getMajor(TEST_AMS).distributions.length);
  });

  it('should throw status 500 on null plan id', async () => {
    const res = await request
      .get(
        `/api/distributionsByPlan/?plan_id=${INVALID_ID}&major_id=${TEST_CS}`,
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });

  it('should throw status 404 on null major id', async () => {
    const res = await request
      .get(
        `/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${INVALID_ID}`,
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it('should throw status 404 on plan not found', async () => {
    const res = await request
      .get(`/api/distributionsByPlan/?plan_id=${VALID_ID}&major_id=${TEST_CS}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it('should throw status 404 on major not found', async () => {
    const res = await request
      .get(`/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${VALID_ID}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it('should throw status 403 on missing or invalid jwt', async () => {
    let res = await request.get(
      `/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${TEST_CS}`,
    );
    expect(res.status).toBe(403);
    res = await request
      .get(`/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${TEST_CS}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/distributions/updateRequiredCredits', () => {
  it('should return the updated distribution', async () => {
    const distribution_id = distributions[0]._id;
    const res = await request
      .patch(
        '/api/distributions/updateRequiredCredits' +
          '?id=' +
          distribution_id +
          '&required=1',
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    let updated = res.body.data;
    expect(updated._id.toString()).toBe(distribution_id.toString());
    expect(updated.required_credits).toBe(1);
    updated = await Distributions.findById(distribution_id);
    expect(updated.required_credits).toBe(1);
  });

  it('should throw status 400 on empty query', async () => {
    const res = await request
      .patch('/api/distributions/updateRequiredCredits')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });

  it('should throw status 400 on invalid id', async () => {
    const res = await request
      .patch(
        `/api/distributions/updateRequiredCredits?id=${INVALID_ID}&required=1`,
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });

  it('should throw status 500 on non numerical required value', async () => {
    const distribution_id = distributions[0]._id;
    const res = await request
      .patch(
        `/api/distributions/updateRequiredCredits?id=${distribution_id}&required=${INVALID_ID}`,
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });

  it('should throw status 403 on missing or invalid jwt', async () => {
    const distribution_id = distributions[0]._id;
    let res = await request.get(
      `/api/distributions/updateRequiredCredits?id=${distribution_id}&required=1`,
    );
    expect(res.status).toBe(403);
    res = await request
      .get(`/api/distributionsByPlan/?plan_id=${plan._id}&major_id=${TEST_CS}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/distributions/updateName', () => {
  it('should return the updated distribution', async () => {
    const distribution_id = distributions[0]._id;
    const res = await request
      .patch(`/api/distributions/updateName?id=${distribution_id}&name=NEW`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    let updated = res.body.data;
    expect(updated._id.toString()).toBe(distribution_id.toString());
    expect(updated.name).toBe('NEW');
    updated = await Distributions.findById(distribution_id);
    expect(updated.name).toBe('NEW');
  });

  it('should throw status 400 on empty query', async () => {
    const res = await request
      .patch('/api/distributions/updateName')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });

  it('should throw status 400 on invalid id', async () => {
    const res = await request
      .patch(`/api/distributions/updateName?id=${INVALID_ID}&name=NEW`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });

  it('should throw status 403 on missing or invalid jwt', async () => {
    const distribution_id = distributions[0]._id;
    let res = await request.get(
      `/api/distributions/updateName?id=${distribution_id}&name=NEW`,
    );
    expect(res.status).toBe(403);
    res = await request
      .get(`/api/distributionsByPlan/?plan_id=${plan._id}&name=NEW`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });
});

const data = { test: true };
