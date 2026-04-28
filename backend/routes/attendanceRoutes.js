const express = require('express');
const router = express.Router();

const {
  getAttendance,
  upsertAttendance
} = require('../controllers/attendanceController');

router.get('/', getAttendance);
router.post('/', upsertAttendance);

module.exports = router;
