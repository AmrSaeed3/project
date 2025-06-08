const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');

exports.addAddressValidator = [
    check('coordinates')
        .notEmpty()
        .withMessage('Coordinates are required')
        .isArray()
        .withMessage('Coordinates must be an array [longitude, latitude]')
        .custom((value) => {
            if (value.length !== 2) {
                throw new Error('Coordinates must contain exactly 2 values [longitude, latitude]');
            }
            if (typeof value[0] !== 'number' || typeof value[1] !== 'number') {
                throw new Error('Coordinates must be numbers');
            }
            return true;
        }),
    
    check('formattedAddress')
        .notEmpty()
        .withMessage('Formatted address is required')
        .isString()
        .withMessage('Formatted address must be a string'),
    
    check('placeId')
        .optional()
        .isString()
        .withMessage('Place ID must be a string'),
    
    validatorMiddleware,
];

exports.updateAddressValidator = [
    check('coordinates')
        .optional()
        .isArray()
        .withMessage('Coordinates must be an array [longitude, latitude]')
        .custom((value) => {
            if (value.length !== 2) {
                throw new Error('Coordinates must contain exactly 2 values [longitude, latitude]');
            }
            if (typeof value[0] !== 'number' || typeof value[1] !== 'number') {
                throw new Error('Coordinates must be numbers');
            }
            return true;
        }),
    
    check('formattedAddress')
        .optional()
        .isString()
        .withMessage('Formatted address must be a string'),
    
    check('placeId')
        .optional()
        .isString()
        .withMessage('Place ID must be a string'),
    
    validatorMiddleware,
];
