import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { subscribeChannel } from "../controllers/subscription.controller";

const router = Router();

router.route('/subscribe/:channel_id').post(verifyJWT, subscribeChannel);

export default router;
