const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  register, login, getMe,
  checkEmail, checkNickname,
  findEmail, getSecurityQuestion, resetPassword
} = require('../controllers/authController');

router.post('/check-email', checkEmail);
router.post('/check-nickname', checkNickname);
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/find-email', findEmail);
router.post('/security-question', getSecurityQuestion);
router.post('/reset-password', resetPassword);

module.exports = router;
