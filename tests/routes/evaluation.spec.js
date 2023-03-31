import mongoose from 'mongoose';
import evaluation from '../../model/Evaluation';
import supertest from 'supertest';
import createApp from '../../app';

const request = supertest(createApp());
mongoose.set('strictQuery', true);

const sampleEval = {
  n: 'Test Course',
  num: 'AS.420.690',
};

beforeAll((done) => {
  mongoose.connect('mongodb://localhost:27017/evaluation', {
    useNewUrlParser: true,
  });
  done();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Evaluation Routes', () => {
  it('Should return evaluation with the given _id', async () => {
    const num = sampleEval.num;
    await evaluation.create(sampleEval);
    let res = await request.get(`/api/evals/${num}`);
    expect(res.status).toBe(200);
    expect(res.body.data.num).toBe(num);
  });
  it('Should return 404 for non existent evaluation', async () => {
    let res = await request.get(`/api/evals/AS.874.234`);
    expect(res.status).toBe(404);
  });
});
