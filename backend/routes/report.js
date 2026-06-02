const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, reportController.createReport);

module.exports = router;
