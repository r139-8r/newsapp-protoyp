/* ================================================================
   NewsForge Admin Dashboard — App Logic, Router & Mock Data
   ================================================================ */

// ── Mock Template Data ──
const TEMPLATES = [
  { id: 1, name: 'Breaking News — Red Alert', category: 'breaking', format: 'image', size: 'story', status: 'published', downloads: 1247, lastModified: '2026-06-27', color: '#DC2626', gradient: 'linear-gradient(135deg, #DC2626, #991B1B)', icon: '🔴' },
  { id: 2, name: 'Breaking News — Blue Flash', category: 'breaking', format: 'image', size: 'story', status: 'published', downloads: 983, lastModified: '2026-06-26', color: '#2563EB', gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)', icon: '🔵' },
  { id: 3, name: 'Breaking — Dark Cinematic', category: 'breaking', format: 'video', size: 'story', status: 'published', downloads: 756, lastModified: '2026-06-25', color: '#1F2937', gradient: 'linear-gradient(135deg, #1F2937, #111827)', icon: '🎬' },
  { id: 4, name: 'Sports Score Card', category: 'sports', format: 'image', size: 'post', status: 'published', downloads: 1102, lastModified: '2026-06-27', color: '#059669', gradient: 'linear-gradient(135deg, #059669, #047857)', icon: '⚽' },
  { id: 5, name: 'Sports Highlight Reel', category: 'sports', format: 'video', size: 'story', status: 'published', downloads: 891, lastModified: '2026-06-24', color: '#0891B2', gradient: 'linear-gradient(135deg, #0891B2, #0E7490)', icon: '🏏' },
  { id: 6, name: 'Match Day Alert', category: 'sports', format: 'image', size: 'story', status: 'draft', downloads: 0, lastModified: '2026-06-27', color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)', icon: '🏆' },
  { id: 7, name: 'Weather Forecast Card', category: 'weather', format: 'image', size: 'post', status: 'published', downloads: 654, lastModified: '2026-06-23', color: '#0EA5E9', gradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)', icon: '🌤️' },
  { id: 8, name: 'Weather Alert — Severe', category: 'weather', format: 'image', size: 'story', status: 'published', downloads: 432, lastModified: '2026-06-26', color: '#EAB308', gradient: 'linear-gradient(135deg, #EAB308, #CA8A04)', icon: '⛈️' },
  { id: 9, name: 'Weather Weekly Outlook', category: 'weather', format: 'video', size: 'landscape', status: 'draft', downloads: 0, lastModified: '2026-06-26', color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)', icon: '📊' },
  { id: 10, name: 'Election Results Live', category: 'politics', format: 'video', size: 'story', status: 'published', downloads: 2103, lastModified: '2026-06-27', color: '#DC2626', gradient: 'linear-gradient(135deg, #F97316, #DC2626)', icon: '🗳️' },
  { id: 11, name: 'Political Quote Card', category: 'politics', format: 'image', size: 'post', status: 'published', downloads: 567, lastModified: '2026-06-22', color: '#1E40AF', gradient: 'linear-gradient(135deg, #1E40AF, #1E3A8A)', icon: '💬' },
  { id: 12, name: 'Government Policy Update', category: 'politics', format: 'image', size: 'story', status: 'archived', downloads: 234, lastModified: '2026-06-20', color: '#374151', gradient: 'linear-gradient(135deg, #374151, #1F2937)', icon: '📋' },
  { id: 13, name: 'Celebrity News Flash', category: 'entertainment', format: 'image', size: 'story', status: 'published', downloads: 1876, lastModified: '2026-06-27', color: '#DB2777', gradient: 'linear-gradient(135deg, #DB2777, #BE185D)', icon: '⭐' },
  { id: 14, name: 'Movie Release Poster', category: 'entertainment', format: 'image', size: 'story', status: 'published', downloads: 943, lastModified: '2026-06-25', color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)', icon: '🎬' },
  { id: 15, name: 'Entertainment Buzz Video', category: 'entertainment', format: 'video', size: 'story', status: 'published', downloads: 1534, lastModified: '2026-06-26', color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #DB2777)', icon: '📺' },
  { id: 16, name: 'Stock Market Update', category: 'business', format: 'image', size: 'post', status: 'published', downloads: 721, lastModified: '2026-06-27', color: '#059669', gradient: 'linear-gradient(135deg, #059669, #047857)', icon: '📈' },
  { id: 17, name: 'Business Breaking Alert', category: 'business', format: 'image', size: 'story', status: 'published', downloads: 389, lastModified: '2026-06-26', color: '#0891B2', gradient: 'linear-gradient(135deg, #0891B2, #0E7490)', icon: '💰' },
  { id: 18, name: 'Quarterly Report Infographic', category: 'business', format: 'image', size: 'landscape', status: 'draft', downloads: 0, lastModified: '2026-06-25', color: '#4F46E5', gradient: 'linear-gradient(135deg, #4F46E5, #3730A3)', icon: '📊' },
  { id: 19, name: 'Generic News — Minimal', category: 'breaking', format: 'image', size: 'story', status: 'published', downloads: 456, lastModified: '2026-06-24', color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #4B5563)', icon: '📰' },
  { id: 20, name: 'Video News Bulletin', category: 'breaking', format: 'video', size: 'landscape', status: 'published', downloads: 1678, lastModified: '2026-06-27', color: '#1E40AF', gradient: 'linear-gradient(135deg, #1E40AF, #DC2626)', icon: '📡' },
];

// ── Mock Users ──
const USERS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', plan: 'free', exports: 42, aiUsage: 18, joined: '2026-06-01', lastActive: '2026-06-27', color: '#3B82F6' },
  { id: 2, name: 'Priya Patel', email: 'priya@example.com', plan: 'free', exports: 67, aiUsage: 31, joined: '2026-06-03', lastActive: '2026-06-27', color: '#10B981' },
  { id: 3, name: 'Amit Kumar', email: 'amit@example.com', plan: 'free', exports: 23, aiUsage: 8, joined: '2026-06-05', lastActive: '2026-06-26', color: '#F59E0B' },
  { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', plan: 'free', exports: 89, aiUsage: 45, joined: '2026-06-02', lastActive: '2026-06-27', color: '#EF4444' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', plan: 'free', exports: 15, aiUsage: 5, joined: '2026-06-10', lastActive: '2026-06-25', color: '#8B5CF6' },
  { id: 6, name: 'Ananya Desai', email: 'ananya@example.com', plan: 'free', exports: 56, aiUsage: 22, joined: '2026-06-07', lastActive: '2026-06-27', color: '#EC4899' },
  { id: 7, name: 'Karthik Iyer', email: 'karthik@example.com', plan: 'free', exports: 31, aiUsage: 12, joined: '2026-06-12', lastActive: '2026-06-26', color: '#06B6D4' },
  { id: 8, name: 'Meera Joshi', email: 'meera@example.com', plan: 'free', exports: 78, aiUsage: 38, joined: '2026-06-04', lastActive: '2026-06-27', color: '#F97316' },
  { id: 9, name: 'Rohit Gupta', email: 'rohit@example.com', plan: 'free', exports: 44, aiUsage: 19, joined: '2026-06-08', lastActive: '2026-06-27', color: '#14B8A6' },
  { id: 10, name: 'Divya Nair', email: 'divya@example.com', plan: 'free', exports: 12, aiUsage: 3, joined: '2026-06-15', lastActive: '2026-06-24', color: '#A855F7' },
];

// ── Editor Layers ──
const EDITOR_LAYERS = [
  { id: 'l5', name: 'Headline Text', type: 'text', icon: 'T', isInputSlot: true, visible: true, locked: false },
  { id: 'l4', name: 'Source Label', type: 'text', icon: 'T', isInputSlot: true, visible: true, locked: false },
  { id: 'l3', name: 'Category Badge', type: 'shape', icon: '⬜', isInputSlot: false, visible: true, locked: false },
  { id: 'l2', name: 'Main Photo', type: 'image', icon: '🖼️', isInputSlot: true, visible: true, locked: false },
  { id: 'l1', name: 'Background', type: 'bg', icon: '🎨', isInputSlot: false, visible: true, locked: true },
];

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initSidebar();
  initDashboard();
  initTemplateManager();
  initEditor();
  initAnalytics();
  initUsers();
});

// ================================================================
// LOGIN
// ================================================================
function initLogin() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }

    try {
      await AdminAuthAPI.login(email, password);
      document.getElementById('login-page').style.display = 'none';
      document.getElementById('login-error').classList.remove('show');
      document.getElementById('app-layout').classList.add('active');
      renderDashboard();
    } catch (err) {
      document.getElementById('login-error').textContent = err.message || 'Invalid email or password.';
      document.getElementById('login-error').classList.add('show');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
    }
  });
}

// ================================================================
// SIDEBAR NAVIGATION
// ================================================================
function initSidebar() {
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navigateTo(page);
    });
  });

  document.getElementById('sidebar-logout-btn').addEventListener('click', () => {
    AdminAuthAPI.logout();
  });
}

function navigateTo(page) {
  // Update sidebar
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  const sidebarItem = document.querySelector(`.sidebar-item[data-page="${page}"]`);
  if (sidebarItem) sidebarItem.classList.add('active');

  // Update page title
  const titles = {
    'dashboard': 'Dashboard',
    'templates': 'Template Manager',
    'editor': 'Template Editor',
    'analytics': 'Analytics',
    'users': 'User Management'
  };
  document.getElementById('page-title').textContent = titles[page] || 'Dashboard';

  // Show/hide create button
  document.getElementById('header-create-btn').style.display =
    (page === 'dashboard' || page === 'templates') ? 'inline-flex' : 'none';

  // Switch pages
  document.querySelectorAll('.page-section').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });

  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) {
    pageEl.style.display = page === 'editor' ? 'block' : 'block';
    pageEl.classList.add('active');
  }

  // Render page content
  if (page === 'dashboard') renderDashboard();
  if (page === 'templates') renderTemplatesTable();
  if (page === 'editor') renderEditorLayers();
  if (page === 'analytics') renderAnalytics();
  if (page === 'users') renderUsersTable();
}

// ================================================================
// DASHBOARD HOME
// ================================================================
function initDashboard() {
  // Initial render handled by navigateTo
}

async function renderDashboard() {
  // Load real analytics from API
  try {
    const [overview, templateStats] = await Promise.all([
      AnalyticsAPI.getOverview(),
      AnalyticsAPI.getTemplateStats(),
    ]);

    // Update stat cards if elements exist
    const statsMap = {
      'stat-total-templates': overview?.total_templates_published,
      'stat-total-users': overview?.total_users,
      'stat-exports-today': overview?.total_exports_today,
      'stat-dau': overview?.dau,
    };
    for (const [id, val] of Object.entries(statsMap)) {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.textContent = val.toLocaleString();
    }

    // Render recent templates table
    const tbody = document.getElementById('dashboard-recent-table');
    if (tbody && templateStats) {
      const recent = templateStats.slice(0, 5);
      tbody.innerHTML = recent.map(t => `
        <tr>
          <td><div class="table-thumb" style="background:linear-gradient(135deg,#3B82F6,#1D4ED8)">📰</div></td>
          <td class="table-name">${t.name}</td>
          <td>${capitalize(t.category)}</td>
          <td><span class="format-badge ${t.format}">${t.format}</span></td>
          <td><span class="status-badge ${t.status}">${t.status}</span></td>
          <td style="font-family:var(--font-mono)">${t.download_count.toLocaleString()}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    // Silently fall back — dashboard still renders
    console.warn('[Admin] Dashboard load failed:', err.message);
  }
}

// ================================================================
// TEMPLATE MANAGER
// ================================================================
function initTemplateManager() {
  // Filter listeners
  ['filter-category', 'filter-status', 'filter-format'].forEach(id => {
    document.getElementById(id).addEventListener('change', renderTemplatesTable);
  });

  document.getElementById('template-search').addEventListener('input', renderTemplatesTable);

  // Select all checkbox
  document.getElementById('select-all-templates').addEventListener('change', (e) => {
    document.querySelectorAll('.template-row-checkbox').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });
}

async function renderTemplatesTable() {
  const search = document.getElementById('template-search').value.toLowerCase();
  const category = document.getElementById('filter-category').value;
  const status_filter = document.getElementById('filter-status').value;
  const format = document.getElementById('filter-format').value;

  const tbody = document.getElementById('templates-table-body');
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:#888">Loading...</td></tr>';

  try {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (status_filter) params.status = status_filter;
    if (format) params.format = format;

    const response = await AdminTemplatesAPI.list(params);
    const templates = response?.templates || [];

    document.getElementById('templates-count').textContent = `Showing ${templates.length} templates`;

    tbody.innerHTML = templates.map(t => `
      <tr>
        <td><input type="checkbox" class="template-row-checkbox" style="accent-color:var(--accent)"></td>
        <td><div class="table-thumb" style="background:linear-gradient(135deg,#3B82F6,#1D4ED8)">📰</div></td>
        <td class="table-name">${t.name}</td>
        <td>${capitalize(t.category)}</td>
        <td><span class="format-badge ${t.format}">${t.format}</span></td>
        <td><span class="status-badge ${t.status}">${t.status}</span></td>
        <td style="font-family:var(--font-mono)">${(t.download_count || 0).toLocaleString()}</td>
        <td style="font-family:var(--font-mono);color:var(--text-secondary);font-size:13px">${t.updated_at ? t.updated_at.split('T')[0] : ''}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon btn-ghost" title="Edit" onclick="navigateTo('editor')">✏️</button>
            <button class="btn-icon btn-ghost" title="${t.status === 'published' ? 'Unpublish' : 'Publish'}" onclick="toggleStatusReal('${t.id}', '${t.status}')">${t.status === 'published' ? '⏸️' : '▶️'}</button>
            <button class="btn-icon btn-ghost" title="Archive" onclick="archiveTemplateReal('${t.id}')">📦</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:#EF4444">Failed to load templates: ${err.message}</td></tr>`;
  }
}

async function toggleStatusReal(id, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  try {
    await AdminTemplatesAPI.updateStatus(id, newStatus);
    showAdminToast('✓', `Template ${newStatus}`);
    renderTemplatesTable();
  } catch (err) {
    showAdminToast('❌', err.message || 'Status update failed');
  }
}

async function archiveTemplateReal(id) {
  try {
    await AdminTemplatesAPI.updateStatus(id, 'archived');
    showAdminToast('📦', 'Template archived');
    renderTemplatesTable();
  } catch (err) {
    showAdminToast('❌', err.message || 'Archive failed');
  }
}

function toggleStatus(id) {
  const template = TEMPLATES.find(t => t.id === id);
  if (template) {
    template.status = template.status === 'published' ? 'draft' : 'published';
    renderTemplatesTable();
    showAdminToast('✓', `Template ${template.status === 'published' ? 'published' : 'unpublished'}`);
  }
}

function archiveTemplate(id) {
  const template = TEMPLATES.find(t => t.id === id);
  if (template) {
    template.status = 'archived';
    renderTemplatesTable();
    showAdminToast('📦', 'Template archived');
  }
}

// ================================================================
// TEMPLATE EDITOR
// ================================================================
function initEditor() {
  // Toolbar buttons
  document.querySelectorAll('.toolbar-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toolbar-btn[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Input slot toggle
  document.getElementById('input-slot-toggle').addEventListener('click', function() {
    this.classList.toggle('active');
    const fields = document.getElementById('input-slot-fields');
    fields.style.display = this.classList.contains('active') ? 'flex' : 'none';
  });

  // Scene blocks
  document.querySelectorAll('.scene-block').forEach(block => {
    block.addEventListener('click', () => {
      document.querySelectorAll('.scene-block').forEach(b => b.classList.remove('active'));
      block.classList.add('active');
    });
  });

  // Zoom
  let zoomLevel = 75;
  document.getElementById('zoom-in-btn').addEventListener('click', () => {
    zoomLevel = Math.min(zoomLevel + 10, 150);
    applyZoom(zoomLevel);
  });
  document.getElementById('zoom-out-btn').addEventListener('click', () => {
    zoomLevel = Math.max(zoomLevel - 10, 30);
    applyZoom(zoomLevel);
  });
}

function applyZoom(level) {
  const canvas = document.getElementById('editor-canvas');
  const baseW = 270;
  const baseH = 480;
  const scale = level / 75;
  canvas.style.width = `${baseW * scale}px`;
  canvas.style.height = `${baseH * scale}px`;
  document.querySelector('.canvas-size-label').textContent = `1080 × 1920 • Zoom: ${level}%`;
}

function renderEditorLayers() {
  const list = document.getElementById('layers-list');
  list.innerHTML = EDITOR_LAYERS.map(l => `
    <div class="layer-item ${l.id === 'l5' ? 'active' : ''} ${l.isInputSlot ? 'input-slot' : ''}" data-layer="${l.id}">
      <div class="layer-checkbox checked">✓</div>
      <span class="layer-icon">${l.icon}</span>
      <span class="layer-name">${l.name}</span>
      <div class="layer-actions">
        <button class="layer-action-btn" title="${l.visible ? 'Hide' : 'Show'}">${l.visible ? '👁️' : '🚫'}</button>
        <button class="layer-action-btn" title="${l.locked ? 'Unlock' : 'Lock'}">${l.locked ? '🔒' : '🔓'}</button>
      </div>
    </div>
  `).join('');

  // Layer click
  list.querySelectorAll('.layer-item').forEach(item => {
    item.addEventListener('click', () => {
      list.querySelectorAll('.layer-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Render simulated canvas
  renderEditorCanvas();
}

function renderEditorCanvas() {
  const canvas = document.getElementById('canvas-content');
  canvas.innerHTML = `
    <div style="width:100%;height:100%;background:linear-gradient(135deg, #DC2626, #991B1B);position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;color:#fff;font-family:'Inter',sans-serif;">
      <!-- Simulated image area -->
      <div style="position:absolute;top:0;left:0;right:0;bottom:40%;background:rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;border:2px dashed rgba(59,130,246,0.5)">
        <span style="font-size:24px;opacity:0.4">🖼️ Main Photo</span>
      </div>
      <!-- Category badge -->
      <div style="position:absolute;top:12px;left:12px;padding:3px 10px;background:rgba(0,0,0,0.6);border-radius:4px;font-size:8px;font-weight:800;letter-spacing:1px">BREAKING NEWS</div>
      <!-- Headline -->
      <div style="font-size:14px;font-weight:800;line-height:1.2;margin-bottom:6px;border:2px dashed rgba(59,130,246,0.5);padding:4px;border-radius:4px;">
        Your Headline Here
      </div>
      <!-- Source -->
      <div style="font-size:7px;opacity:0.7;font-family:'JetBrains Mono',monospace;border:2px dashed rgba(59,130,246,0.5);padding:3px;border-radius:4px;display:inline-block">
        Source Name • Date
      </div>
    </div>
  `;
}

// ================================================================
// ANALYTICS
// ================================================================
function initAnalytics() {
  document.getElementById('analytics-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.analytics-tab');
    if (!tab) return;
    document.querySelectorAll('.analytics-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    document.querySelectorAll('.analytics-tab-content').forEach(c => {
      c.style.display = 'none';
      c.classList.remove('active');
    });

    const tabId = tab.dataset.tab;
    const content = document.getElementById(`tab-${tabId}`);
    if (content) {
      content.style.display = 'block';
      content.classList.add('active');
    }

    renderAnalytics();
  });
}

function renderAnalytics() {
  renderExportsChart();
  renderCategoriesChart();
  renderAIUsageChart();
  renderTemplatePerformance();
  renderNewUsersChart();
  renderVoiceLanguagesChart();
  renderScriptTonesChart();
}

function renderExportsChart() {
  const container = document.getElementById('exports-chart');
  if (!container) return;
  const data = [
    { label: 'Mon', value: 312 },
    { label: 'Tue', value: 428 },
    { label: 'Wed', value: 389 },
    { label: 'Thu', value: 467 },
    { label: 'Fri', value: 523 },
    { label: 'Sat', value: 380 },
    { label: 'Sun', value: 342 },
  ];
  const max = Math.max(...data.map(d => d.value));
  container.innerHTML = data.map(d => `
    <div class="bar-chart-col">
      <div class="bar-chart-bar" style="height:${(d.value / max) * 100}%">
        <span class="bar-chart-value">${d.value}</span>
      </div>
      <span class="bar-chart-label">${d.label}</span>
    </div>
  `).join('');
}

function renderCategoriesChart() {
  const container = document.getElementById('categories-chart');
  if (!container) return;
  const data = [
    { label: 'Breaking', value: 42, color: '#DC2626' },
    { label: 'Sports', value: 28, color: '#059669' },
    { label: 'Entertainment', value: 35, color: '#DB2777' },
    { label: 'Politics', value: 18, color: '#F97316' },
    { label: 'Weather', value: 12, color: '#0EA5E9' },
    { label: 'Business', value: 15, color: '#4F46E5' },
  ];
  const max = Math.max(...data.map(d => d.value));
  container.innerHTML = data.map(d => `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <span style="width:80px;font-size:13px;color:var(--text-secondary)">${d.label}</span>
      <div style="flex:1;height:24px;background:var(--bg-input);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${(d.value / max) * 100}%;background:${d.color};border-radius:4px;transition:width 0.6s ease"></div>
      </div>
      <span style="font-size:13px;font-weight:600;font-family:var(--font-mono);width:30px;text-align:right">${d.value}%</span>
    </div>
  `).join('');
}

function renderAIUsageChart() {
  const container = document.getElementById('ai-usage-chart');
  if (!container) return;
  const data = [
    { label: 'Voice', value: 56, color: '#3B82F6' },
    { label: 'Script', value: 33, color: '#8B5CF6' },
  ];
  const max = Math.max(...data.map(d => d.value));
  container.innerHTML = data.map(d => `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <span style="width:60px;font-size:13px;color:var(--text-secondary)">${d.label}</span>
      <div style="flex:1;height:28px;background:var(--bg-input);border-radius:6px;overflow:hidden">
        <div style="height:100%;width:${(d.value / max) * 100}%;background:${d.color};border-radius:6px;transition:width 0.6s ease;display:flex;align-items:center;justify-content:flex-end;padding-right:8px">
          <span style="font-size:12px;font-weight:700;color:#fff;font-family:var(--font-mono)">${d.value}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderTemplatePerformance() {
  const tbody = document.getElementById('template-performance-table');
  if (!tbody) return;
  const sorted = [...TEMPLATES].filter(t => t.status === 'published').sort((a, b) => b.downloads - a.downloads);
  tbody.innerHTML = sorted.map(t => {
    const exports = Math.floor(t.downloads * 0.72);
    const convRate = ((exports / t.downloads) * 100).toFixed(1);
    return `
      <tr>
        <td><div class="table-thumb" style="background:${t.gradient}">${t.icon}</div></td>
        <td class="table-name">${t.name}</td>
        <td style="font-family:var(--font-mono)">${t.downloads.toLocaleString()}</td>
        <td style="font-family:var(--font-mono)">${exports.toLocaleString()}</td>
        <td><span style="font-family:var(--font-mono);color:var(--success);font-weight:600">${convRate}%</span></td>
      </tr>
    `;
  }).join('');
}

function renderNewUsersChart() {
  const container = document.getElementById('new-users-chart');
  if (!container) return;
  const data = [
    { label: 'Mon', value: 89 },
    { label: 'Tue', value: 112 },
    { label: 'Wed', value: 97 },
    { label: 'Thu', value: 134 },
    { label: 'Fri', value: 156 },
    { label: 'Sat', value: 108 },
    { label: 'Sun', value: 127 },
  ];
  const max = Math.max(...data.map(d => d.value));
  container.innerHTML = data.map(d => `
    <div class="bar-chart-col">
      <div class="bar-chart-bar" style="height:${(d.value / max) * 100}%;background:#10B981">
        <span class="bar-chart-value">${d.value}</span>
      </div>
      <span class="bar-chart-label">${d.label}</span>
    </div>
  `).join('');
}

function renderVoiceLanguagesChart() {
  const container = document.getElementById('voice-languages-chart');
  if (!container) return;
  const data = [
    { label: 'Hindi', value: 45, color: '#F59E0B' },
    { label: 'English', value: 32, color: '#3B82F6' },
    { label: 'Tamil', value: 12, color: '#10B981' },
    { label: 'Telugu', value: 8, color: '#EC4899' },
    { label: 'Bengali', value: 3, color: '#8B5CF6' },
  ];
  const max = Math.max(...data.map(d => d.value));
  container.innerHTML = data.map(d => `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <span style="width:70px;font-size:13px;color:var(--text-secondary)">${d.label}</span>
      <div style="flex:1;height:22px;background:var(--bg-input);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${(d.value / max) * 100}%;background:${d.color};border-radius:4px;transition:width 0.6s ease"></div>
      </div>
      <span style="font-size:12px;font-weight:600;font-family:var(--font-mono);width:30px;text-align:right">${d.value}%</span>
    </div>
  `).join('');
}

function renderScriptTonesChart() {
  const container = document.getElementById('script-tones-chart');
  if (!container) return;
  const data = [
    { label: 'Formal', value: 52, color: '#3B82F6' },
    { label: 'Dramatic', value: 24, color: '#EF4444' },
    { label: 'Neutral', value: 16, color: '#6B7280' },
    { label: 'Casual', value: 8, color: '#10B981' },
  ];
  const max = Math.max(...data.map(d => d.value));
  container.innerHTML = data.map(d => `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <span style="width:70px;font-size:13px;color:var(--text-secondary)">${d.label}</span>
      <div style="flex:1;height:22px;background:var(--bg-input);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${(d.value / max) * 100}%;background:${d.color};border-radius:4px;transition:width 0.6s ease"></div>
      </div>
      <span style="font-size:12px;font-weight:600;font-family:var(--font-mono);width:30px;text-align:right">${d.value}%</span>
    </div>
  `).join('');
}

// ================================================================
// USER MANAGEMENT
// ================================================================
function initUsers() {
  document.getElementById('user-search').addEventListener('input', renderUsersTable);
}

async function renderUsersTable() {
  const search = document.getElementById('user-search').value.toLowerCase();

  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#888">Loading...</td></tr>';

  try {
    const response = await AdminUsersAPI.list(search);
    const users = response?.users || [];

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div class="user-avatar-cell">
            <div class="user-table-avatar" style="background:#3B82F6">${u.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="user-table-info">
              <span class="user-table-name">${u.name}</span>
              <span class="user-table-email">${u.email}</span>
            </div>
          </div>
        </td>
        <td><span class="plan-badge ${u.plan}">${u.plan}</span></td>
        <td style="font-family:var(--font-mono)">-</td>
        <td style="font-family:var(--font-mono)">-</td>
        <td style="font-family:var(--font-mono);color:var(--text-secondary);font-size:13px">${u.created_at ? u.created_at.split('T')[0] : ''}</td>
        <td style="font-family:var(--font-mono);color:var(--text-secondary);font-size:13px">${u.updated_at ? u.updated_at.split('T')[0] : ''}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon btn-ghost" title="View Details">👁️</button>
            <button class="btn-icon btn-ghost" title="Suspend" onclick="showAdminToast('⚠️','User action: Suspend')">⏸️</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#EF4444">Failed to load users: ${err.message}</td></tr>`;
  }
}

// ================================================================
// TOAST
// ================================================================
function showAdminToast(icon, message) {
  const toast = document.getElementById('admin-toast');
  document.getElementById('admin-toast-icon').textContent = icon;
  document.getElementById('admin-toast-message').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ================================================================
// UTILITIES
// ================================================================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
