import cors from "cors";
import helmet from "helmet"; //provide security enhancement
import morgan from "morgan"; //log http request history to terminal
import express from "express";
import courseRouter from "./routes/course.js";
import distributionRouter from "./routes/distribution.js";
import yearRouter from "./routes/year.js";
import planRouter from "./routes/plan.js";
import planReviwerRouter from "./routes/planReview.js";
import notificationRouter from "./routes/notification.js";
import userRouter from "./routes/user.js";
import majorRouter from "./routes/major.js";
import searchRouter from "./routes/search.js";
import ssoRouter from "./routes/sso.js";
import evalRouter from "./routes/evaluation.js";
import sisRouter from "./routes/sisData.js";
import experimentsRouter from "./routes/experiments.js";
import commentRouter from "./routes/comment.js";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

export default function createApp() {
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

  // error report
  Bugsnag.start({
    apiKey: process.env.BUGSNAG_API_KEY,
    plugins: [BugsnagPluginExpress],
  });

  Bugsnag.notify("lanching app");
  const middleware = Bugsnag.getPlugin("express");

  //use middleware functions
  app.use(middleware.requestHandler); //must keep as the first piece of middleware in the stack
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
  // This handles any errors that Express catches. This needs to go before other
  // error handlers. Bugsnag will call the `next` error handler if it exists.
  app.use(middleware.errorHandler);
  return app;
}
