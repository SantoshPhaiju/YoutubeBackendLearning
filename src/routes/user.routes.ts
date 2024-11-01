import { Router } from 'express';
import {
    changeCurrentPassword,
    getUser,
    getUserChannelProfile,
    getWatchHistoryOfUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateCoverImage,
    updateUser,
    updateUserAvatar,
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

router.route('/me').get(verifyJWT, getUser);

router.route('/refresh-access-token').post(refreshAccessToken);

router.route('/change-password').patch(verifyJWT, changeCurrentPassword);

router.route('/update-details').patch(verifyJWT, updateUser);

router.route('/get-channel-data/:username').get(verifyJWT, getUserChannelProfile);

router
    .route('/update-user-avatar')
    .patch(verifyJWT, upload.single('avatar'), updateUserAvatar);

router
    .route('/update-user-cover-image')
    .patch(verifyJWT, upload.single('coverImage'), updateCoverImage);

router.route('/get-user-watch-history').get(verifyJWT, getWatchHistoryOfUser);

export default router;
