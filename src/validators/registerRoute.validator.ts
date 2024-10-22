import { body } from 'express-validator';

export const registerRouteValidator = () => {
    return [
        body('username')
            .isString()
            .trim()
            .toLowerCase()
            .isLength({ min: 3, max: 20 })
            .withMessage('Username must be between 3 and 20 characters'),
        body('fullname')
            .notEmpty()
            .trim()
            .isString()
            .withMessage('Fullname must be a string'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isString()
            .trim()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ];
};
