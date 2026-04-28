const supabase = require('../config/supabaseClient');

// Expenses
const getAllExpenses = async (req, res) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const createExpense = async (req, res) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([req.body])
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, message: 'Expense deleted successfully' });
};

// Income
const getAllIncome = async (req, res) => {
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const createIncome = async (req, res) => {
  const { data, error } = await supabase
    .from('income')
    .insert([req.body])
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

const deleteIncome = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('income')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, message: 'Income deleted successfully' });
};

module.exports = {
  getAllExpenses,
  createExpense,
  deleteExpense,
  getAllIncome,
  createIncome,
  deleteIncome
};
