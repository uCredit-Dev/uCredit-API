## uCredit-API

This is the backend for [uCredit](https://ucredit.me), 4-year course planning, streamlined. Deployed on [Render](render.com).

- Development deployment: https://ucredit-dev.onrender.com/
- Production deployment: https://ucredit-api.onrender.com/

Please allow a few seconds for the server to start up.

## Structure

- API routes saved in ./routes
- Mongoose Schema saved in ./model
- Tests saved in ./tests
- Database connection made in ./data/db.js

### Run locally

Pre-requisites: [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), [git](https://github.com/git-guides/install-git), [mongodb](https://www.mongodb.com/docs/manual/administration/install-community/)

1. Clone this repository.

```
git clone https://github.com/uCredit-Dev/uCredit-API.git
```

2. Install dependencies.

```
npm i
```

3. Create .env file at the root. Copy paste .env for development! (Ask a dev for access)

```
touch .env
```

4. Start server.

```
npm start
```

5. Navigate to http://localhost:4567/

### Run locally with docker

To run program from a fresh clone:

1. Update .env file with the following:

```
DEBUG=True
SIS_API_KEY=YOUR_API_KEY
```

2. Build docker:

```
docker-compose build && docker-compose up
```

3. Ingesting SIS Courses into the Local DB

```bash
# Attach a shell to the web docker container.
docker exec -it <container_name> bash                       # also possible in vscode

# run cache course script
# make sure to run in the code/ directory NOT code/data
node data/cacheSISCoursesWithVersions.js
```

View the contents of your local database in MongoDBCompass using the URI `mongodb://localhost:27017/debug`. Don't see it? You may have to [kill off existing processes at port 27017](https://stackoverflow.com/a/18706913).

### Testing

The ./tests/routes directory has test files for each of the API route files. Try running `npm test`!
