import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware';
import { upload } from '../middlewares/multer.middleware';
import { uploadVideo } from '../controllers/video.controller';

const router = Router();

router.route('/upload-video').post(upload.single('video'), verifyJWT, uploadVideo);

export default router;
