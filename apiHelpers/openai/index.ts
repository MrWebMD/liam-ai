/**
 * OpenAI initialization
 */
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getAiResponse = (aiprompt: string, userPrompt: string) => {
  return openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: aiprompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
};
