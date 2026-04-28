const supabase = require('../config/supabaseClient');

const getAllProfiles = async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const getProfileById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('profiles')
    .update(req.body)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

module.exports = {
  getAllProfiles,
  getProfileById,
  updateProfile
};
