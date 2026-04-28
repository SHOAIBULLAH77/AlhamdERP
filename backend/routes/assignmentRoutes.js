const express = require('express');
const router = express.Router();

const {
  getAllAssignments,
  createAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');

router.get('/', getAllAssignments);
router.post('/', createAssignment);
router.delete('/:id', deleteAssignment);

module.exports = router;
