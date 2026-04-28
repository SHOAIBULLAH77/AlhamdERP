const express = require('express');
const router = express.Router();

const {
  getAllExpenses,
  createExpense,
  deleteExpense,
  getAllIncome,
  createIncome,
  deleteIncome
} = require('../controllers/financeController');

// We'll split these in server.js or use specific sub-paths here
// The frontend calls /expenses and /income separately.
// For simplicity, I'll create two route files or handle both here and map them in server.js.
// Let's create two separate route files for clarity as per frontend service structure.

module.exports = {
  expenseRouter: (() => {
    const r = express.Router();
    r.get('/', getAllExpenses);
    r.post('/', createExpense);
    r.delete('/:id', deleteExpense);
    return r;
  })(),
  incomeRouter: (() => {
    const r = express.Router();
    r.get('/', getAllIncome);
    r.post('/', createIncome);
    r.delete('/:id', deleteIncome);
    return r;
  })()
};
