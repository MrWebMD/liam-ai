import { Request, Response } from "express-serve-static-core";
import { logger } from "../utils/logger";
import { personLookup } from "../apiHelpers/endato";
import { getAiResponse } from "../apiHelpers/openai";

import Twilio from "twilio";

const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const voiceController = async (req: Request, res: Response) => {
  const requestBody = req.body as TwilioVoiceWebhookBody;

  /**
   * Find out more information about the caller
   */
  const { Caller: phone, CallerCity: city, CallerState: state } = requestBody;

  logger.info(`Incoming Call - ${phone} ${city} ${state}`);

  let lookupData: PersonSearchResponse;

  try {
    lookupData = await personLookup(phone, city, state);
  } catch (err) {
    logger.error(`Could not fetch information about caller ${phone}`);
    logger.error(err);
  }

  let person = lookupData?.persons.length > 0 ? lookupData.persons[0] : null;

  /**
   * If more information is provided, then include it with a prompt that will be given to
   * an OpenAI model.
   */

  let aiprompt = "Use the following information to perform a menacing liam neeson impression. You are on the phone and you are the only person speaking. Provide a 75 word or less response with the following information.\n";

  let userPrompt = "";

  if (person) {
    userPrompt += "List at list 1 relatives name if you have it. Tell the person their address and age if you have it.";

    userPrompt += `name: ${person.name.firstName} ${person.name.lastName},
    age: ${person.age},
    date of birth: ${person.dob},
    address history: 
    ${person.addresses.map((a) => a.fullAddress).join("\n,")}
    relatives: ${person.relativesSummary
      ?.slice(0, 4)
      .map((r) => r.firstName + " " + r.lastName)
      .join(", ")}
    `;
  }

  logger.info(`Generating AI response for ${phone}`);

  /**
   * Get a response from OpenAI with a paragraph of writing in an impression of Liam Neeson
   */

  // const aiResponse = { choices: [{ message: { content:"I can't sing, but I can certainly help you with song lyrics, song recommendations, or information about music. If you have a specific song in mind or a theme you're interested in, let me know and I'll do my best to assist!" } }] };
  const aiResponse = await getAiResponse(aiprompt, userPrompt);

  const textToSay = "This call is being recorded. " + aiResponse.choices[0].message.content;

  /**
   * Create a bi-directional audio stream over web sockets.
   * The code below generates some XML special to Twilio that will make the Twilio
   * server connect back to this server with the intention to download a stream of audio.
   *
   * This audio will be the Voice of Liam Neeson as generated by ElevenLabs
   */
  const vres = new Twilio.twiml.VoiceResponse();
  const start = vres.connect();
  const stream = start.stream({
    url: `wss://${req.headers.host}/`,
  });

  stream.parameter({
    name: "aiResponseText",
    value: JSON.stringify(textToSay),
  });

  logger.info("twiml response " + vres.toString());

  res.set("Content-Type", "text/xml");
  res.send(vres.toString());

  logger.info(`Recording Call - ${req.body["Caller"]}`);

  setTimeout(() => {
    twilioClient
      .calls(req.body["CallSid"])
      .recordings.create({ recordingTrack: "dual" })
      .then((recording) => logger.info(`Recording Started - ${req.body["caller"]} SID:${recording.sid}`));
  }, 1000);
};
