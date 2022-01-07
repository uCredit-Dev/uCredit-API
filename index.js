const db = require("./data/db.js");
const createApp = require('./app')
const port = process.env.PORT || 4567;

//launch api
db.connect();
const app = createApp();
app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});
