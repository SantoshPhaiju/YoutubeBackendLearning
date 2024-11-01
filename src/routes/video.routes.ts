import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware';
import { subscribeChannel } from '../controllers/subscription.controller';
import { upload } from '../middlewares/multer.middleware';

const router = Router();

router.route('/uploadVideo').post(upload.single("video"), verifyJWT, subscribeChannel);

export default router;
