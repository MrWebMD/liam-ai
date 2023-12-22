import dotenv from "dotenv";
import http from "http";

dotenv.config();

import express from "express";
import WebSocket from "ws";
import path from "path";
import { logger } from "./utils/logger";
import voice from "./routes/voice";
import handleWebSocketConnection from "./apiHelpers/websocket";

/**
 * Web server initialization
 */

const app = express();

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.disable("view cache");

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  res.render("pages/index", {
    ga4code: process.env.GA4_TRACKING_CODE!,
  });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  handleWebSocketConnection(wss, ws, req);
});

app.use("/", voice.routes);

server.listen(process.env.PORT, () => {
  logger.info(`Listening on http://localhost:${process.env.PORT}`);
});
