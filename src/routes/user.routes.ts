import { Router } from 'express';
import {
    loginUser,
    logoutUser,
    registerUser,
} from '../controllers/user.controller';
import verifyJWT from '../middlewares/auth.middleware';
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

router.route('/login').post(loginUser);

// protected routes
router.route('/logout').post(verifyJWT, logoutUser);

export default router;
