import { body } from 'express-validator';

export const uploadVideoValidator = () => {
    return [
        body('title')
            .isString()
            .trim()
            .isLength({ min: 3, max: 80 })
            .withMessage('Username must be between 3 and 80 characters'),
        body('description')
            .isString()
            .isLength({ max: 2000 })
            .withMessage('Description must not be more than 2000 characters'),
        body('visibility')
            .isString()
            .trim()
            .toLowerCase()
            .isIn(['public', 'private'])
            .withMessage('Visibility must be either public or private'),
    ];
};
