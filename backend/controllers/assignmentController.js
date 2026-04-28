const supabase = require('../config/supabaseClient');

const getAllAssignments = async (req, res) => {
  const { data, error } = await supabase
    .from('project_assignments')
    .select('*, projects(name), employees(name)');

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const createAssignment = async (req, res) => {
  const { data, error } = await supabase
    .from('project_assignments')
    .insert([req.body])
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('project_assignments')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, message: 'Assignment deleted successfully' });
};

module.exports = {
  getAllAssignments,
  createAssignment,
  deleteAssignment
};
