const express = require('express');
const router = express.Router();

const { addStockLog } = require('../controllers/materialController');

router.post('/', addStockLog);

module.exports = router;
