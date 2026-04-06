import { Router } from 'express';
import { addComment, addReply } from '../controllers/comments.controller';
import verifyJWT from '../middlewares/auth.middleware';

const router = Router();

router.route('/create-comment/:videoId').post(verifyJWT, addComment);
router.route('/add-reply/:videoId/:commentId').post(verifyJWT, addReply);

export default router;
