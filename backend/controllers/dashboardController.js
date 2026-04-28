const supabase = require('../config/supabaseClient');

const getStats = async (req, res) => {
  try {
    const [
      { count: projectCount },
      { count: employeeCount },
      { data: projects },
      { data: expenses },
      { data: income },
      { data: materials }
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('employees').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('status'),
      supabase.from('expenses').select('amount'),
      supabase.from('income').select('amount'),
      supabase.from('materials').select('id, name, current_stock, min_stock_level, unit')
    ]);

    const totalExpenses = expenses?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const totalIncome = income?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    
    // Calculate active projects (status = 'active')
    const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
    
    // Find low stock materials
    const lowStockAlerts = materials?.filter(m => m.current_stock <= m.min_stock_level) || [];

    res.json({
      success: true,
      data: {
        totalProjects: projectCount || 0,
        activeProjects: activeProjects,
        totalEmployees: employeeCount || 0,
        totalExpenses,
        totalIncome,
        profitLoss: totalIncome - totalExpenses,
        lowStockAlerts: lowStockAlerts.map(m => ({
          id: m.id,
          name: m.name,
          current_stock: m.current_stock,
          min_stock_level: m.min_stock_level,
          unit: m.unit
        }))
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { getStats };
