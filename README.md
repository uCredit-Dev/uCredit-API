# uCredit-API

To run program:
Step 1)npm i  
Step 2)node .
If run locally the default port is 4567.

API routes saved in ./routes
Mongoose Schema saved in ./model
Database connection made in ./data/db.js

## Testing

1. You must have a local mongodb server running, search up how to install it for your OS.
2. You can ensure you have it installed with `mongod --version`
3. If you try to run mongod, you will get an error saying there's no directory called
   `data/db`. Since that is an existing file in this project, I suggest creating a
   directory in the base directory called `testdb/`. I've added this to the .gitignore
   so you don't have to worry about committing it.
4. The command to run mongodb then becomes: `mongod --dbpath ./testdb`. You have to use
   `sudo`. You must keep the terminal you run this in active to keep the db connection
   alive.
5. You can now run the tests with `npm test` in a separate terminal.
