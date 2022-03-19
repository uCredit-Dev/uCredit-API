# uCredit-API

To run program:

```
docker-compose build && docker-compose up
```

If run locally, the default port is 4567 and Mongodb port is 27017.

API routes saved in ./routes
Mongoose Schema saved in ./model
Database connection made in ./data/db.js

## Ingesting SIS Courses into the Local DB

1. Attach a shell to the web docker container.
2. Navigate to `/code/data`.
3. Run `node cacheSISCoursesWithVersions.js`

You can see the contents of your local database in MongoDBCompass. 

The URL is `mongodb://localhost:27017/debug`.