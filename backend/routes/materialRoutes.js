const express = require('express');
const router = express.Router();

const {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/materialController');

router.get('/', getAllMaterials);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;
