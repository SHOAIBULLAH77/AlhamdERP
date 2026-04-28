const express = require('express');
const router = express.Router();

const {
  getAllProfiles,
  getProfileById,
  updateProfile
} = require('../controllers/profileController');

router.get('/', getAllProfiles);
router.get('/:id', getProfileById);
router.put('/:id', updateProfile);

module.exports = router;
