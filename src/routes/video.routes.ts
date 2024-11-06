import { Router } from 'express';
import { getVideoById, uploadVideo } from '../controllers/video.controller';
import verifyJWT from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/handleValidationErrors';
import { upload } from '../middlewares/multer.middleware';
import { uploadVideoValidator } from '../validators/uploadVideo.validator';

const router = Router();

router.route('/upload-video').post(
    upload.fields([
        { name: 'videoFile', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ]),
    verifyJWT,
    uploadVideoValidator(),
    handleValidationErrors,
    uploadVideo
);

router.route('/get-video/:videoId').get(getVideoById);
router.route('/get-protected-video/:videoId').get(verifyJWT, getVideoById);

export default router;
