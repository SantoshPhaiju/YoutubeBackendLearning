import { Router } from 'express';
import { uploadVideo } from '../controllers/video.controller';
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

export default router;
