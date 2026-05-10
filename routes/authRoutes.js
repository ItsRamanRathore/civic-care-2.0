const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/signup', [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  validate
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], authController.login);

router.post('/refresh', [
  body('token').notEmpty().withMessage('Refresh token is required'),
  validate
], authController.refreshToken);

// Protected routes
router.use(protect);
router.get('/me', authController.getMe);
router.get('/profile', authController.getProfile);
router.post('/logout', authController.revokeToken);
router.patch('/updateMe', authController.updateProfile);
router.patch('/preferences', authController.updatePreferences);

// Phase 3: MFA logic
router.post('/mfa/setup', authController.setupMFA);
router.post('/mfa/verify', authController.verifyMFA); // Single endpoint for setup check and login verification

module.exports = router;
