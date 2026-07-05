/* ================================================================
   NewsForge Mobile — API Client
   Handles all communication with the FastAPI backend.
   Replace mock data by calling these functions.
   ================================================================ */

// ── Configuration ──
const API_BASE = window.NF_API_BASE || 'http://localhost:8000';

// ── Token Management ──
const Auth = {
  getAccessToken() { return localStorage.getItem('nf_access_token'); },
  getRefreshToken() { return localStorage.getItem('nf_refresh_token'); },
  setTokens(access, refresh) {
    localStorage.setItem('nf_access_token', access);
    if (refresh) localStorage.setItem('nf_refresh_token', refresh);
  },
  clearTokens() {
    localStorage.removeItem('nf_access_token');
    localStorage.removeItem('nf_refresh_token');
    localStorage.removeItem('nf_user');
    localStorage.removeItem('nf_logged_in');
  },
  setUser(user) { localStorage.setItem('nf_user', JSON.stringify(user)); },
  getUser() {
    try { return JSON.parse(localStorage.getItem('nf_user') || 'null'); }
    catch { return null; }
  },
  isLoggedIn() { return !!this.getAccessToken(); },
};

// ── Core Fetch Wrapper ──
async function apiFetch(path, options = {}, retried = false) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = Auth.getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && !retried) {
    const hasRefreshToken = !!Auth.getRefreshToken();
    if (hasRefreshToken) {
      const refreshed = await tryRefreshToken();
      if (refreshed) return apiFetch(path, options, true);
      Auth.clearTokens();
      location.reload();
      return;
    }
    Auth.clearTokens();
  }

  if (!res.ok) {
    let errMsg = `API Error ${res.status}`;
    try { const body = await res.json(); errMsg = body.detail || errMsg; } catch {}
    throw new Error(errMsg);
  }

  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

async function tryRefreshToken() {
  const refreshToken = Auth.getRefreshToken();
  if (!refreshToken) return false;
  try {
    const data = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).then(r => r.ok ? r.json() : null);
    if (data?.access_token) {
      Auth.setTokens(data.access_token, data.refresh_token);
      return true;
    }
  } catch {}
  return false;
}

// ── Auth API ──
const AuthAPI = {
  async loginWithGoogle(firebaseIdToken) {
    const data = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ firebase_id_token: firebaseIdToken }),
    });
    Auth.setTokens(data.tokens.access_token, data.tokens.refresh_token);
    Auth.setUser(data.user);
    localStorage.setItem('nf_logged_in', '1');
    return data.user;
  },

  async registerWithEmail(name, email, password) {
    const data = await apiFetch('/auth/email/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    Auth.setTokens(data.tokens.access_token, data.tokens.refresh_token);
    Auth.setUser(data.user);
    localStorage.setItem('nf_logged_in', '1');
    return data.user;
  },

  async loginWithEmail(email, password) {
    const data = await apiFetch('/auth/email/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    Auth.setTokens(data.tokens.access_token, data.tokens.refresh_token);
    Auth.setUser(data.user);
    localStorage.setItem('nf_logged_in', '1');
    return data.user;
  },

  async getMe() {
    return apiFetch('/auth/me');
  },

  logout() {
    Auth.clearTokens();
    location.reload();
  },
};

// ── Templates API ──
const TemplatesAPI = {
  _cache: null,
  _cacheExpiry: 0,
  _CACHE_TTL: 30 * 60 * 1000, // 30 minutes

  async list(category = null, search = null, page = 1) {
    const params = new URLSearchParams({ page });
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    return apiFetch(`/api/templates?${params}`);
  },

  async get(templateId) {
    return apiFetch(`/api/templates/${templateId}`);
  },

  async sync() {
    const sinceTimestamp = localStorage.getItem('nf_last_sync');
    const params = sinceTimestamp ? `?since_timestamp=${encodeURIComponent(sinceTimestamp)}` : '';
    const data = await apiFetch(`/api/templates/sync${params}`);
    if (data) {
      localStorage.setItem('nf_last_sync', data.sync_timestamp);
      // Update local cache with returned templates
      this._updateLocalCache(data.templates);
    }
    return data;
  },

  _updateLocalCache(templates) {
    try {
      const existing = JSON.parse(localStorage.getItem('nf_template_cache') || '[]');
      const map = new Map(existing.map(t => [t.id, t]));
      templates.forEach(t => map.set(t.id, t));
      localStorage.setItem('nf_template_cache', JSON.stringify([...map.values()]));
    } catch {}
  },

  getLocalCache() {
    try { return JSON.parse(localStorage.getItem('nf_template_cache') || '[]'); }
    catch { return []; }
  },
};

// ── Projects API ──
const ProjectsAPI = {
  async list() {
    return apiFetch('/api/projects');
  },

  async get(projectId) {
    return apiFetch(`/api/projects/${projectId}`);
  },

  async create(templateId, name, slotValues = {}) {
    return apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        template_id: templateId,
        name,
        slot_values: slotValues,
        has_user_images: false,
      }),
    });
  },

  async update(projectId, updates) {
    return apiFetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async delete(projectId) {
    return apiFetch(`/api/projects/${projectId}`, { method: 'DELETE' });
  },

  async markExported(projectId, format, sizeName) {
    return this.update(projectId, { is_exported: true, output_format: format, output_size_name: sizeName });
  },
};

// ── Voice API ──
const VoiceAPI = {
  _voices: null,

  async listVoices() {
    if (this._voices) return this._voices;
    const data = await apiFetch('/api/voice/voices');
    this._voices = data.voices;
    return this._voices;
  },

  async generate(text, voiceId, speed = 1.0) {
    const token = Auth.getAccessToken();
    const res = await fetch(`${API_BASE}/api/voice/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text, voice_id: voiceId, speed }),
    });

    if (!res.ok) {
      let errMsg = `Voice generation failed (${res.status})`;
      try { const body = await res.json(); errMsg = body.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }

    // Return as Blob URL for audio playback
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};

// ── Script API ──
const ScriptAPI = {
  async generate(topic, tone = 'formal', targetLength = 30, keyPoints = '', language = 'en') {
    return apiFetch('/api/script/generate', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        tone,
        target_length: targetLength,
        key_points: keyPoints,
        language,
      }),
    });
  },
};

// ── Account API ──
const AccountAPI = {
  async getUsage() {
    return apiFetch('/api/account/usage');
  },

  async updatePreferences(prefs) {
    return apiFetch('/api/account/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    });
  },

  async exportData() {
    const token = Auth.getAccessToken();
    const res = await fetch(`${API_BASE}/api/account/export`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsforge-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  async deleteAccount() {
    await apiFetch('/api/account', { method: 'DELETE' });
    Auth.clearTokens();
    location.reload();
  },
};

// ── Export Tracking ──
const ExportsAPI = {
  async logExport(templateIdOrParams, format, sizeName) {
    let body;
    if (typeof templateIdOrParams === 'object') {
      body = {
        template_id: templateIdOrParams.template_id,
        output_format: templateIdOrParams.format || templateIdOrParams.output_format,
        output_size_name: templateIdOrParams.size || templateIdOrParams.output_size_name,
      };
    } else {
      body = {
        template_id: templateIdOrParams,
        output_format: format,
        output_size_name: sizeName,
      };
    }
    return apiFetch('/api/exports/log', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

// ── App Config Check ──
async function checkAppConfig() {
  try {
    const config = await fetch(`${API_BASE}/api/app/config`).then(r => r.json());
    if (config.maintenance_mode) {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0F0F14;color:#fff;text-align:center;padding:24px;font-family:Inter,sans-serif">
          <div>
            <div style="font-size:48px;margin-bottom:16px">🔧</div>
            <h2>Under Maintenance</h2>
            <p style="color:#888;margin-top:8px">${config.maintenance_message || 'We\'ll be back shortly.'}</p>
          </div>
        </div>`;
    }
  } catch {}
}

// ── OTA Sync on App Load ──
async function performOTASync() {
  try {
    if (Auth.isLoggedIn()) {
      await TemplatesAPI.sync();
    }
  } catch (e) {
    console.warn('[OTA Sync] Failed:', e.message);
  }
}
