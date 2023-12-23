import dotenv from "dotenv";
import http from "http";

dotenv.config();

import express from "express";
import path from "path";
import { logger } from "./utils/logger";
import voice from "./routes/voice";

/**
 * Web server initialization
 */

const app = express();

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.disable("view cache");

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "voice-responses")));

app.get("/", async (req, res) => {
  res.render("pages/index", {
    ga4code: process.env.GA4_TRACKING_CODE!,
  });
});

app.use("/", voice.routes);

app.listen(process.env.PORT, () => {
  logger.info(`Listening on http://localhost:${process.env.PORT}`);
});
