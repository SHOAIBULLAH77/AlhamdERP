// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));
// app.use(express.json());

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/stock_logs', require('./routes/stockLogsRoutes'));
// app.use('/api/projects', require('./routes/projectRoutes'));
// app.use('/api/employees', require('./routes/employeeRoutes'));
// app.use('/api/expenses', require('./routes/financeRoutes').expenseRouter);
// app.use('/api/income', require('./routes/financeRoutes').incomeRouter);
// app.use('/api/materials', require('./routes/materialRoutes'));
// app.use('/api/attendance', require('./routes/attendanceRoutes'));
// app.use('/api/invoices', require('./routes/invoiceRoutes'));
// app.use('/api/dashboard', require('./routes/dashboardRoutes'));
// app.use('/api/profiles', require('./routes/profileRoutes'));
// app.use('/api/project_assignments', require('./routes/assignmentRoutes'));
// app.use('/api/documents', require('./routes/documentRoutes'));

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: "OK", time: new Date() });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ message: "Server Error" });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
 origin: true,
 credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('../backend/routes/authRoutes'));
app.use('/api/stock_logs', require('../backend/routes/stockLogsRoutes'));
app.use('/api/projects', require('../backend/routes/projectRoutes'));
app.use('/api/employees', require('../backend/routes/employeeRoutes'));
app.use('/api/expenses', require('../backend/routes/financeRoutes').expenseRouter);
app.use('/api/income', require('../backend/routes/financeRoutes').incomeRouter);
app.use('/api/materials', require('../backend/routes/materialRoutes'));
app.use('/api/attendance', require('../backend/routes/attendanceRoutes'));
app.use('/api/invoices', require('../backend/routes/invoiceRoutes'));
app.use('/api/dashboard', require('../backend/routes/dashboardRoutes'));
app.use('/api/profiles', require('../backend/routes/profileRoutes'));
app.use('/api/project_assignments', require('../backend/routes/assignmentRoutes'));
app.use('/api/documents', require('../backend/routes/documentRoutes'));

app.get('/health',(req,res)=>{
 res.json({status:"OK"});
});

module.exports = app;