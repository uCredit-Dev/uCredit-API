import mongoose from 'mongoose';
import supertest from 'supertest';
import createApp from '../../app';
import ExperimentDao from '../../data/ExperimentDao';
import User from '../../model/User';

const request = supertest(createApp());
const TEST_URI =
  process.env.TEST_URI || 'mongodb://localhost:27017/experiments';
mongoose.set('strictQuery', true);

const experiments = new ExperimentDao();
const endpoint = '/api/experiments';

describe('Test experiments endpoints', () => {
  describe(`Test ${endpoint} endpoints`, () => {
    const MARK_JHED = 'mtiavis1';
    const WILL_JHED = 'wtong10';
    const EMPTY_JHED = 'User1';
    const JUNK_JHED = 'njunk13';
    const EXPERIMENT_ONE = 'New UI';
    const EXPERIMENT_TWO = 'Golden Cover';
    const EXPERIMENT_THREE = 'Home Button';
    const MARK_ACTIVE = [EXPERIMENT_ONE, EXPERIMENT_THREE];
    const WILL_ACTIVE = [EXPERIMENT_ONE, EXPERIMENT_TWO];

    const setupFunc = async (done) => {
      //This will be slow, usually beforeAll, but need to reset experiments because post routes would affect other tests
      mongoose.connect(TEST_URI, {
        useNewUrlParser: true,
      });
      //Fake creation of 98 more users to use in post tests
      const samples = [];
      for (let i = 1; i <= 98; i++) {
        samples.push({ _id: `User${i}` });
      }
      samples.push({ _id: `mtiavis1` });
      samples.push({ _id: `wtong10` });
      await User.insertMany(samples);
      await experiments.create({
        name: EXPERIMENT_ONE,
        blacklist: [],
        active: [WILL_JHED, MARK_JHED],
      });

      await experiments.create({
        name: EXPERIMENT_TWO,
        blacklist: [MARK_JHED],
        active: [WILL_JHED],
      });

      await experiments.create({
        name: EXPERIMENT_THREE,
        blacklist: [WILL_JHED],
        active: [MARK_JHED],
      });
      done();
    };

    beforeEach((done) => {
      setupFunc(done);
    });

    afterEach(async () => {
      await mongoose.connection.db.dropDatabase();
    });

    afterAll(async () => {
      await mongoose.connection.close();
    });

    describe(`Test GET ${endpoint}/allExperiments`, () => {
      describe('Return 200 and experiment names for successful request', () => {
        test('Return status 200', async () => {
          const response = await request.get(`${endpoint}/allExperiments`);
          expect(response.status).toBe(200);
        });

        test('Return all experiment names except White List', async () => {
          const response = await request.get(`${endpoint}/allExperiments`);
          expect(response.status).toBe(200);
          expect(response.body.data.length).toBe(3);
          for (const experimentName of response.body.data) {
            expect(experimentName).not.toBe('White List');
          }
        });
      });
    });

    describe(`Test GET ${endpoint}/:user_id`, () => {
      describe('Return 200 and experiment names for successful request', () => {
        test('Return experiment names for an existing user', async () => {
          const response = await request.get(`${endpoint}/${MARK_JHED}`);
          expect(response.status).toBe(200);
          expect(response.body.data.length).toBe(MARK_ACTIVE.length);
          for (const experimentName of response.body.data) {
            expect(MARK_ACTIVE.includes(experimentName)).toBe(true);
          }
        });

        test('Return empty array for user with no experiments', async () => {
          const response = await request.get(`${endpoint}/${EMPTY_JHED}`);
          expect(response.status).toBe(200);
          expect(response.body.data.length).toBe(0);
        });

        test('Return status 400 for invalid JHED', async () => {
          const response = await request.get(`${endpoint}/${JUNK_JHED}`);
          expect(response.status).toBe(400);
        });
      });
    });

    describe(`Test POST ${endpoint}/:experiment_name`, () => {
      describe('Return 200 and updated experiment', () => {
        test('Update Percentage of Experiment', async () => {
          const response = await request
            .post(`${endpoint}/${EXPERIMENT_THREE}`)
            .send({ percent_participating: 10 });
          expect(response.status).toBe(200);
          expect(response.body.data.percent_participating).toBe(10);
          expect(response.body.data.active.length).toBe(10);

          const secondResponse = await request
            .post(`${endpoint}/${EXPERIMENT_TWO}`)
            .send({ percent_participating: 50 });
          expect(secondResponse.status).toBe(200);
          expect(secondResponse.body.data.percent_participating).toBe(50);
          expect(secondResponse.body.data.active.length > 40).toBe(true);
        });
      });

      describe('Return 400 for invalid parameters', () => {
        test('No Percentage Given', async () => {
          const response = await request.post(
            `${endpoint}/${EXPERIMENT_THREE}`,
          );
          expect(response.status).toBe(400);
        });

        test('Attempt to update Whitelist percentage', async () => {
          const response = await request
            .post(`${endpoint}/White List`)
            .send({ percent_participating: 50 });
          expect(response.status).toBe(400);
        });

        test('Invalid Percentage Given', async () => {
          const response = await request
            .post(`${endpoint}/${EXPERIMENT_THREE}}`)
            .send({ percent_participating: -1 });
          expect(response.status).toBe(400);

          const responseTwo = await request
            .post(`${endpoint}/${EXPERIMENT_THREE}}`)
            .send({ percent_participating: 101 });
          expect(responseTwo.status).toBe(400);

          const responseThree = await request
            .post(`${endpoint}/${EXPERIMENT_THREE}}`)
            .send({ percent_participating: 'abs' });
          expect(responseThree.status).toBe(400);
        });
      });
    });

    describe(`Test GET ${endpoint}/percent/:experiment_name`, () => {
      describe('Return 200 and percentage of users participating in an experiment', () => {
        test('Return initial percentage of an experiment (0%)', async () => {
          const allExperiments = await request.get(
            `${endpoint}/allExperiments`,
          );
          // console.log(allExperiments.body.data);
          const response = await request.get(
            `${endpoint}/percent/${EXPERIMENT_ONE}`,
          );
          expect(response.status).toBe(200);
          expect(response.body).toBe(2);
        });

        test('Return status 400 when using an experiment that does not exist', async () => {
          const response = await request.get(
            `${endpoint}/percent/${JUNK_JHED}`,
          );
          expect(response.status).toBe(400);
        });

        test('Return percentage of an experiment after a post (must pass post tests first)', async () => {
          const allExperiments = await request.get(
            `${endpoint}/allExperiments`,
          );
          // console.log(allExperiments.body.data);
          const response = await request
            .post(`${endpoint}/${EXPERIMENT_ONE}`)
            .send({ percent_participating: 10 });
          expect(response.status).toBe(200);
          //does not need to be exactly 10 - it depends on how many users are in the database
          expect(response.body.data.percent_participating).toBe(10);

          const percentResponse = await request.get(
            `${endpoint}/percent/${EXPERIMENT_ONE}`,
          );
          expect(percentResponse.status).toBe(200);
          //does not need to be exactly 10 - it depends on how many users are in the database
          expect(percentResponse.body).toBe(10);
        });
      });
    });

    describe(`Test PUT ${endpoint}/add/:experiment_name`, () => {
      describe('Return 200 and updated experiment when adding user', () => {
        test('Adding User to Active', async () => {
          const response = await request
            .put(`${endpoint}/add/${EXPERIMENT_ONE}`)
            .send({ user_id: 'TestUser1' });
          expect(response.status).toBe(200);
          expect(response.body.data.active.length - 1).toBe(2);
        });

        test('Adding User on Blacklist to active', async () => {
          const response = await request
            .put(`${endpoint}/add/${EXPERIMENT_TWO}`)
            .send({ user_id: `${MARK_JHED}` });
          expect(response.status).toBe(200);
          expect(response.body.data.active.length - 1).toBe(1);
          expect(response.body.data.active.includes(MARK_JHED)).toBe(true);
          expect(response.body.data.blacklist.length).toBe(0);
        });
      });

      describe('Return 400 when given invalid parameters', () => {
        test('Adding User that does not exist', async () => {
          const response = await request.put(
            `${endpoint}/add/${EXPERIMENT_ONE}`,
          );
          expect(response.status).toBe(400);
        });
        test('Adding User that is guest user', async () => {
          const response = await request
            .put(`${endpoint}/add/${EXPERIMENT_ONE}`)
            .send({ user_id: 'guestUser' });
          expect(response.status).toBe(400);
        });

        test('Adding User to experiment that does not exist', async () => {
          const response = await request
            .put(`${endpoint}/add/${JUNK_JHED}`)
            .send({ user_id: `${JUNK_JHED}` });
          expect(response.status).toBe(400);
        });

        test('Adding User to experiment that they are already a part of', async () => {
          const response = await request
            .put(`${endpoint}/add/${EXPERIMENT_ONE}`)
            .send({ user_id: `${MARK_JHED}` });
          expect(response.status).toBe(400);
        });
      });
    });

    describe(`Test PUT ${endpoint}/delete/:experiment_name`, () => {
      describe('Return 200 and updated experiment when deleting user', () => {
        test('Deleting User from Active, add to blacklist', async () => {
          const response = await request
            .put(`${endpoint}/delete/${EXPERIMENT_ONE}`)
            .send({ user_id: `${WILL_JHED}` });
          expect(response.status).toBe(200);
          expect(response.body.data.active.length).toBe(1);
          expect(response.body.data.active.includes(WILL_JHED)).toBe(false);
          expect(response.body.data.blacklist.includes(WILL_JHED)).toBe(true);
        });
      });

      describe('Return 400 when given invalid parameters', () => {
        test('Deleting User that does not exist', async () => {
          const response = await request.put(
            `${endpoint}/delete/${EXPERIMENT_ONE}`,
          );
          expect(response.status).toBe(400);
        });
        test('Deleting User to experiment that does not exist', async () => {
          const response = await request
            .put(`${endpoint}/delete/${JUNK_JHED}`)
            .send({ user_id: `${JUNK_JHED}` });
          expect(response.status).toBe(400);
        });
        test('Deleting User with invalid JHED', async () => {
          const response = await request
            .put(`${endpoint}/delete/$%00`)
            .send({ user_id: null });
          expect(response.status).toBe(400);
        });

        test('Deleting User to experiment that they are already a part of in blacklist', async () => {
          await request
            .put(`${endpoint}/delete/${EXPERIMENT_ONE}`)
            .send({ user_id: `${MARK_JHED}` });

          const response = await request
            .put(`${endpoint}/delete/${EXPERIMENT_ONE}`)
            .send({ user_id: `${MARK_JHED}` });

          expect(response.status).toBe(400);
        });
      });
    });

    describe(`Test PUT ${endpoint}/changeName/:experiment_name`, () => {
      describe('Return 200 and updated experiment when changing name of experiment', () => {
        test('Change the name of an experiment', async () => {
          const response = await request
            .put(`${endpoint}/changeName/${EXPERIMENT_ONE}`)
            .send({ new_name: `New Experiment Name` });
          expect(response.status).toBe(200);
          expect(response.body.data.experimentName).toBe(`New Experiment Name`);
        });
      });

      describe('Return 400 when given invalid parameters', () => {
        test('Changing experiment name for experiment that does not exist', async () => {
          const response = await request
            .put(`${endpoint}/changeName/${JUNK_JHED}`)
            .send({ new_name: `${EXPERIMENT_ONE}` });
          expect(response.status).toBe(400);
        });

        test('Changing experiment name for invalid JHED', async () => {
          const response = await request
            .put(`${endpoint}/changeName/%00`)
            .send({ new_name: `${EXPERIMENT_ONE}` });
          expect(response.status).toBe(400);
        });

        test('Changing experiment name for invalid body', async () => {
          const response = await request.put(
            `${endpoint}/changeName/${JUNK_JHED}`,
          );
          expect(response.status).toBe(400);
        });
      });
    });

    describe(`Test DELETE ${endpoint}/:experiment_name`, () => {
      describe('Return 200 and deleted experiment', () => {
        test('Delete Experiment', async () => {
          const response = await request.delete(
            `${endpoint}/${EXPERIMENT_ONE}`,
          );
          expect(response.status).toBe(200);
          expect(response.body.data.experimentName).toBe(`${EXPERIMENT_ONE}`);
          expect(response.body.data.blacklist.length).toBe(0);
          expect(response.body.data.active.length).toBe(2);
        });
      });

      describe('Return 400 when given invalid parameters', () => {
        test('Attempting to delete experiment name that does not exist', async () => {
          const response = await request.delete(`${endpoint}/${JUNK_JHED}`);
          expect(response.status).toBe(400);
        });
        test('Attempting to delete experiment with invalid JHED ', async () => {
          const response = await request.delete(`${endpoint}/%00`);
          expect(response.status).toBe(400);
        });
      });
    });
  });
});
