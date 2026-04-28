# Alhamd ERP - Critical Fixes Required

## Quick Fix Guide - Implement These 5 Fixes

---

## 🔴 FIX #1: Create Missing Auth Endpoint (CRITICAL)

**Problem**: Frontend calls `GET /api/auth/me` but endpoint doesn't exist

**Frontend Expectation** (`Frontend/src/hooks/useAuth.tsx` line 41):
```typescript
const { data, error } = await authService.getMe();
// Calls: GET /api/auth/me
// Expects: { role, user metadata }
```

**Backend Solution**: 

### Step 1: Create Auth Controller
**File**: `backend/controllers/authController.js` (NEW FILE)
```javascript
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
```

### Step 2: Create Auth Routes
**File**: `backend/routes/authRoutes.js` (NEW FILE)
```javascript
const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/authController');

router.get('/me', getMe);

module.exports = router;
```

### Step 3: Mount Route in Server
**File**: `backend/server.js` - Add this line after existing routes:
```javascript
app.use('/api/auth', require('./routes/authRoutes'));
```

**Full updated server.js excerpt**:
```javascript
// Routes
app.use('/api/auth', require('./routes/authRoutes'));  // ← ADD THIS LINE
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
// ... rest of routes
```

**✅ RESULT**: `GET /api/auth/me` will now work correctly

---

## 🔴 FIX #2: Expose Stock Logs Route (CRITICAL)

**Problem**: Frontend calls `POST /api/stock_logs` but route is not exposed

**Frontend Expectation** (`Frontend/src/pages/Materials.tsx` line 75):
```typescript
await materialService.addStock(showStock.id, projectId, type, qty, note);
// Calls: POST /api/stock_logs
// Body: { material_id, project_id, type, quantity, note }
```

**Backend Solution**:

### Step 1: Update Material Routes
**File**: `backend/routes/materialRoutes.js` - Replace entire file:
```javascript
const express = require('express');
const router = express.Router();

const {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addStockLog  // ← ADD THIS IMPORT
} = require('../controllers/materialController');

router.get('/', getAllMaterials);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

// ← ADD STOCK LOGS ROUTE
router.post('/logs', addStockLog);

module.exports = router;
```

**✓ But wait** - The frontend calls `POST /api/stock_logs`, NOT `/api/materials/logs`

### Step 2: Mount Stock Logs Separately in Server
**File**: `backend/server.js` - Add a new route mount:
```javascript
// Add this line with the other route mounts (around line 12)
app.use('/api/stock_logs', require('./routes/stockLogsRoutes'));
```

### Step 3: Create Stock Logs Routes File
**File**: `backend/routes/stockLogsRoutes.js` (NEW FILE)
```javascript
const express = require('express');
const router = express.Router();

const { addStockLog } = require('../controllers/materialController');

router.post('/', addStockLog);

module.exports = router;
```

**✅ RESULT**: `POST /api/stock_logs` will now work correctly

---

## 🔴 FIX #3: Fix Attendance Date Field Mismatch (CRITICAL)

**Problem**: Frontend sends `attendance_date`, backend expects `date`

**Frontend** (`Frontend/src/pages/Attendance.tsx` line 44):
```typescript
const rows = employees.map(e => ({
  employee_id: e.id,
  attendance_date: date,  // ← SENDS THIS
  status: records[e.id] || 'absent',
}));
```

**Backend** (`backend/controllers/attendanceController.js` line 18):
```javascript
const { employee_id, date, status, note } = req.body;  // ← EXPECTS THIS
```

**Solution - Update Backend Controller**:

**File**: `backend/controllers/attendanceController.js` - Update upsertAttendance function:
```javascript
const supabase = require('../config/supabaseClient');

const getAttendance = async (req, res) => {
  const { date, month } = req.query;
  let query = supabase.from('attendance').select('*, employees(name)');

  if (date) {
    query = query.eq('attendance_date', date);  // ← CHANGE: use 'attendance_date'
  } else if (month) {
    query = query.gte('attendance_date', `${month}-01`).lte('attendance_date', `${month}-31`);  // ← CHANGE
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
  const attendanceDate = attendance_date || date;  // ← ACCEPT BOTH
  
  const { data, error } = await supabase
    .from('attendance')
    .upsert(
      { 
        employee_id, 
        attendance_date: attendanceDate,  // ← STANDARDIZE TO THIS
        status, 
        note 
      }, 
      { onConflict: 'employee_id,attendance_date' }  // ← STANDARDIZE CONFLICT
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
```

**✅ RESULT**: Attendance will save correctly with proper field names

---

## 🔴 FIX #4: Fix Dashboard Stats (CRITICAL)

**Problem**: Frontend expects `activeProjects` and `lowStockAlerts`, backend doesn't provide them

**Frontend Expectation** (`Frontend/src/pages/Dashboard.tsx` line 26):
```typescript
const [stats, setStats] = useState<any>(null);
// Later uses: stats.activeProjects, stats.lowStockAlerts
<KpiCard title="Total Projects" value={stats?.totalProjects ?? 0} 
         sub={`${stats?.activeProjects ?? 0} active`} />
// and
{stats?.lowStockAlerts?.length > 0 && (
  <div>Low Stock: {stats.lowStockAlerts.map(...)}</div>
)}
```

**Backend Current** (`backend/controllers/dashboardController.js`):
```javascript
// Returns: { totalProjects, totalEmployees, totalExpenses, totalIncome, netProfit }
// Missing: activeProjects, lowStockAlerts
```

**Solution - Update Dashboard Controller**:

**File**: `backend/controllers/dashboardController.js` - Replace entire file:
```javascript
const supabase = require('../config/supabaseClient');

const getStats = async (req, res) => {
  try {
    // Fetch all required data in parallel
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
        activeProjects: activeProjects,  // ← NEW
        totalEmployees: employeeCount || 0,
        totalExpenses,
        totalIncome,
        profitLoss: totalIncome - totalExpenses,
        lowStockAlerts: lowStockAlerts.map(m => ({  // ← NEW
          id: m.id,
          name: m.name,
          current_stock: m.current_stock,
          min_stock_level: m.min_stock_level,
          unit: m.unit
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getStats };
```

**✅ RESULT**: Dashboard will display correct stats with active projects and low stock alerts

---

## 🔴 FIX #5: Implement Document Upload (CRITICAL)

**Problem**: Document upload returns error placeholder instead of real implementation

**Frontend** (`Frontend/src/pages/Documents.tsx` line 40):
```typescript
async function handleUpload(ev: React.ChangeEvent<HTMLInputElement>) {
  const file = ev.target.files?.[0];
  if (!file || !user) return;
  setUploading(true);
  await documentService.upload(file, selectedProject, user.id);  // ← CALLS THIS
  setUploading(false);
}
```

**Service** (`Frontend/src/services/supabaseService.ts` line 290):
```typescript
upload: async (file: File, projectId: string, userId: string) => {
   return { error: 'Backend file upload not yet implemented' };  // ← BROKEN
}
```

**Solution**:

### Step 1: Install Multer
```bash
cd backend
npm install multer
```

### Step 2: Create Document Upload Controller
**File**: `backend/controllers/documentController.js` - Update with upload:
```javascript
const supabase = require('../config/supabaseClient');

const getAllDocuments = async (req, res) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*, projects(name, client_name)')
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
```

### Step 3: Update Document Routes
**File**: `backend/routes/documentRoutes.js` - Replace entire file:
```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  getAllDocuments,
  uploadDocument,
  deleteDocument
} = require('../controllers/documentController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                     'application/vnd.ms-excel',
                     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.get('/', getAllDocuments);
router.post('/upload', upload.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
```

### Step 4: Update Frontend Service
**File**: `Frontend/src/services/supabaseService.ts` - Update documentService:
```typescript
export const documentService = {
  getAll: async () => {
    try {
      const res = await api.get('/documents');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  upload: async (file: File, projectId: string, userId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      formData.append('user_id', userId);
      
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/documents/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};
```

**✅ RESULT**: Document uploads will work correctly

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Create `backend/controllers/authController.js`
- [ ] Create `backend/routes/authRoutes.js`
- [ ] Add auth route to `backend/server.js`
- [ ] Create `backend/routes/stockLogsRoutes.js`
- [ ] Add stock logs route to `backend/server.js`
- [ ] Update `backend/controllers/attendanceController.js`
- [ ] Update `backend/controllers/dashboardController.js`
- [ ] Update `backend/controllers/documentController.js`
- [ ] Update `backend/routes/documentRoutes.js`
- [ ] Update `backend/routes/materialRoutes.js`
- [ ] Run `npm install multer` in backend
- [ ] Update `Frontend/src/services/supabaseService.ts`
- [ ] Test all fixes locally
- [ ] Deploy changes

---

## 🧪 TESTING COMMANDS

```bash
# Test auth endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN"

# Test stock logs
curl -X POST http://localhost:5000/api/stock_logs \
  -H "Content-Type: application/json" \
  -d '{
    "material_id": "1",
    "project_id": "2",
    "type": "in",
    "quantity": 100,
    "note": "Initial stock"
  }'

# Test dashboard stats
curl -X GET http://localhost:5000/api/dashboard/stats

# Test document upload
curl -X POST http://localhost:5000/api/documents/upload \
  -F "file=@/path/to/file.pdf" \
  -F "project_id=1" \
  -F "user_id=user-uuid"
```

---

**Total Implementation Time**: ~90 minutes  
**Difficulty**: Easy to Medium  
**Priority**: CRITICAL - Do these first before any deployment
