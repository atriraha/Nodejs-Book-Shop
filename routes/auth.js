const express = require('express');

const { check, body, validationResult } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');


const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post(
  '/signup',
  [
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, { req }) => {
      if (value === 'test@test.com') {
        throw new Error('This email address if forbidden.');
      }
      return true;
    }),

    body('password','Please Enter password with atleast 5 characters.').isLength({min:5}) 
  ,
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords have to match!');
    }
    return true;
  })
],
authController.postSignup
);
  
router.post('/logout', authController.postLogout);

module.exports = router;