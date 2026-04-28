const supabase = require('../config/supabaseClient');

const getAllProjects = async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({
    success: true,
    data,
  });
};

const createProject = async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([req.body])
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({
    success: true,
    data: data[0],
  });
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('projects')
    .update(req.body)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({
    success: true,
    data: data[0],
  });
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
};

module.exports = { 
  getAllProjects,
  createProject,
  updateProject,
  deleteProject
};