const { body, validationResult, matchedData } = require('express-validator');

const VALID_NAME_REGEX = /(?=.*[\W\d\s])/;
const VALID_PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;

const validationRules = () => {
  return [
    body('user.email')
      .trim()
      .exists({ checkNull: true, checkFalsy: true }).withMessage('Email is required')
      .bail()
      .isEmail().withMessage('Email must be a valid email address'),
    body('user.password')
      .trim()
      .exists({ checkNull: true, checkFalsy: true }).withMessage('Password is required')
      .bail()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .bail()
      .custom((value) => {
        if (!value.match(VALID_PASSWORD_REGEX)) {
          throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        }
        return true;
      }),
  ];
};

const validate = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (validationErrors.isEmpty()) {
    req.params = matchedData(req);
    return next();
  }

  const errors = {};

  validationErrors.array().map((error) => { errors[error.path] = error.msg; });

  return res.status(422).json({ errors });
};

module.exports = {
  validationRules,
  validate
}