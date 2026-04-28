const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/authController');

router.get('/me', getMe);

module.exports = router;
