import mongoose from 'mongoose';
import supertest from 'supertest';
import Majors from '../../model/Major';
import createApp from '../../app';
import { allMajors, getMajor } from '../../data/majors';
import { TEST_AMS, TEST_COG, TEST_CS } from './testVars';

const request = supertest(createApp());
const TEST_URI = process.env.TEST_URI || 'mongodb://localhost:27017/major';
mongoose.set('strictQuery', true);

beforeAll((done) => {
  mongoose.connect(TEST_URI, {
    useNewUrlParser: true,
  });
  done();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Major Routes: POST /api/majors', () => {
  it('should create a new major', async () => {
    const bsCS_Old = allMajors[1];
    const res = await request.post('/api/majors').send(bsCS_Old);
    // major obj from db
    let major = await Majors.find({ degree_name: bsCS_Old.degree_name });
    expect(major).toBeTruthy();
  });

  it('should throw error on invalid major data', async () => {
    const res = await request.post('/api/majors').send(undefined);
    expect(res.status).toBe(400);
  });

  it('should throw error on invalid major data', async () => {
    const res = await request.post('/api/majors').send({});
    expect(res.status).toBe(400);
  });

  it('should return a major after posting', async () => {
    const bscs = getMajor(TEST_CS);
    const res = await request.post('/api/majors').send(bscs);
    const data = res.body.data;
    expect(data._id).toBe(TEST_CS);
  });

  it('should return status 500 for invalid major', async () => {
    const bscs = { ...getMajor(TEST_CS), _id: null };
    const res = await request.post('/api/majors').send(bscs);
    expect(res.status).toBe(500);
  });
});

describe('Major Routes: GET /api/majors/all', () => {
  it('should return 0 majors when calling all majors initially', async () => {
    const res = await request.get('/api/majors/all');
    expect(res.body.data.length).toBe(0);
  });

  it('should return 2 majors when calling all majors after two posts', async () => {
    let res = await request.post('/api/majors').send(getMajor(TEST_CS));
    expect(res.status).toBe(200);
    res = await request.post('/api/majors').send(getMajor(TEST_AMS));
    expect(res.status).toBe(200);
    res = await request.get('/api/majors/all');
    const majors = res.body.data;
    expect(majors.length).toBe(2);
  });
});

describe('Major Routes: GET /api/majors/:major_id', () => {
  it('should get major by id', async () => {
    let res = await request.post('/api/majors').send(getMajor(TEST_COG));
    expect(res.status).toBe(200);
    res = await request.get(`/api/majors/${TEST_COG}`);
    expect(res.status).toBe(200);
    const major = res.body.data;
    expect(major._id).toBe(TEST_COG);
  });

  it('should throw 404 for major not found', async () => {
    const res = await request.get(`/api/majors/${TEST_AMS}`);
    expect(res.status).toBe(404);
  });
});

const data = { test: true };
