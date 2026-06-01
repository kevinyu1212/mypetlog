const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProfile, updateNickname, updateProfileImage,
  updatePassword, updateSecurity, deleteAccount
} = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.patch('/nickname', auth, updateNickname);
router.patch('/profile-image', auth, (req, res, next) => {
  upload.single('profile_image')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, updateProfileImage);
router.patch('/password', auth, updatePassword);
router.patch('/security', auth, updateSecurity);
router.delete('/account', auth, deleteAccount);

module.exports = router;
