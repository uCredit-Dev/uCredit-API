import mongoose from 'mongoose';
import Notifications from '../../model/Notification';
import Users from '../../model/User';
import supertest from 'supertest';
import createApp from '../../app';
import {
  TEST_TOKEN_1,
  TEST_TOKEN_2,
  TEST_USER_1,
  TEST_USER_2,
  VALID_ID,
  INVALID_ID,
} from './testVars';

const request = supertest(createApp());
const TEST_URI =
  process.env.TEST_URI || 'mongodb://localhost:27017/notification';
mongoose.set('strictQuery', true);

const NOTIF_BODY = {
  user_id: [],
  message: 'this is a notification',
};

let user1;
let user2;
let notification;

beforeAll((done) => {
  mongoose.connect(TEST_URI, {
    useNewUrlParser: true,
  });
  done();
});

beforeEach(async () => {
  user1 = await Users.create(TEST_USER_1);
  user2 = await Users.create(TEST_USER_2);
  NOTIF_BODY.user_id.push(user1._id);
  let res = await request.post(`/api/notifications`).send(NOTIF_BODY);
  notification = res.body.data;
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Notification Routes: GET /api/notifications/:user_id', () => {
  it('Should get all notifications', async () => {
    let res = await request
      .get(`/api/notifications/${user1._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    res = await request
      .get(`/api/notifications/${user2._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('Should return 403 for not user', async () => {
    let res = await request
      .get(`/api/notifications/${user1._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });
});

describe('Notification Routes: POST /api/notifications', () => {
  it('Should create new notification', async () => {
    let res = await request.post(`/api/notifications`).send(NOTIF_BODY);
    expect(res.status).toBe(200);
    let notification = res.body.data;
    expect(notification._id).toBeTruthy();
    // db check
    notification = await Notifications.findById(notification._id);
    expect(notification).toBeTruthy();
    expect(notification.user_id).toContain(user1._id);
  });

  it('Should return 400 for empty body', async () => {
    let res = await request.post(`/api/notifications`).send({});
    expect(res.status).toBe(400);
  });

  it('Should return 400 for null body', async () => {
    const notification = null;
    let res = await request.post(`/api/notifications`).send(notification);
    expect(res.status).toBe(400);
  });

  it('Should return 400 for body missing user_id field', async () => {
    const notification = { message: 'message' };
    let res = await request.post(`/api/notifications`).send(notification);
    expect(res.status).toBe(400);
  });
});

describe('Notification Routes: POST /api/notifications/read/:notification_id', () => {
  it('Should mark notification as read', async () => {
    const notification_id = notification._id;
    expect(notification.read).toBe(false);
    let res = await request
      .post(`/api/notifications/read/${notification_id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    // db check
    notification = await Notifications.findById(notification_id);
    expect(notification.read).toBe(true);
  });

  it('Should return 403 for wrong user', async () => {
    const notification_id = notification._id;
    let res = await request
      .post(`/api/notifications/read/${notification_id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });

  it('Should return 404 for nonexistent notification', async () => {
    const notification_id = VALID_ID;
    let res = await request
      .post(`/api/notifications/read/${notification_id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it('Should return 400 for invalid notification', async () => {
    const notification_id = INVALID_ID;
    let res = await request
      .post(`/api/notifications/read/${notification_id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(400);
  });
});

describe('Notification Routes: DELETE /api/notifications/:notification_id', () => {
  it('Should delete notification', async () => {
    const notification_id = notification._id;
    let res = await request
      .delete(`/api/notifications/${notification_id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(200);
    // db check
    notification = await Notifications.findById(notification_id);
    expect(notification).toBeNull();
  });

  it('Should return 403 for wrong user', async () => {
    const notification_id = notification._id;
    let res = await request
      .delete(`/api/notifications/${notification_id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(res.status).toBe(403);
  });

  it('Should return 404 for nonexistent notification', async () => {
    const notification_id = VALID_ID;
    let res = await request
      .delete(`/api/notifications/${notification_id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(404);
  });

  it('Should return 400 for invalid notification', async () => {
    const notification_id = INVALID_ID;
    let res = await request
      .delete(`/api/notifications/${notification_id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(res.status).toBe(500);
  });
});
