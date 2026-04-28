import api from './api';

// ── AUTH ─────────────────────────────────────────────────
export const authService = {
  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  }
};

// ── PROJECTS ─────────────────────────────────────────────
export const projectService = {
  getAll: async () => {
    try {
      const res = await api.get('/projects');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  create: async (data: any) => {
    try {
      const res = await api.post('/projects', data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  update: async (id: string, data: any) => {
    try {
      const res = await api.put(`/projects/${id}`, data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/projects/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};

// ── EMPLOYEES ────────────────────────────────────────────
export const employeeService = {
  getAll: async () => {
    try {
      const res = await api.get('/employees');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  create: async (data: any) => {
    try {
      const res = await api.post('/employees', data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  update: async (id: string, data: any) => {
    try {
      const res = await api.put(`/employees/${id}`, data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/employees/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};

// ── EXPENSES ─────────────────────────────────────────────
export const expenseService = {
  getAll: async () => {
    try {
      const res = await api.get('/expenses');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  create: async (data: any) => {
    try {
      const res = await api.post('/expenses', data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/expenses/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};

// ── INCOME ───────────────────────────────────────────────
export const incomeService = {
  getAll: async () => {
    try {
      const res = await api.get('/income');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  create: async (data: any) => {
    try {
      const res = await api.post('/income', data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/income/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};

// ── MATERIALS ────────────────────────────────────────────
export const materialService = {
  getAll: async () => {
    try {
      const res = await api.get('/materials');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  create: async (data: any) => {
    try {
      const res = await api.post('/materials', data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  update: async (id: string, data: any) => {
    try {
      const res = await api.put(`/materials/${id}`, data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/materials/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  addStock: async (materialId: string, projectId: string | null, type: 'in' | 'out', qty: number, note?: string) => {
    try {
      const res = await api.post('/stock_logs', {
        material_id: materialId,
        project_id: projectId,
        type,
        quantity: qty,
        note,
      });
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};

// ── ATTENDANCE ───────────────────────────────────────────
export const attendanceService = {
  getByDate: async (date: string) => {
    try {
      const res = await api.get(`/attendance?date=${date}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  upsert: async (data: any) => {
    try {
      const res = await api.post('/attendance', { ...data, upsert: true });
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  getMonthlyReport: async (month: string) => {
    try {
      const res = await api.get(`/attendance?month=${month}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};

// ── INVOICES ─────────────────────────────────────────────
export const invoiceService = {
  getAll: async () => {
    try {
      const res = await api.get('/invoices');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  create: async (data: any) => {
    try {
      const res = await api.post('/invoices', data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  update: async (id: string, data: any) => {
    try {
      const res = await api.put(`/invoices/${id}`, data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/invoices/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};

// ── DOCUMENTS ────────────────────────────────────────────
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

// ── DASHBOARD KPIs ───────────────────────────────────────
export const dashboardService = {
  getStats: async () => {
    try {
      const res = await api.get('/dashboard/stats');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};

// ── PROFILES ─────────────────────────────────────────────
export const profileService = {
  getAll: async () => {
    try {
      const res = await api.get('/profiles');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  getById: async (id: string) => {
    try {
      const res = await api.get(`/profiles/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  update: async (id: string, data: any) => {
    try {
      const res = await api.put(`/profiles/${id}`, data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};

// ── PROJECT ASSIGNMENTS ──────────────────────────────────
export const assignmentService = {
  getAll: async () => {
    try {
      const res = await api.get('/project_assignments');
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  create: async (data: { project_id: string; employee_id: string; role_in_project?: string }) => {
    try {
      const res = await api.post('/project_assignments', data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/project_assignments/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err.response?.data || err.message };
    }
  },
};
