import { Router } from 'express';
import {
    getSubscribedChannels,
    subscribeChannel,
} from '../controllers/subscription.controller';
import verifyJWT from '../middlewares/auth.middleware';

const router = Router();

router.route('/subscribe/:channel_id').post(verifyJWT, subscribeChannel);
router.route('/get-subscribed-channels').get(verifyJWT, getSubscribedChannels);

export default router;
