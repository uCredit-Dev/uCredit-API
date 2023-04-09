import mongoose from 'mongoose';
import supertest from 'supertest';
import Users from '../../model/User';
import Plans from '../../model/Plan';
import { decodeToken } from '../../util/token';
import createApp from '../../app';
import {
  FRESHMAN,
  SOPHOMORE,
  JUNIOR,
  SENIOR,
  TEST_USER_1,
  TEST_TOKEN_1,
  TEST_TOKEN_2,
  TEST_PLAN_1,
} from './testVars';

const request = supertest(createApp());
const TEST_URI = process.env.TEST_URI || 'mongodb://localhost:27017/user';
mongoose.set('strictQuery', true);

beforeAll(async () => {
  mongoose.connect(TEST_URI, { useNewUrlParser: true });
  const samples = [];
  for (let i = 1; i <= 98; i++) {
    const userObj = { _id: `User${i}`, name: `User${i}` };
    if (i % 4 === 0) {
      userObj.affiliation = FRESHMAN;
    } else if (i % 4 === 1) {
      userObj.affiliation = SOPHOMORE;
    } else if (i % 4 === 2) {
      userObj.affiliation = JUNIOR;
    } else {
      userObj.affiliation = SENIOR;
    }
    samples.push(userObj);
  }
  samples.push({ _id: `mtiavis1`, name: `mtiavis1`, affiliation: JUNIOR });
  samples.push({ _id: `wtong10`, name: `wtong10`, affiliation: SOPHOMORE });
  await Users.insertMany(samples);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('User Routes: GET /api/user', () => {
  it('Should select a list of users for username number filters', async () => {
    const userResp = await request.get('/api/user?username=1');
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(21);
    for (let user of userResp.body.data) {
      expect(user.name).toContain('1');
    }
  });

  it('Should select a list of users for username word filters', async () => {
    const userResp = await request.get('/api/user?username=User');
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(98);
    for (let user of userResp.body.data) {
      expect(user.name).toContain('User');
    }
  });

  it('Should select all users for empty username word filters', async () => {
    const userResp = await request.get('/api/user?username=');
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(100);
  });

  it('Should select all users for freshman affiliation filters', async () => {
    const userResp = await request.get('/api/user?affiliation=' + FRESHMAN);
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(24);
    for (let user of userResp.body.data) {
      expect(user.affiliation).toBe(FRESHMAN);
    }
  });

  it('Should select all users for sophomore affiliation filters', async () => {
    const userResp = await request.get('/api/user?affiliation=' + SOPHOMORE);
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(26);
    for (let user of userResp.body.data) {
      expect(user.affiliation).toBe(SOPHOMORE);
    }
  });

  it('Should select all users for junior affiliation filters', async () => {
    const userResp = await request.get('/api/user?affiliation=' + JUNIOR);
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(26);
    for (let user of userResp.body.data) {
      expect(user.affiliation).toBe(JUNIOR);
    }
  });

  it('Should select all users for senior affiliation filters', async () => {
    const userResp = await request.get('/api/user?affiliation=' + SENIOR);
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(24);
    for (let user of userResp.body.data) {
      expect(user.affiliation).toBe(SENIOR);
    }
  });

  it('Should select all users for empty affiliation word filters', async () => {
    const userResp = await request.get('/api/user?affiliation=');
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(100);
  });

  it('Should select all users for empty affiliation and user filters', async () => {
    const userResp = await request.get('/api/user');
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(100);
  });

  it('Should select all users for nonempty affiliation and user filters', async () => {
    const userResp = await request.get(
      '/api/user?username=1&affiliation=' + FRESHMAN,
    );
    expect(userResp).toBeTruthy();
    expect(userResp.status).toBe(200);
    expect(userResp.body.data.length).toBe(2);
    for (let user of userResp.body.data) {
      expect(user.name).toContain('1');
      expect(user.affiliation).toBe(FRESHMAN);
    }
  });
});

describe('User Routes: GET /api/backdoor/verification/:id', () => {
  it('Should create new user', async () => {
    let res = await request.get(
      `/api/backdoor/verification/${TEST_USER_1._id}`,
    );
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.user._id).toBe(TEST_USER_1._id);
    expect(data.user.school).toBe('jooby hooby');
    expect(data.token).toBeTruthy();
    const decoded = decodeToken(data.token);
    expect(decoded._id).toBe(data.user._id);
    expect(decoded.name).toBe(data.user.name);
    expect(decoded.affiliation).toBe(data.user.affiliation);
    // db check
    const user = await Users.findById(TEST_USER_1._id);
    expect(user).toBeTruthy();
  });

  it('Should not create new user if already exists', async () => {
    // calling route a second time
    let res = await request.get(
      `/api/backdoor/verification/${TEST_USER_1._id}`,
    );
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.user._id).toBe(TEST_USER_1._id);
    expect(data.token).toBeTruthy();
    const decoded = decodeToken(data.token);
    expect(decoded._id).toBe(TEST_USER_1._id);
    // db check
    const users = await Users.find({ name: TEST_USER_1._id });
    expect(users.length).toBe(1);
  });
});

describe('User Routes: DELETE /api/user/:id', () => {
  it('Should delete user', async () => {
    await Users.create({ ...TEST_USER_1, _id: 'TEST_DEV' });
    let res = await request
      .delete(`/api/user/TEST_DEV`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(204);
    // db check
    const user = await Users.findById('TEST_DEV');
    expect(user).toBeNull();
  });

  it('Should throw 403 for non test user ids', async () => {
    let res = await request
      .delete(`/api/user/${TEST_USER_1._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(403);
  });

  it("Should delete user's plans", async () => {
    await Users.create({ ...TEST_USER_1, _id: 'TEST_DEV' });
    await Plans.create({ ...TEST_PLAN_1, user_id: 'TEST_DEV' });
    // check that plan successfully created
    let res = await request.delete(`/api/user/TEST_DEV`);
    expect(res.status).toBe(204);
    // check that plan deleted with user
    const plans = await Plans.find({ user_id: 'TEST_DEV' });
    expect(plans.length).toBe(0);
  });
});
const data = { test: true };
