import { body } from 'express-validator';

export const uploadVideoValidator = () => {
    return [
        body('title')
            .isString()
            .notEmpty()
            .withMessage('Title is required')
            .bail()
            .isLength({ min: 3, max: 80 })
            .withMessage('Username must be between 3 and 80 characters'),
        body('description')
            .isString()
            .isLength({ min: 0, max: 2000 })
            .withMessage('Description must not be more than 2000 characters'),
        body('visibility')
            .notEmpty()
            .withMessage('Visibility should not be empty'),
    ];
};
