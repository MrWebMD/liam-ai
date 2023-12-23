import { Request, Response } from "express-serve-static-core";
import { logger } from "../utils/logger";
import { personLookup } from "../apiHelpers/endato";
import { getAiResponse } from "../apiHelpers/openai";
import fs from "fs";
import Twilio from "twilio";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getVoiceAudioStream } from "../apiHelpers/elevenLabs";

const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const personToString = (person: Person) => {
  return `name: ${person.name.firstName} ${person.name.lastName},
    age: ${person.age},
    date of birth: ${person.dob},
    address history: 
    ${person.addresses
      .map((a) => a.fullAddress)
      .join("\n,")
      .replace(/[0-9]{5}-[0-9]{4}|[0-9]{5}/g, "")}
    relatives: ${person.relativesSummary
      ?.slice(0, 4)
      .map((r) => r.firstName + " " + r.lastName)
      .join(", ")}
    `;
};

export const voiceController = async (req: Request, res: Response) => {
  const requestBody = req.body as TwilioVoiceWebhookBody;

  /**
   * Find out more information about the caller
   */
  const { Caller: phone, CallerCity: city, CallerState: state, CallSid, CallStatus: callStatus, SpeechResult: userVoiceTranscription } = requestBody;

  logger.info(`Incoming Call - ${phone} ${city} ${state}`);

  let lookupData: PersonSearchResponse;

  try {
    lookupData = await personLookup(phone, city, state);
  } catch (err) {
    logger.error(`Could not fetch information about caller ${phone}`);
    logger.error(err);
  }

  let person = lookupData?.persons.length > 0 ? lookupData.persons[0] : null;

  if (!person) {
    logger.info(`Caller ${phone} could not be found with public records`);
  }

  /**
   * If more information is provided, then include it with a prompt that will be given to
   * an OpenAI model.
   */

  /**
   * This means this caller is calling for the first time,
   */

  let aiPrompt = "";
  let userPrompt = "";

  if (callStatus == "ringing" && !userVoiceTranscription) {
    aiPrompt = "Use the following information to perform a menacing liam neeson impression. You are on the phone and you are the only person speaking. Provide a 150 word or less response with the following information included.\n";

    if (person) {
      userPrompt += "List at list 1 relatives name if you have it. Tell the person their address and age if you have it.";

      userPrompt += personToString(person);
    }
  }
  if (callStatus == "in-progress" && userVoiceTranscription) {
    /**
     * This caller is in the middle of a phone call and has said something to the AI.
     */

    aiPrompt = "You are liam neeson and are responding to the following statement from the person you're talking to. Give a 75 word or less response. You know the following information:\n";

    if (person) {
      userPrompt += personToString(person) + "\n";

      userPrompt += "The person you're on the phone call with says: " + userVoiceTranscription;
      logger.info("The person on the phone says: " + userVoiceTranscription);
    }
  }

  const callData = await twilioClient
    .calls(CallSid)
    .fetch()
    .then((call) => call);

  let callDurationInSeconds = (Date.now() - new Date(callData.startTime).getTime()) / 1000;

  let hangUpCall = callDurationInSeconds > parseInt(process.env.MAX_CALL_DURATION_SEC!);

  if (hangUpCall) {
    aiPrompt = "Make sure to say good bye after you finish talking. " + aiPrompt;
    logger.info("Current call duration is greater than 20 seconds");
  }

  logger.info(`AI Prompt for ${phone},`);
  logger.info("AI: " + aiPrompt);
  logger.info("User: " + userPrompt);

  logger.info(`Generating AI response for ${phone}`);

  /**
   * Get a response from OpenAI with a paragraph of writing in an impression of Liam Neeson
   */

  // const aiResponse = { choices: [{ message: { content:"I can't sing, but I can certainly help you with song lyrics, song recommendations, or information about music. If you have a specific song in mind or a theme you're interested in, let me know and I'll do my best to assist!" } }] };
  const aiResponse = await getAiResponse(aiPrompt, userPrompt);

  let textToSay = aiResponse.choices[0].message.content;

  logger.info(`AI Response for ${phone} : ${textToSay}`);

  if (!userVoiceTranscription) {
    textToSay = "This call is being recorded. " + textToSay;
  }

  let voiceResponse = await getVoiceAudioStream(textToSay);

  let fileContents = Buffer.from(await voiceResponse.arrayBuffer());

  let fileName = uuidv4() + ".mp3";

  fs.writeFileSync(path.join(__dirname, "../public/voice-responses", fileName), fileContents);
  const vres = new Twilio.twiml.VoiceResponse();

  vres.play(`https://${req.headers["host"]}/voice-responses/${fileName}`);

  if (hangUpCall) {
    logger.info(`Hanging up on caller ${phone}`);
    vres.hangup();
  } else {
    logger.info(`Waiting for response from ${phone}`);
    vres.gather({
      action: `https://${req.headers["host"]}${process.env.VOICE_ENDPOINT}`,
      method: "POST",
      input: ["speech"],
      timeout: 3,
      speechModel: "experimental_conversations",
    });
  }

  logger.info("twiml response " + vres.toString());

  res.set("Content-Type", "text/xml");
  res.send(vres.toString());

  if (process.env.RECORD == "true" && callStatus == "ringing") {
    logger.info(`Recording Call - ${req.body["Caller"]}`);
    setTimeout(() => {
      twilioClient
        .calls(req.body["CallSid"])
        .recordings.create({ recordingTrack: "dual" })
        .then((recording) => logger.info(`Recording Started - ${req.body["caller"]} SID:${recording.sid}`));
    }, 1000);
  }
};
