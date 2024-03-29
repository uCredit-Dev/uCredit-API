import mongoose from 'mongoose';
import supertest from 'supertest';
import SISCV from '../../model/SISCourseV';
import createApp from '../../app';
import { SAMEPLE_SIS_COURSES } from './testVars';

const request = supertest(createApp());
const TEST_URI = process.env.TEST_URI || 'mongodb://localhost:27017/search';
mongoose.set('strictQuery', true);

let courses;

beforeAll(async () => {
  mongoose.connect(TEST_URI, {
    useNewUrlParser: true,
  });
  courses = await SISCV.insertMany(SAMEPLE_SIS_COURSES);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('GET Search Routes', () => {
  it('GET /api/search/all: Should return list of all SIS courses', async () => {
    const res = await request.get('/api/search/all');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(courses.length);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET /api/search/skip/:num: Should return list of SIS courses of size num', async () => {
    const num = Math.floor(Math.random() * 3);
    const res = await request.get(`/api/search/skip/0?mod=${num}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(num);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET /api/search/: Should return list of SIS courses matching query', async () => {
    const query = {
      title: 'tit',
      number: 'num',
      credits: '3',
    };
    // query by title
    let res = await request.get(`/api/search?query=${query.title}`);
    courses = res.body.data.courses;
    expect(res.status).toBe(200);
    expect(courses.length).toBe(3);
    courses.forEach((course) => {
      expect(course.title.toLowerCase()).toContain(query.title.toLowerCase());
    });
    // query by number
    res = await request.get(`/api/search?query=${query.number}`);
    expect(res.status).toBe(200);
    courses = res.body.data.courses;
    expect(courses.length).toBe(3);
    courses.forEach((course) => {
      expect(course.number.toLowerCase()).toContain(query.number.toLowerCase());
    });
    // query by credits
    res = await request.get('/api/search?credits=' + query.credits);
    expect(res.status).toBe(200);
    courses = res.body.data.courses;
    expect(courses.length).toBe(1);
    courses.forEach((course) => {
      course.versions.forEach((version) => {
        expect(version.credits).toBe(parseInt(query.credits));
      });
    });
  });

  it('GET /api/searchVersion: Should return a specific version of a course', async () => {
    const query = {
      version: 'fall',
      title: 'Title1',
      number: 'Number1',
    };
    const res = await request.get(
      '/api/searchVersion?version=' +
        query.version +
        '&title=' +
        query.title +
        '&number=' +
        query.number,
    );
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe(query.title);
    expect(res.body.data.number).toBe(query.number);
    expect(res.body.data.version.term).toBe(query.version);
  });
});
