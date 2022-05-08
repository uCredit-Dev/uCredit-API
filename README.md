# Matt and Brayden's STAD Submission
Please read or open up the STAD Project Submission pdf on your browser to read the details and instructions of all of our testing.
Alternatively, for a better viewing experience, you can go to this Google Drive Link: https://docs.google.com/document/d/1ienJd1hVtJws5pcoPwKkkFEEJ8L4Ux1cR6I8UMQAFPE/edit?usp=sharing

# uCredit-API

To run program from a fresh clone:

1. Create a `.env` file with the following content:

```
DEBUG=True
SIS_API_KEY=YOUR_API_KEY
```

2. Build docker:

```
docker-compose build && docker-compose up
```

If run locally, the default port is 4567 and Mongodb port is 27017.

API routes saved in ./routes
Mongoose Schema saved in ./model
Database connection made in ./data/db.js

## Ingesting SIS Courses into the Local DB

1. Attach a shell to the web docker container.
2. Run `node data/cacheSISCoursesWithVersions.js`

**WARNING:** Make sure you run in the `code/` directory; do not run the command in the
`code/data/` directory!

You can see the contents of your local database in MongoDBCompass. 

The URL is `mongodb://localhost:27017/debug`.