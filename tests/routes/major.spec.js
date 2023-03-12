import mongoose from 'mongoose';
import supertest from 'supertest';
import Majors from '../../model/Major';
import createApp from '../../app';
import { allMajors } from '../../data/majors';

const request = supertest(createApp());
mongoose.set('strictQuery', true);

beforeAll((done) => {
  mongoose.connect('mongodb://localhost:27017/major', {
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
    const bsCS_Old = allMajors[1];
    const res = await request.post('/api/majors').send(bsCS_Old);
    const data = res.body.data;
    expect(data.degree_name).toBe(bsCS_Old.degree_name);
  });

  it('should return status 500 for invalid major', async () => {
    const bsCS_Old = { ...allMajors[1], degree_name: null };
    const res = await request.post('/api/majors').send(bsCS_Old);
    expect(res.status).toBe(500);
  });
});

describe('Major Routes: GET /api/majors/all', () => {
  it('should return 0 majors when calling all majors initially', async () => {
    const res = await request.get('/api/majors/all');
    expect(res.body.data.length).toBe(0);
  });

  it('should return 2 majors when calling all majors after two posts', async () => {
    let res = await request.post('/api/majors').send(allMajors[0]);
    expect(res.status).toBe(200);
    res = await request.post('/api/majors').send(allMajors[1]);
    expect(res.status).toBe(200);
    res = await request.get('/api/majors/all');
    const majors = res.body.data;
    expect(majors.length).toBe(2);
  });
});

const data = { test: true };
