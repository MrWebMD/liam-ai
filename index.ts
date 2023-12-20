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

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  handleWebSocketConnection(wss, ws, req);
});

app.use("/", voice.routes);

server.listen(process.env.PORT, () => {
  logger.info(`Listening on http://localhost:${process.env.PORT}`);
});
