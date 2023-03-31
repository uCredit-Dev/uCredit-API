import mongoose from 'mongoose';
import supertest from 'supertest';
import createApp from '../../app';

const request = supertest(createApp());
const TEST_URI = process.env.TEST_URI || 'mongodb://localhost:27017/sisData';
mongoose.set('strictQuery', true);

const TEST_NAME = 'test';

beforeAll((done) => {
  mongoose.connect(TEST_URI, {
    useNewUrlParser: true,
  });
  done();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('POST /api/sis/studentRecords student records', () => {
  it('should return posted data on post', async () => {
    const resp = await request
      .post('/api/sis/studentRecords')
      .send({ name: TEST_NAME });
    expect(resp.status).toBe(200);
    expect(resp.body.data.name).toBe(TEST_NAME);
  });

  it('should return status 400 on null data on post', async () => {
    const resp = await request.post('/api/sis/studentRecords').send(null);
    expect(resp.status).toBe(400);
  });
});

const data = { test: true };
