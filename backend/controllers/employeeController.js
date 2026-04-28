const supabase = require('../config/supabaseClient');

const getAllEmployees = async (req, res) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const createEmployee = async (req, res) => {
  const { data, error } = await supabase
    .from('employees')
    .insert([req.body])
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('employees')
    .update(req.body)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, message: 'Employee deleted successfully' });
};

module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
