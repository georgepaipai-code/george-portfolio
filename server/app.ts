import express from "express";
import cors from "cors";
import { logger } from "./lib/logger.js";
import apiRouter from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use((req, _res, next) => {
    logger.info({ method: req.method, url: req.url }, "request");
    next();
  });

  app.use("/api", apiRouter);

  return app;
}
