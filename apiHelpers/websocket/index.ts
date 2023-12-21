import type { IncomingMessage } from "http";
import type { WebSocketServer, WebSocket } from "ws";
import ffmpeg from "fluent-ffmpeg";
import stream from "stream";
import { logger } from "../../utils/logger";
import { getVoiceAudioStream } from "../elevenLabs";

function mulawEncoder(chunk: Buffer | string, callback: (convertedChunk: Buffer) => void) {
  const convertedBufferStream: Buffer[] = [];

  const bufferStream = new stream.Readable({
    read() {
      this.push(chunk);
      this.push(null);
    },
  });
  ffmpeg({
    source: bufferStream,
  })
    .audioFrequency(8000)
    .toFormat("mulaw")
    .on("error", (err) => {
      console.error("FFmpeg error:", err.message);
    })
    .pipe()
    .on("data", (convertedChunk) => {
      convertedBufferStream.push(convertedChunk);
    })
    .on("end", () => {
      callback(Buffer.concat(convertedBufferStream));
    });
}

const handleStartEvent = (wss: WebSocketServer, ws: WebSocket, req: IncomingMessage, msg: any) => {
  const { aiResponseText } = msg.start.customParameters;
  const { callSid, streamSid } = msg.start;

  function sendMediaChunk(convertedChunk: Buffer | string, chunkIndex?: number) {
    /**
     * The final audio chunk must be transparted while base64 encoded.
     */
    if (typeof convertedChunk == "string") {
      convertedChunk = btoa(convertedChunk);
    } else {
      convertedChunk = convertedChunk.toString("base64");
    }
    console.log(chunkIndex);

    ws.send(
      JSON.stringify({
        event: "media",
        streamSid,
        sequenceNumber: "1",
        media: {
          track: "outbound",
          chunk: chunkIndex + "",
          payload: convertedChunk,
        },
      })
    );
  }

  function convertAndSendChunk(chunkBuffer, chunkIndex) {
    mulawEncoder(Buffer.concat(chunkBuffer), (convertedChunk) => {
      sendMediaChunk(convertedChunk, chunkIndex);
    });
  }

  getVoiceAudioStream(aiResponseText, (response) => {
    logger.info("Waiting on first chunk from audio stream");

    if (!response.body) throw new Error("Invalid response body");

    let chunkBuffer = [];

    let chunkIndex = 0;

    response.body.on("data", (chunk) => {
      /**
       * When stream mode is disabled, all chunks will be collected until the stream ends,
       * then sent together.
       */
      if (process.env.STREAM_MODE == "false") {
        chunkBuffer.push(chunk);
        return;
      }

      /**
       * When stream mode is enabled, chunks are sent 60 at a time until the stream ends.
       */

      chunkBuffer.push(chunk);

      if (chunkBuffer.length < 60) return;

      chunkIndex++;

      logger.info(`Sending ${chunkBuffer.length} new chunks`);

      convertAndSendChunk(chunkBuffer, chunkIndex);

      chunkBuffer = [];
    });

    response.body.on("end", async () => {
      chunkIndex++;
      convertAndSendChunk(chunkBuffer, chunkIndex);
    });
  });
};

const handleWebSocketConnection = (wss: WebSocketServer, ws: WebSocket, req: IncomingMessage) => {
  logger.info("New Connection");

  setTimeout(() => {
    ws.close();
  }, 1000 * 60);

  ws.on("message", async (message) => {
    const msg = JSON.parse(message.toString());

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
