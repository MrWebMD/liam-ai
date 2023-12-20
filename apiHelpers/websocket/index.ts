import type { IncomingMessage } from "http";
import type { WebSocketServer, WebSocket } from "ws";
import ffmpeg from "fluent-ffmpeg";
import stream from "stream";
import { logger } from "../../utils/logger";
import { getVoiceAudioStream } from "../elevenLabs";

const Twilio = require("twilio");

const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function mulawEncoder(chunk: Buffer | string, callback: (convertedChunk: Buffer) => void) {
  // https://stackoverflow.com/questions/45751202/how-can-i-play-an-audio-file-while-converting-it-with-ffmpeg-in-node-js

  const bufferStream = new stream.Readable({
    read() {
      this.push(chunk);
      this.push(null);
    },
  });
  ffmpeg({
    source: bufferStream,
  })
    // .inputFormat("wav")
    .audioFrequency(8000)
    // .audioCodec("pcm_mulaw")
    .toFormat("mulaw")
    .on("error", (err) => {
      console.error("FFmpeg error:", err.message);
    })
    .pipe()
    .on("data", callback);
}

const handleStartEvent = (wss: WebSocketServer, ws: WebSocket, req: IncomingMessage, msg: any) => {
  logger.info("Start");
  // logger.info(msg);

  const { aiResponseText } = msg.start.customParameters;
  const { callSid, streamSid } = msg.start;

  function sendMediaChunk(convertedChunk: Buffer | string) {
    /**
     * The final audio chunk must be transparted while base64 encoded.
     */
    if (typeof convertedChunk == "string") {
      convertedChunk = btoa(convertedChunk);
    } else {
      convertedChunk = convertedChunk.toString("base64");
    }

    ws.send(
      JSON.stringify({
        event: "media",
        streamSid,
        media: {
          payload: convertedChunk,
        },
      })
    );
  }

  getVoiceAudioStream(aiResponseText, (response) => {
    if (!response.body) throw new Error("Invalid response body");

    let chunkBuffer = [];

    let chunkIndex = 0;

    response.body.on("end", async () => {
      if (chunkBuffer.length > 0) {
        let convertedChunk: Buffer = await new Promise((resolve) => {
          mulawEncoder(Buffer.concat(chunkBuffer), (convertedChunk) => {
            resolve(convertedChunk);
          });
        });

        sendMediaChunk(convertedChunk);
        logger.info("Sending final chunks");
        chunkBuffer = [];
      }
      logger.info("Stream ending mark has been set");
    });

    response.body.on("data", (chunk) => {
      chunkIndex++;
      logger.info("New chunk " + chunkIndex);

      chunkBuffer.push(chunk);

      if (chunkIndex % 60 != 0) return;

      mulawEncoder(Buffer.concat(chunkBuffer), (convertedChunk) => {
        sendMediaChunk(convertedChunk);
      });
      chunkBuffer = [];
    });
  });
};

const handleWebSocketConnection = (wss: WebSocketServer, ws: WebSocket, req: IncomingMessage) => {
  logger.info("New Connection");

  // logger.info(`Recording Call - ${request.body["Caller"]}`);

  // setTimeout(() => {
  //   twilioClient
  //     .calls(req.body["CallSid"])
  //     .recordings.create({ recordingTrack: "dual" })
  //     .then((recording) => logger.info(`Recording Started - ${request.body["caller"]} SID:${recording.sid}`));
  // }, 1000);

  ws.on("message", async (message) => {
    const msg = JSON.parse(message.toString());

    setTimeout(() => {
      ws.close();
    }, 1000 * 50);

    switch (msg.event) {
      case "mark":
        logger.info(msg);
        // if (msg.mark.name == "stream end") {
        //   logger.info("Audio stream ended");
        //   ws.close();
        // }
        break;
      case "start":
        handleStartEvent(wss, ws, req, msg);
        break;
    }
  });
};

export default handleWebSocketConnection;
