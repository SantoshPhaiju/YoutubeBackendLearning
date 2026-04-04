import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware';
import { toggleLike } from '../controllers/like.controller';

const router = Router();

// all the routes related to likes are protected routes

// * LIKE A VIDEO
router.route('/like-video/:videoId').post(verifyJWT, toggleLike);

export default router;
