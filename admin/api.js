/* ================================================================
   NewsForge Admin — API Client
   Handles all communication with the FastAPI backend.
   ================================================================ */

const API_BASE = window.NF_ADMIN_API_BASE || 'http://localhost:8000';

// ── Admin Token ──
const AdminAuth = {
  getToken() { return localStorage.getItem('nf_admin_token'); },
  setToken(token, admin) {
    localStorage.setItem('nf_admin_token', token);
    localStorage.setItem('nf_admin_info', JSON.stringify(admin));
  },
  clearToken() {
    localStorage.removeItem('nf_admin_token');
    localStorage.removeItem('nf_admin_info');
  },
  getAdmin() {
    try { return JSON.parse(localStorage.getItem('nf_admin_info') || 'null'); }
    catch { return null; }
  },
};

// ── Core Fetch ──
async function adminApiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = AdminAuth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    AdminAuth.clearToken();
    document.getElementById('app-layout').classList.remove('active');
    document.getElementById('login-page').style.display = 'flex';
    showAdminToast('⚠️', 'Session expired. Please log in again.');
    return null;
  }

  if (!res.ok) {
    let errMsg = `API Error ${res.status}`;
    try { const body = await res.json(); errMsg = body.detail || errMsg; } catch {}
    throw new Error(errMsg);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── Admin Auth API ──
const AdminAuthAPI = {
  async login(email, password) {
    const res = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || 'Invalid email or password');
    }
    const data = await res.json();
    AdminAuth.setToken(data.access_token, { id: data.admin_id, name: data.name, role: data.role });
    return data;
  },

  logout() {
    AdminAuth.clearToken();
    document.getElementById('app-layout').classList.remove('active');
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-password').value = '';
  },
};

// ── Analytics API ──
const AnalyticsAPI = {
  async getOverview() { return adminApiFetch('/admin/analytics/overview'); },
  async getTemplateStats() { return adminApiFetch('/admin/analytics/templates'); },
  async getUserStats() { return adminApiFetch('/admin/analytics/users'); },
  async getAIUsage() { return adminApiFetch('/admin/analytics/ai-usage'); },
};

// ── Templates API (Admin) ──
const AdminTemplatesAPI = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return adminApiFetch(`/admin/templates?${qs}`);
  },
  async get(id) {
    return adminApiFetch(`/admin/templates/${id}`);
  },
  async create(data) {
    return adminApiFetch('/admin/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id, data) {
    return adminApiFetch(`/admin/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async updateStatus(id, status) {
    return adminApiFetch(`/admin/templates/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  async delete(id) {
    return adminApiFetch(`/admin/templates/${id}`, { method: 'DELETE' });
  },
  async uploadAsset(templateId, file, assetType) {
    const token = AdminAuth.getToken();
    const form = new FormData();
    form.append('file', file);
    form.append('asset_type', assetType);
    const res = await fetch(`${API_BASE}/admin/templates/${templateId}/assets`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      let errMsg = `Upload failed (${res.status})`;
      try { const body = await res.json(); errMsg = body.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },
};

// ── Users API (Admin) ──
const AdminUsersAPI = {
  async list(search = '', page = 1) {
    const qs = new URLSearchParams({ page, ...(search ? { search } : {}) }).toString();
    return adminApiFetch(`/admin/users?${qs}`);
  },
  async update(id, data) {
    return adminApiFetch(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
