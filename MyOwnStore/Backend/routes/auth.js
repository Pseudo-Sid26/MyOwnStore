const express = require('express');
const router = express.Router();

// Import ALL controller functions
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// Import validation middleware
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} = require('../middleware/validation');

// Import auth middleware
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateProfileUpdate, updateProfile);
router.put('/change-password', protect, validatePasswordChange, changePassword);

module.exports = router;