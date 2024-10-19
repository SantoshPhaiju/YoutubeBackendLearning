import { Router } from 'express';
import { body } from 'express-validator';
import { registerUser } from '../controllers/user.controller';
import { upload } from '../middlewares/multer.middleware';

const router = Router();

router.route('/register').post(
    body('usrname').isString().isLength({ min: 3, max: 20 }),
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]),
    registerUser
);

export default router;
