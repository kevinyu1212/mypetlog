const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');

router.get('/logs', verifyToken, adminController.getAdminLogs);

module.exports = router;

router.put('/reports/:reportId', verifyToken, adminController.processReport);
