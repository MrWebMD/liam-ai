import fetch, { Response } from "node-fetch";

export const getVoiceAudioStream = (textToSay: string, callback: (response: Response) => void) => {
  const options = {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVEN_LABS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: process.env.ELEVEN_MODEL!,
      text: textToSay,
      optimize_streaming_latency: 3,
      voice_settings: { stability: 1, similarity_boost: 1 },
    }),
  };

  fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_VOICE_ID!}/stream`, options).then(callback);
};
