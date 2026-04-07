import { Router } from 'express';
import {
    getHomePageVideos,
    getVideoById,
    trackVideoViews,
    uploadVideo,
} from '../controllers/video.controller';
import verifyJWT, { optionalVerifyJWT } from '../middlewares/auth.middleware';
import { handleValidationErrorsMiddleware } from '../middlewares/handleValidationErrors.middleware';
import { upload } from '../middlewares/multer.middleware';
import { uploadVideoValidator } from '../validators/uploadVideo.validator';
import { validateFileSizes } from '../middlewares/validateFileSizes.middleware';
import {
    addComment,
    getCommentsOfVideo,
} from '../controllers/comments.controller';

const router = Router();

router.route('/upload-video').post(
    upload.fields([
        { name: 'videoFile', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ]),
    validateFileSizes,
    verifyJWT,
    uploadVideoValidator(),
    handleValidationErrorsMiddleware,
    uploadVideo
);

router.route('/get-home-page-videos').get(getHomePageVideos);
router.route('/get-video/:videoId').get(optionalVerifyJWT, getVideoById);
router.route('/track-views/:videoId').patch(trackVideoViews);
router.route('/:videoId/comment').post(verifyJWT, addComment);
router.route('/:videoId/comments').get(optionalVerifyJWT, getCommentsOfVideo);

export default router;
