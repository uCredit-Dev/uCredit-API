import mongoose from 'mongoose';
import supertest from 'supertest';
import createApp from '../../app';
import Plans from '../../model/Plan';
import Users from '../../model/User';
import Courses from '../../model/Course';
import Distributions from '../../model/Distribution';
import Years from '../../model/Year';
import {
  FRESHMAN,
  TEST_PLAN_1,
  TEST_PLAN_2,
  TEST_USER_1,
  TEST_USER_2,
  TEST_TOKEN_1,
  TEST_TOKEN_2,
} from './testVars';

const request = supertest(createApp());
mongoose.set('strictQuery', true);

let distributions;
let plans;

beforeAll((done) => {
  mongoose.connect('mongodb://localhost:27017/distribution', {
    useNewUrlParser: true,
  });
  done();
});

beforeEach(async () => {
  await Users.create(TEST_USER_1);
  await Users.create(TEST_USER_2);
  const res1 = await request
    .post('/api/plans')
    .set('Authorization', `Bearer ${TEST_TOKEN_1}`)
    .send(TEST_PLAN_1);
  const res2 = await request
    .post('/api/plans')
    .set('Authorization', `Bearer ${TEST_TOKEN_2}`)
    .send(TEST_PLAN_2);
  for (let i = 0; i < 5; i++) {
    const plan = i < 3 ? res1.body.data : res2.body.data;
    const courseResp = await Courses.create({
      name: `course${i}`,
      plan_id: plan._id,
      year_id: plan.years[0]._id,
      user_id: TEST_USER_1._id,
      year: FRESHMAN,
      term: 'fall',
      credits: 0,
      title: i,
      level: 'Lower Level Undergraduate',
    });
    await Years.findByIdAndUpdate(plan.years[0]._id, {
      $push: { courses: courseResp._id },
    });
    const distributionResp = await Distributions.create({
      plan_id: plan._id,
      course_id: courseResp._id,
      user_id: TEST_USER_1._id,
      year: FRESHMAN,
      term: 'fall',
      name: i,
      required: true,
      year_id: plan.years[0]._id,
    });
    await Courses.findByIdAndUpdate(distributionResp._id, {
      $push: { courses: courseResp._id },
    });
    await Courses.findByIdAndUpdate(courseResp._id, {
      $push: { distribution_ids: distributionResp._id },
    });
    await Plans.findByIdAndUpdate(plan._id, {
      $push: { distribution_ids: distributionResp._id },
    });
  }
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /api/distributions/:distribution_id', () => {
  it('should return a distribution by distribution id', async () => {
    distributions = await Distributions.find({});
    const distribution = distributions[0];
    const resp = await request
      .get('/api/distributions/' + distribution._id)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(resp.body.data).toBeTruthy();
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(
      JSON.stringify(distribution._id),
    );
  });

  it('should throw status 400 on null id', async () => {
    const response = await request
      .get('/api/distributions/%00')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(response.status).toBe(400);
  });

  it('should throw status 403 on wrong user', async () => {
    distributions = await Distributions.find({});
    const distribution = distributions[0];
    const response = await request
      .get(`/api/distributions/${distribution._id}`)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(response.status).toBe(403);
  });
});

describe('GET /api/distributionsByPlan/:plan_id', () => {
  it('should return a distribution by plan id', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    distributions = await Distributions.find({});
    const distribution = distributions[0];
    const resp = await request
      .get('/api/distributionsByPlan/' + plan_id)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(resp.body.data).toBeTruthy();
    expect(resp.status).toBe(200);
    expect(resp.body.data.length).toBe(3);
    expect(JSON.stringify(resp.body.data[0]._id)).toBe(
      JSON.stringify(distribution._id),
    );
  });

  it('should throw status 400 on null id', async () => {
    const response = await request
      .get('/api/distributions/%00')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(response.status).toBe(400);
  });

  it('should throw status 403 on wrong user', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    const resp = await request
      .get('/api/distributionsByPlan/' + plan_id)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(resp.status).toBe(403);
  });
});

describe('POST /api/distributions', () => {
  it('should return the created distribution', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    const newDistribution = {
      plan_id: plan_id,
      course_id: plan_id,
      user_id: TEST_USER_1._id,
      year: FRESHMAN,
      term: 'fall',
      name: 'test',
      required: 0,
      year_id: plans[0].year_ids[0],
    };
    const resp = await request
      .post('/api/distributions')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`)
      .send(newDistribution);
    expect(resp.status).toBe(200);
    expect(resp.body.data).toBeTruthy();
    expect(JSON.stringify(resp.body.data.plan_id)).toBe(
      JSON.stringify(plan_id),
    );
    const updatedPlan = await Plans.findById(plan_id);
    expect(updatedPlan).toBeTruthy();
    expect(JSON.stringify(updatedPlan.distribution_ids[3])).toBe(
      JSON.stringify(resp.body.data._id),
    );
  });

  it('should throw status 400 on empty body', async () => {
    const response = await request
      .post('/api/distributions')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(response.status).toBe(400);
  });

  it('should throw status 400 on incomplete body', async () => {
    const response = await request
      .post('/api/distributions')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`)
      .send({});
    expect(response.status).toBe(400);
  });

  it('should throw 403 on wrong user ', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    const newDistribution = {
      plan_id: plan_id,
      course_id: plan_id,
      user_id: TEST_USER_1._id,
      year: FRESHMAN,
      term: 'fall',
      name: 'test',
      required: 0,
      year_id: plans[0].year_ids[0],
    };
    const resp = await request
      .post('/api/distributions')
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`)
      .send(newDistribution);
    expect(resp.status).toBe(403);
  });
});

describe('PATCH /api/distributions/updateRequiredCredit', () => {
  it('should return the updated distribution', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    const dist_id = plans[0].distribution_ids[0];
    const resp = await request
      .patch(
        '/api/distributions/updateRequiredCredits' +
          '?id=' +
          dist_id +
          '&required=1',
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(JSON.stringify(dist_id));
    expect(resp.body.data.required).toBe(1);
    const updatedPlan = await Plans.findById(plan_id);
    expect(updatedPlan).toBeTruthy();
    expect(JSON.stringify(updatedPlan.distribution_ids[0])).toBe(
      JSON.stringify(dist_id),
    );
    const updatedDistribution = await Distributions.findById(
      updatedPlan.distribution_ids[0],
    );
    expect(updatedDistribution.required).toBe(1);
  });

  it('should throw status 400 on empty query', async () => {
    const response = await request
      .patch('/api/distributions/updateRequiredCredits')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(response.status).toBe(400);
  });

  it('should throw status 400 on null id', async () => {
    const response = await request
      .patch('/api/distributions/updateRequiredCredits?id=%00&required=1')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(response.status).toBe(400);
  });

  it('should throw status 400 on null required', async () => {
    plans = await Plans.find({});
    const dist_id = plans[0].distribution_ids[0];
    const response = await request
      .patch(
        '/api/distributions/updateRequiredCredits?id=' +
          dist_id +
          '&required=%00',
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(response.status).toBe(400);
  });

  it('should return the updated distribution', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    const dist_id = plans[0].distribution_ids[0];
    const resp = await request
      .patch(
        '/api/distributions/updateRequiredCredits' +
          '?id=' +
          dist_id +
          '&required=1',
      )
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(resp.status).toBe(403);
  });
});

describe('PATCH /api/distributions/updateName', () => {
  it('should return the updated distribution', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    const dist_id = plans[0].distribution_ids[0];
    const resp = await request
      .patch('/api/distributions/updateName' + '?id=' + dist_id + '&name=new')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(JSON.stringify(dist_id));
    expect(resp.body.data.name).toBe('new');
    const updatedPlans = await Plans.find({ _id: plan_id });
    expect(updatedPlans).toBeTruthy();
    expect(JSON.stringify(updatedPlans[0].distribution_ids[0])).toBe(
      JSON.stringify(dist_id),
    );

    const updatedDistribution = await Distributions.findById(dist_id);
    expect(updatedDistribution.name).toBe('new');
  });

  it('should throw status 400 on empty query', async () => {
    const response = await request
      .patch('/api/distributions/updateName')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(response.status).toBe(400);
  });

  it('should throw status 400 on null id', async () => {
    const response = await request
      .patch('/api/distributions/updateName?id=%00&name=new')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(response.status).toBe(400);
  });

  it('should return the updated distribution', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    const dist_id = plans[0].distribution_ids[0];
    const resp = await request
      .patch('/api/distributions/updateName' + '?id=' + dist_id + '&name=new')
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(resp.status).toBe(403);
  });
});

describe('DELETE /api/distributions/:d_id', () => {
  it('should return the deleted distribution', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    const dist_id = plans[0].distribution_ids[0];
    const resp = await request
      .delete('/api/distributions/' + dist_id)
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(JSON.stringify(dist_id));
    const updatedPlan = await Plans.findById(plan_id);
    expect(updatedPlan).toBeTruthy();
    updatedPlan.distribution_ids.forEach((id) => {
      expect(JSON.stringify(id)).not.toBe(JSON.stringify(dist_id));
    });
  });

  it('should throw status 400 on invalid id', async () => {
    const resp = await request
      .delete('/api/distributions/invalid')
      .set('Authorization', `Bearer ${TEST_TOKEN_1}`);
    expect(resp.status).toBe(400);
  });

  it('should return the deleted distribution', async () => {
    plans = await Plans.find({});
    const plan_id = plans[0]._id;
    const dist_id = plans[0].distribution_ids[0];
    const resp = await request
      .delete('/api/distributions/' + dist_id)
      .set('Authorization', `Bearer ${TEST_TOKEN_2}`);
    expect(resp.status).toBe(403);
  });
});

const data = { test: true };
