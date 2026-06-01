const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProfile, updateNickname, updateBirthdate,
  updatePassword, updateSecurity, deleteAccount
} = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.patch('/nickname', auth, updateNickname);
router.patch('/birthdate', auth, updateBirthdate);
router.patch('/password', auth, updatePassword);
router.patch('/security', auth, updateSecurity);
router.delete('/account', auth, deleteAccount);

module.exports = router;
