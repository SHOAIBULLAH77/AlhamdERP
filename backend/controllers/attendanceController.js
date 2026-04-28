const supabase = require('../config/supabaseClient');

const getAttendance = async (req, res) => {
  const { date, month } = req.query;
  let query = supabase.from('attendance').select('*, employees(name)');

  if (date) {
    query = query.eq('attendance_date', date);
  } else if (month) {
    // Assuming month format YYYY-MM
    query = query.gte('attendance_date', `${month}-01`).lte('attendance_date', `${month}-31`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

const upsertAttendance = async (req, res) => {
  // Handle both 'date' and 'attendance_date' for compatibility
  const { employee_id, attendance_date, date, status, note } = req.body;
  const attendanceDate = attendance_date || date;
  
  const { data, error } = await supabase
    .from('attendance')
    .upsert(
      { 
        employee_id, 
        attendance_date: attendanceDate, 
        status, 
        note 
      }, 
      { onConflict: 'employee_id,attendance_date' }
    )
    .select();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, data: data[0] });
};

module.exports = {
  getAttendance,
  upsertAttendance
};
