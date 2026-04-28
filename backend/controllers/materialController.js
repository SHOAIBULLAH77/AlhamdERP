const supabase = require('../config/supabaseClient');

const getAllMaterials = async (req, res) => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const createMaterial = async (req, res) => {
  const { data, error } = await supabase
    .from('materials')
    .insert([req.body])
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

const updateMaterial = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('materials')
    .update(req.body)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

const deleteMaterial = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, message: 'Material deleted successfully' });
};

const addStockLog = async (req, res) => {
  const { data, error } = await supabase
    .from('stock_logs')
    .insert([req.body])
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

module.exports = {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addStockLog
};
