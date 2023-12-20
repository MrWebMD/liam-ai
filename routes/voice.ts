import Router from "express";

import { voiceController } from "../controllers/voice";

const router = Router();

router.post(process.env.VOICE_ENDPOINT!, voiceController);

export default {
  routes: router,
};
