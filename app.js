const cors = require("cors");
const helmet = require("helmet"); //provide security enhancement
const morgan = require("morgan"); //log http request history to terminal
const express = require("express");
const app = express();
const courseRouter = require("./routes/course.js");
const distributionRouter = require("./routes/distribution.js");
const yearRouter = require("./routes/year.js");
const planRouter = require("./routes/plan.js");
const planReviwerRouter = require("./routes/planReview.js");
const notificationRouter = require("./routes/notification.js");
const userRouter = require("./routes/user.js");
const majorRouter = require("./routes/major.js");
const searchRouter = require("./routes/search.js");
const ssoRouter = require("./routes/sso.js");
const evalRouter = require("./routes/evaluation.js");
const sisRouter = require("./routes/sisData.js");
const experimentsRouter = require("./routes/experiments.js");
const commentRouter = require("./routes/comment.js");
const roadmapPlanRouter = require("./routes/roadmapPlan.js");

function createApp() {
  const corsOptions = {
    origin: [
      "http://localhost:3000",
      "https://ucredit.herokuapp.com",
      "https://ucredit.me",
      "http://127.0.0.1",
      "https://ucredit-frontend-typescript-local.vercel.app",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: true,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  //use middleware functions
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(courseRouter);
  app.use(distributionRouter);
  app.use(yearRouter);
  app.use(planRouter);
  app.use(planReviwerRouter);
  app.use(notificationRouter);
  app.use(ssoRouter);
  app.use(userRouter);
  app.use(majorRouter);
  app.use(searchRouter);
  app.use(evalRouter);
  app.use(sisRouter);
  app.use(experimentsRouter);
  app.use(commentRouter);
  app.use(roadmapPlanRouter);

  return app;
}

module.exports = createApp;
