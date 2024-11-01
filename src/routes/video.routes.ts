import { Router } from 'express';
import { uploadVideo } from '../controllers/video.controller';
import verifyJWT from '../middlewares/auth.middleware';
import { upload } from '../middlewares/multer.middleware';

const router = Router();

router.route('/upload-video').post(
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
    ]),
    verifyJWT,
    uploadVideo
);

export default router;
