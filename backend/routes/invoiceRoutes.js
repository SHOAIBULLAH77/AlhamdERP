const express = require('express');
const router = express.Router();

const {
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

router.get('/', getAllInvoices);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
