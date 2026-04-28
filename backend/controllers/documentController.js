const supabase = require('../config/supabaseClient');

const getAllDocuments = async (req, res) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*, projects(name)')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const { project_id, user_id } = req.body;
    const file = req.file;

    if (!project_id || !user_id) {
      return res.status(400).json({ success: false, error: 'Missing project_id or user_id' });
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`${project_id}/${fileName}`, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      return res.status(400).json({ success: false, error: uploadError.message });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(`${project_id}/${fileName}`);

    // Save document record to database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert([{
        name: file.originalname,
        project_id,
        user_id,
        url: publicUrl,
        file_type: file.mimetype,
        file_size: file.size
      }])
      .select();

    if (docError) {
      return res.status(400).json({ success: false, error: docError.message });
    }

    res.json({ success: true, data: docData[0] });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, message: 'Document deleted successfully' });
};

module.exports = {
  getAllDocuments,
  uploadDocument,
  deleteDocument
};
