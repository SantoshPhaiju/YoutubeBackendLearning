import { Router } from 'express';
import { registerUser } from '../controllers/user.controller';
import { handleValidationErrors } from '../middlewares/handleValidationErrors';
import { upload } from '../middlewares/multer.middleware';
import { registerRouteValidator } from '../validators/registerRoute.validator';

const router = Router();

router.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]),
    registerRouteValidator(),
    handleValidationErrors,
    registerUser
);

export default router;
