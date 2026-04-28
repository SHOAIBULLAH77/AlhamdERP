const supabase = require('../config/supabaseClient');

const getAllInvoices = async (req, res) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, projects(name)')
    .order('date', { ascending: false });

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const createInvoice = async (req, res) => {
  const { data, error } = await supabase
    .from('invoices')
    .insert([req.body])
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

const updateInvoice = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('invoices')
    .update(req.body)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

const deleteInvoice = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, message: 'Invoice deleted successfully' });
};

module.exports = {
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
