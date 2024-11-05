import { Router } from 'express';
import { uploadVideo } from '../controllers/video.controller';
import verifyJWT from '../middlewares/auth.middleware';
import { upload } from '../middlewares/multer.middleware';
import { uploadVideoValidator } from '../validators/uploadVideo.validator';
import { handleValidationErrors } from '../middlewares/handleValidationErrors';

const router = Router();

router.route('/upload-video').post(
    upload.fields([
        { name: 'videoFile', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ]),
    uploadVideoValidator(),
    handleValidationErrors,
    verifyJWT,
    uploadVideo
);

export default router;
