import { Router } from 'express';
import { toggleLike } from '../controllers/like.controller';
import verifyJWT from '../middlewares/auth.middleware';

const router = Router();

// all the routes related to likes are protected routes

// * LIKE A VIDEO
router.route('/like-video/:videoId').post(verifyJWT, toggleLike);

// * LIKE A COMMENT
router.route('/like-comment/:commentId').post(verifyJWT, toggleLike);

export default router;
