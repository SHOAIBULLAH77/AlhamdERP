const supabase = require('../config/supabaseClient');

const getMe = async (req, res) => {
  try {
    // Get the token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - first time user
      return res.status(400).json({ success: false, error: profileError.message });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'site_engineer',
        full_name: profile?.full_name || ''
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getMe };
