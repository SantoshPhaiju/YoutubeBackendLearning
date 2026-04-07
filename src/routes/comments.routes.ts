import { Router } from 'express';
import verifyJWT, { optionalVerifyJWT } from '../middlewares/auth.middleware';
import {
    getCommentReplies,
    replyToComment,
} from '../controllers/comments.controller';

const router = Router();

router.route("/:commentId/reply").post(verifyJWT, replyToComment);
router.route("/:commentId/replies").get(optionalVerifyJWT, getCommentReplies);

export default router;
