/* ================================================================
   NewsForge Admin Dashboard — App Logic with Real Fabric.js Editor
   ================================================================ */

// ── Editor State ──
let fabricCanvas = null;
let currentEditingTemplateId = null;
let editorZoom = 75;

const CANVAS_BASE_W = 1080;
const CANVAS_BASE_H = 1920;

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
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  const sidebarItem = document.querySelector(`.sidebar-item[data-page="${page}"]`);
  if (sidebarItem) sidebarItem.classList.add('active');

  const titles = {
    'dashboard': 'Dashboard',
    'templates': 'Template Manager',
    'editor': 'Template Editor',
    'analytics': 'Analytics',
    'users': 'User Management'
  };
  document.getElementById('page-title').textContent = titles[page] || 'Dashboard';

  document.getElementById('header-create-btn').style.display =
    (page === 'dashboard' || page === 'templates') ? 'inline-flex' : 'none';

  document.querySelectorAll('.page-section').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });

  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) {
    pageEl.style.display = 'block';
    pageEl.classList.add('active');
  }

  if (page === 'dashboard') renderDashboard();
  if (page === 'templates') renderTemplatesTable();
  if (page === 'editor') initFabricCanvas();
  if (page === 'analytics') renderAnalytics();
  if (page === 'users') renderUsersTable();
}

// ================================================================
// DASHBOARD HOME
// ================================================================
function initDashboard() {}

async function renderDashboard() {
  try {
    const [overview, templateStats] = await Promise.all([
      AnalyticsAPI.getOverview(),
      AnalyticsAPI.getTemplateStats(),
    ]);

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

    const tbody = document.getElementById('dashboard-recent-table');
    if (tbody && templateStats) {
      const recent = templateStats.slice(0, 5);
      tbody.innerHTML = recent.map(t => `
        <tr>
          <td><div class="table-thumb" style="background:${t.canvas_data?.gradient || 'linear-gradient(135deg,#3B82F6,#1D4ED8)'}">📰</div></td>
          <td class="table-name">${t.name}</td>
          <td>${capitalize(t.category)}</td>
          <td><span class="format-badge ${t.format}">${t.format}</span></td>
          <td><span class="status-badge ${t.status}">${t.status}</span></td>
          <td style="font-family:var(--font-mono)">${(t.download_count || 0).toLocaleString()}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.warn('[Admin] Dashboard load failed:', err.message);
  }
}

// ================================================================
// TEMPLATE MANAGER
// ================================================================
function initTemplateManager() {
  ['filter-category', 'filter-status', 'filter-format'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderTemplatesTable);
  });

  document.getElementById('template-search')?.addEventListener('input', renderTemplatesTable);

  document.getElementById('select-all-templates')?.addEventListener('change', (e) => {
    document.querySelectorAll('.template-row-checkbox').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });

  // Header create button
  document.getElementById('header-create-btn')?.addEventListener('click', () => {
    currentEditingTemplateId = null;
    navigateTo('editor');
  });
}

async function renderTemplatesTable() {
  const search = document.getElementById('template-search')?.value?.toLowerCase() || '';
  const category = document.getElementById('filter-category')?.value || '';
  const status_filter = document.getElementById('filter-status')?.value || '';
  const format = document.getElementById('filter-format')?.value || '';

  const tbody = document.getElementById('templates-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:#888">Loading...</td></tr>';

  try {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (status_filter) params.status = status_filter;
    if (format) params.format = format;

    const response = await AdminTemplatesAPI.list(params);
    const templates = response?.templates || [];

    const countEl = document.getElementById('templates-count');
    if (countEl) countEl.textContent = `Showing ${templates.length} templates`;

    tbody.innerHTML = templates.map(t => `
      <tr>
        <td><input type="checkbox" class="template-row-checkbox" style="accent-color:var(--accent)"></td>
        <td><div class="table-thumb" style="background:${t.canvas_data?.gradient || 'linear-gradient(135deg,#3B82F6,#1D4ED8)'}">📰</div></td>
        <td class="table-name">${t.name}</td>
        <td>${capitalize(t.category)}</td>
        <td><span class="format-badge ${t.format}">${t.format}</span></td>
        <td><span class="status-badge ${t.status}">${t.status}</span></td>
        <td style="font-family:var(--font-mono)">${(t.download_count || 0).toLocaleString()}</td>
        <td style="font-family:var(--font-mono);color:var(--text-secondary);font-size:13px">${t.updated_at ? t.updated_at.split('T')[0] : ''}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon btn-ghost" title="Edit" onclick="openEditorForTemplate('${t.id}')">✏️</button>
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

async function openEditorForTemplate(templateId) {
  currentEditingTemplateId = templateId;
  navigateTo('editor');
}

// ================================================================
// TEMPLATE EDITOR — Fabric.js Integration & Slots Manager
// ================================================================
let templateInputSlots = []; // Master list of input slots for the active template

function initEditor() {
  // Toolbar buttons
  document.querySelectorAll('.toolbar-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      handleToolAction(tool);
    });
  });

  // Zoom
  document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
    editorZoom = Math.min(editorZoom + 10, 150);
    applyZoom(editorZoom);
  });
  document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
    editorZoom = Math.max(editorZoom - 10, 30);
    applyZoom(editorZoom);
  });

  // Aspect Ratio selector
  document.getElementById('editor-aspect-ratio')?.addEventListener('change', (e) => {
    const ratio = e.target.value;
    if (ratio === 'story') {
      CANVAS_BASE_W = 1080;
      CANVAS_BASE_H = 1920;
    } else if (ratio === 'post') {
      CANVAS_BASE_W = 1080;
      CANVAS_BASE_H = 1080;
    } else if (ratio === 'landscape') {
      CANVAS_BASE_W = 1920;
      CANVAS_BASE_H = 1080;
    }
    applyZoom(editorZoom);
  });

  // Format selector (timeline visibility)
  document.getElementById('editor-format')?.addEventListener('change', (e) => {
    const isVideo = e.target.value === 'video';
    const timeline = document.querySelector('.scene-timeline');
    if (timeline) timeline.style.display = isVideo ? 'flex' : 'none';
  });

  // Slots Manager: Add Slot Button
  document.getElementById('btn-add-slot')?.addEventListener('click', () => {
    const idSuffix = Date.now().toString().slice(-4);
    templateInputSlots.push({
      slot_id: `slot_${idSuffix}`,
      label: `Input Field ${idSuffix}`,
      type: 'text',
      target_object_id: '',
      constraints: {
        max_length: 80,
        required: false,
        placeholder: `Enter text...`,
        options: []
      }
    });
    renderSlotsManagerList();
  });

  // Properties panel listeners (Position & Size)
  ['prop-x', 'prop-y', 'prop-w', 'prop-h', 'prop-rotation', 'prop-opacity'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      if (!fabricCanvas) return;
      const obj = fabricCanvas.getActiveObject();
      if (!obj) return;
      const x = parseFloat(document.getElementById('prop-x')?.value || 0);
      const y = parseFloat(document.getElementById('prop-y')?.value || 0);
      const w = parseFloat(document.getElementById('prop-w')?.value || 100);
      const h = parseFloat(document.getElementById('prop-h')?.value || 100);
      const rot = parseFloat(document.getElementById('prop-rotation')?.value || 0);
      const opa = parseFloat(document.getElementById('prop-opacity')?.value || 100) / 100;
      obj.set({ left: x, top: y, angle: rot, opacity: opa });
      if (obj.type !== 'circle') obj.set({ scaleX: w / (obj.width || 1), scaleY: h / (obj.height || 1) });
      fabricCanvas.renderAll();
    });
  });

  // Text properties (Size, Font)
  document.getElementById('prop-font-size')?.addEventListener('change', () => {
    const obj = fabricCanvas?.getActiveObject();
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')) {
      obj.set('fontSize', parseInt(document.getElementById('prop-font-size').value || 32));
      fabricCanvas.renderAll();
    }
  });

  document.getElementById('prop-font-family')?.addEventListener('change', () => {
    const obj = fabricCanvas?.getActiveObject();
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')) {
      obj.set('fontFamily', document.getElementById('prop-font-family').value);
      fabricCanvas.renderAll();
    }
  });

  // Color Pickers & Hex text inputs synchronization
  setupColorSync('prop-fill-color', 'prop-fill-color-hex', 'fill');
  setupColorSync('prop-stroke-color', 'prop-stroke-color-hex', 'stroke');

  document.getElementById('prop-stroke-width')?.addEventListener('change', (e) => {
    const obj = fabricCanvas?.getActiveObject();
    if (obj) {
      obj.set('strokeWidth', parseFloat(e.target.value || 0));
      fabricCanvas.renderAll();
    }
  });

  // Text alignment
  document.querySelectorAll('.text-align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const obj = fabricCanvas?.getActiveObject();
      if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
        obj.set('textAlign', btn.dataset.align);
        fabricCanvas.renderAll();
      }
    });
  });

  // Text style toggles (Bold / Italic)
  document.getElementById('prop-bold')?.addEventListener('click', () => {
    const obj = fabricCanvas?.getActiveObject();
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
      fabricCanvas.renderAll();
    }
  });
  document.getElementById('prop-italic')?.addEventListener('click', () => {
    const obj = fabricCanvas?.getActiveObject();
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
      fabricCanvas.renderAll();
    }
  });

  // Save/Publish handlers
  document.getElementById('editor-save-btn')?.addEventListener('click', saveTemplate);
  document.getElementById('editor-publish-btn')?.addEventListener('click', publishTemplate);

  // Scene blocks
  document.querySelectorAll('.scene-block').forEach(block => {
    block.addEventListener('click', () => {
      document.querySelectorAll('.scene-block').forEach(b => b.classList.remove('active'));
      block.classList.add('active');
    });
  });
}

function setupColorSync(pickerId, hexId, fabricPropName) {
  const picker = document.getElementById(pickerId);
  const hexInput = document.getElementById(hexId);

  const updateColor = (colorVal) => {
    if (!colorVal.startsWith('#')) colorVal = '#' + colorVal;
    if (picker) picker.value = colorVal;
    if (hexInput) hexInput.value = colorVal;

    const obj = fabricCanvas?.getActiveObject();
    if (obj) {
      obj.set(fabricPropName, colorVal);
      fabricCanvas.renderAll();
    }
  };

  picker?.addEventListener('input', (e) => updateColor(e.target.value));
  hexInput?.addEventListener('change', (e) => updateColor(e.target.value));
}

function initFabricCanvas() {
  // Re-create the DOM canvas element inside its wrapper to avoid Fabric.js disposal click freeze
  const wrapper = document.getElementById('editor-canvas-wrapper');
  if (wrapper) {
    wrapper.innerHTML = '<span class="editor-template-name" style="display:none"></span><canvas id="fabric-canvas"></canvas>';
  }

  const canvasEl = document.getElementById('fabric-canvas');
  if (!canvasEl) return;

  if (fabricCanvas) {
    fabricCanvas.dispose();
    fabricCanvas = null;
  }

  const scale = editorZoom / 100;
  const displayW = Math.round((CANVAS_BASE_W / 4) * scale);
  const displayH = Math.round((CANVAS_BASE_H / 4) * scale);

  canvasEl.width = displayW;
  canvasEl.height = displayH;

  fabricCanvas = new fabric.Canvas('fabric-canvas', {
    width: displayW,
    height: displayH,
    backgroundColor: '#1a1a1a',
    selection: true,
    preserveObjectStacking: true,
  });

  const zoomFactor = displayW / CANVAS_BASE_W;
  fabricCanvas.setZoom(zoomFactor);

  // Canvas events
  fabricCanvas.on('selection:created', onObjectSelected);
  fabricCanvas.on('selection:updated', onObjectSelected);
  fabricCanvas.on('selection:cleared', onObjectDeselected);
  fabricCanvas.on('object:modified', onObjectModified);

  // Render format timeline check
  const format = document.getElementById('editor-format')?.value || 'image';
  const timeline = document.querySelector('.scene-timeline');
  if (timeline) timeline.style.display = format === 'video' ? 'flex' : 'none';

  if (currentEditingTemplateId) {
    loadTemplateIntoEditor(currentEditingTemplateId);
  } else {
    templateInputSlots = [];
    renderSlotsManagerList();
    updateLayerPanel();
    updateEditorTitle('New Template');
  }
}

function applyZoom(level) {
  if (!fabricCanvas) return;
  editorZoom = level;
  const scale = level / 100;
  const displayW = Math.round((CANVAS_BASE_W / 4) * scale);
  const displayH = Math.round((CANVAS_BASE_H / 4) * scale);
  fabricCanvas.setDimensions({ width: displayW, height: displayH });
  fabricCanvas.setZoom(displayW / CANVAS_BASE_W);
  fabricCanvas.renderAll();
  const label = document.querySelector('.canvas-size-label');
  if (label) label.textContent = `${CANVAS_BASE_W} × ${CANVAS_BASE_H} • Zoom: ${level}%`;
}

function updateEditorTitle(name) {
  const titleEl = document.querySelector('#page-editor .editor-template-name');
  if (titleEl) titleEl.textContent = name;
}

// ── Toolbar Add Layer Operations ──
function handleToolAction(tool) {
  if (!fabricCanvas) return;
  switch (tool) {
    case 'text': addTextObject(); break;
    case 'image': addImageObject(); break;
    case 'rect': addRectObject(); break;
    case 'circle': addCircleObject(); break;
    case 'line': addLineObject(); break;
    case 'delete': deleteSelected(); break;
  }
}

function addTextObject() {
  const text = new fabric.IText('Text Slot Content', {
    left: CANVAS_BASE_W / 2 - 200,
    top: CANVAS_BASE_H / 2 - 40,
    fontSize: 64,
    fontFamily: 'Inter, sans-serif',
    fill: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    originX: 'left',
    originY: 'top',
    id: 'text_' + Date.now().toString().slice(-4),
    name: 'Text Layer',
  });
  fabricCanvas.add(text);
  fabricCanvas.setActiveObject(text);
  fabricCanvas.renderAll();
  updateLayerPanel();
}

function addImageObject() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      fabric.Image.fromURL(ev.target.result, { crossOrigin: 'anonymous' }).then(img => {
        const maxW = CANVAS_BASE_W * 0.8;
        const maxH = CANVAS_BASE_H * 0.5;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        img.set({
          left: CANVAS_BASE_W / 2 - (img.width * scale) / 2,
          top: CANVAS_BASE_H / 4,
          scaleX: scale,
          scaleY: scale,
          id: 'img_' + Date.now().toString().slice(-4),
          name: 'Image Layer',
        });
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
        updateLayerPanel();
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function addRectObject() {
  const rect = new fabric.Rect({
    left: CANVAS_BASE_W / 2 - 200,
    top: CANVAS_BASE_H / 2 - 50,
    width: 400,
    height: 100,
    fill: '#3B82F6',
    rx: 12,
    ry: 12,
    id: 'rect_' + Date.now().toString().slice(-4),
    name: 'Rect Layer',
  });
  fabricCanvas.add(rect);
  fabricCanvas.setActiveObject(rect);
  fabricCanvas.renderAll();
  updateLayerPanel();
}

function addCircleObject() {
  const circle = new fabric.Circle({
    left: CANVAS_BASE_W / 2 - 60,
    top: CANVAS_BASE_H / 2 - 60,
    radius: 60,
    fill: '#10B981',
    id: 'circle_' + Date.now().toString().slice(-4),
    name: 'Circle Layer',
  });
  fabricCanvas.add(circle);
  fabricCanvas.setActiveObject(circle);
  fabricCanvas.renderAll();
  updateLayerPanel();
}

function addLineObject() {
  const line = new fabric.Line([0, 0, 400, 0], {
    left: CANVAS_BASE_W / 2 - 200,
    top: CANVAS_BASE_H / 2,
    stroke: '#FFFFFF',
    strokeWidth: 3,
    id: 'line_' + Date.now().toString().slice(-4),
    name: 'Line Layer',
  });
  fabricCanvas.add(line);
  fabricCanvas.setActiveObject(line);
  fabricCanvas.renderAll();
  updateLayerPanel();
}

function deleteSelected() {
  const obj = fabricCanvas?.getActiveObject();
  if (obj) {
    fabricCanvas.remove(obj);
    fabricCanvas.renderAll();
    updateLayerPanel();
  }
}

// ── Object Selection ──
function onObjectSelected(e) {
  const obj = e.selected?.[0] || fabricCanvas.getActiveObject();
  if (!obj) return;
  updatePropertiesPanel(obj);
}

function onObjectDeselected() {
  clearPropertiesPanel();
}

function onObjectModified(e) {
  updatePropertiesPanel(e.target);
}

function updatePropertiesPanel(obj) {
  if (!obj) return;
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal('prop-x', Math.round(obj.left || 0));
  setVal('prop-y', Math.round(obj.top || 0));
  setVal('prop-w', Math.round((obj.width || 100) * (obj.scaleX || 1)));
  setVal('prop-h', Math.round((obj.height || 100) * (obj.scaleY || 1)));
  setVal('prop-rotation', Math.round(obj.angle || 0));
  setVal('prop-opacity', Math.round((obj.opacity || 1) * 100));
  setVal('prop-stroke-width', obj.strokeWidth || 0);

  // Sync color pickers & hex values
  const fillVal = obj.fill || '#FFFFFF';
  setVal('prop-fill-color', fillVal.startsWith('#') ? fillVal : '#FFFFFF');
  setVal('prop-fill-color-hex', fillVal);

  const strokeVal = obj.stroke || '#000000';
  setVal('prop-stroke-color', strokeVal.startsWith('#') ? strokeVal : '#000000');
  setVal('prop-stroke-color-hex', strokeVal);

  // Text-specific properties typography panel
  const isText = obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text';
  const textSection = document.getElementById('text-properties-section');
  if (textSection) textSection.style.display = isText ? 'block' : 'none';
  if (isText) {
    setVal('prop-font-size', obj.fontSize || 32);
    setVal('prop-font-family', obj.fontFamily || 'Inter, sans-serif');
  }
}

function clearPropertiesPanel() {
  ['prop-x', 'prop-y', 'prop-w', 'prop-h', 'prop-rotation', 'prop-opacity', 'prop-stroke-width', 'prop-fill-color-hex', 'prop-stroke-color-hex'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const textSection = document.getElementById('text-properties-section');
  if (textSection) textSection.style.display = 'none';
}

// ── Slots Manager UI Renderer ──
function renderSlotsManagerList() {
  const container = document.getElementById('slots-manager-list');
  if (!container) return;

  if (!templateInputSlots.length) {
    container.innerHTML = '<div style="color:#666;font-size:12px;text-align:center;padding:12px 0;">No input slots defined yet.</div>';
    return;
  }

  // Get active canvas objects to populate target selection link
  const objects = fabricCanvas ? fabricCanvas.getObjects() : [];
  const objectOptions = objects.map(o => {
    const id = o.id || o.name || 'unnamed';
    const label = `${o.type} (${id})`;
    return `<option value="${id}">${label}</option>`;
  }).join('');

  container.innerHTML = templateInputSlots.map((slot, index) => {
    const isTextType = slot.type === 'text' || slot.type === 'select';
    const isSelectType = slot.type === 'select';
    return `
      <div class="slot-manager-item" data-index="${index}" style="padding:10px;background:var(--bg-input);border-radius:6px;border:1px solid rgba(0,0,0,0.06);display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;justify-content:between;align-items:center;width:100%">
          <span style="font-size:12px;font-weight:700;color:var(--text-secondary)">Slot #${index + 1}</span>
          <button class="layer-action-btn" onclick="deleteSlot(${index})" style="margin-left:auto;color:var(--error)" title="Remove Slot">🗑</button>
        </div>
        <div class="prop-row">
          <div class="prop-field">
            <span class="prop-label">Slot ID</span>
            <input type="text" class="prop-input slot-id-input" value="${slot.slot_id}" placeholder="headline">
          </div>
          <div class="prop-field">
            <span class="prop-label">Label</span>
            <input type="text" class="prop-input slot-label-input" value="${slot.label}" placeholder="Headline">
          </div>
        </div>
        <div class="prop-row">
          <div class="prop-field">
            <span class="prop-label">Type</span>
            <select class="prop-input slot-type-select">
              <option value="text" ${slot.type === 'text' ? 'selected' : ''}>Text</option>
              <option value="image" ${slot.type === 'image' ? 'selected' : ''}>Image</option>
              <option value="audio" ${slot.type === 'audio' ? 'selected' : ''}>Audio</option>
              <option value="video" ${slot.type === 'video' ? 'selected' : ''}>Video</option>
              <option value="select" ${slot.type === 'select' ? 'selected' : ''}>Select</option>
              <option value="date" ${slot.type === 'date' ? 'selected' : ''}>Date</option>
              <option value="color" ${slot.type === 'color' ? 'selected' : ''}>Color</option>
            </select>
          </div>
          <div class="prop-field">
            <span class="prop-label">Linked Canvas Object</span>
            <select class="prop-input slot-link-select">
              <option value="">(None)</option>
              ${objects.map(o => {
                const id = o.id || o.name || 'unnamed';
                const label = `${o.type} (${id})`;
                const selected = slot.target_object_id === id ? 'selected' : '';
                return `<option value="${id}" ${selected}>${label}</option>`;
              }).join('')}
            </select>
          </div>
        </div>
        
        <div class="slot-customization-area" style="display:${isTextType ? 'block' : 'none'}">
          ${isSelectType ? `
            <div class="prop-field">
              <span class="prop-label">Options (comma separated)</span>
              <input type="text" class="prop-input slot-options-input" value="${(slot.options || []).join(', ')}" placeholder="Breaking, Sports, Politics">
            </div>
          ` : `
            <div class="prop-field">
              <span class="prop-label">Max Length</span>
              <input type="number" class="prop-input slot-max-input" value="${slot.constraints?.max_length || slot.max_chars || 80}">
            </div>
          `}
        </div>

        <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
          <input type="checkbox" class="slot-required-input" ${slot.constraints?.required || slot.required ? 'checked' : ''} style="width:14px;height:14px;accent-color:var(--accent)">
          <span class="prop-label" style="margin:0">Required Field</span>
        </div>
      </div>
    `;
  }).join('');

  // Bind change listeners to slot items
  container.querySelectorAll('.slot-manager-item').forEach(item => {
    const index = parseInt(item.dataset.index);
    const slot = templateInputSlots[index];

    const updateSlot = () => {
      slot.slot_id = item.querySelector('.slot-id-input').value.trim();
      slot.label = item.querySelector('.slot-label-input').value.trim();
      slot.type = item.querySelector('.slot-type-select').value;
      slot.target_object_id = item.querySelector('.slot-link-select').value;

      const isReq = item.querySelector('.slot-required-input').checked;
      slot.required = isReq;

      if (!slot.constraints) slot.constraints = {};
      slot.constraints.required = isReq;

      if (slot.type === 'select') {
        const optsVal = item.querySelector('.slot-options-input')?.value || '';
        slot.options = optsVal.split(',').map(s => s.trim()).filter(Boolean);
        slot.constraints.options = slot.options;
      } else {
        const maxVal = parseInt(item.querySelector('.slot-max-input')?.value || 80);
        slot.max_chars = maxVal;
        slot.constraints.max_length = maxVal;
      }

      // Re-link onto fabric Canvas object for backward compatibility
      if (fabricCanvas) {
        const targetObj = fabricCanvas.getObjects().find(o => o.id === slot.target_object_id);
        if (targetObj) {
          targetObj.slot_config = {
            slot_id: slot.slot_id,
            label: slot.label,
            type: slot.type,
            max_chars: slot.max_chars || 80,
            required: slot.required,
            placeholder: slot.placeholder || ''
          };
        }
      }
    };

    item.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', () => {
        updateSlot();
        // Refresh UI only if type dropdown changed to toggle custom inputs
        if (input.classList.contains('slot-type-select')) {
          renderSlotsManagerList();
        }
      });
    });
  });
}

function deleteSlot(index) {
  templateInputSlots.splice(index, 1);
  renderSlotsManagerList();
}

// ── Layer Panel ──
function updateLayerPanel() {
  const list = document.getElementById('layers-list');
  if (!list || !fabricCanvas) return;

  const objects = fabricCanvas.getObjects();
  if (!objects.length) {
    list.innerHTML = '<div style="color:#666;padding:12px;text-align:center;font-size:13px">No layers — add objects from toolbar</div>';
    return;
  }

  list.innerHTML = objects.slice().reverse().map((obj, i) => {
    const realIndex = objects.length - 1 - i;
    const typeIcon = getTypeIcon(obj.type);
    const name = obj.name || obj.type || 'Object';
    const isSlot = !!obj.slot_config;
    const isActive = fabricCanvas.getActiveObject() === obj;
    return `
      <div class="layer-item ${isActive ? 'active' : ''} ${isSlot ? 'input-slot' : ''}" data-index="${realIndex}">
        <span class="layer-icon">${typeIcon}</span>
        <span class="layer-name">${name}</span>
        <div class="layer-actions">
          <button class="layer-action-btn" onclick="event.stopPropagation(); moveLayer(${realIndex}, 'up')" title="Move Up">↑</button>
          <button class="layer-action-btn" onclick="event.stopPropagation(); moveLayer(${realIndex}, 'down')" title="Move Down">↓</button>
          <button class="layer-action-btn" onclick="event.stopPropagation(); removeLayer(${realIndex})" title="Delete">🗑</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.layer-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index);
      const obj = fabricCanvas.item(idx);
      if (obj) {
        fabricCanvas.setActiveObject(obj);
        fabricCanvas.renderAll();
        updateLayerPanel();
      }
    });
  });
}

function getTypeIcon(type) {
  switch (type) {
    case 'i-text': case 'textbox': case 'text': return 'T';
    case 'image': return '🖼️';
    case 'rect': return '⬜';
    case 'circle': return '⭕';
    case 'line': return '—';
    default: return '◆';
  }
}

function moveLayer(index, direction) {
  if (!fabricCanvas) return;
  const obj = fabricCanvas.item(index);
  if (!obj) return;
  if (direction === 'up') fabricCanvas.bringForward(obj);
  else fabricCanvas.sendBackwards(obj);
  fabricCanvas.renderAll();
  updateLayerPanel();
}

function removeLayer(index) {
  if (!fabricCanvas) return;
  const obj = fabricCanvas.item(index);
  if (obj) {
    fabricCanvas.remove(obj);
    fabricCanvas.renderAll();
    updateLayerPanel();
  }
}

// ── Save / Publish ──
async function saveTemplate() {
  if (!fabricCanvas) return;

  const name = document.getElementById('editor-template-name-input')?.value?.trim() || 'Untitled Template';
  const category = document.getElementById('editor-category')?.value || 'breaking_news';
  const format = document.getElementById('editor-format')?.value || 'image';
  const pricing = document.getElementById('editor-pricing')?.value || 'free';
  const aspectRatio = document.getElementById('editor-aspect-ratio')?.value || 'story';

  // Build Fabric.js JSON
  const fabricJSON = fabricCanvas.toJSON(['id', 'name', 'slot_config']);

  // Generate background color/gradient
  const bgColor = fabricCanvas.backgroundColor || '#1a1a1a';

  const templateData = {
    name,
    category,
    format,
    pricing,
    output_sizes: {
      story: { width: 1080, height: 1920 },
      post: { width: 1080, height: 1080 },
      landscape: { width: 1920, height: 1080 },
    },
    canvas_data: {
      fabricJSON,
      background: bgColor,
      gradient: `linear-gradient(135deg, ${bgColor}, ${bgColor})`,
      version: '2.0',
      fabric_version: fabric.version || '6.x',
      canvas_width: CANVAS_BASE_W,
      canvas_height: CANVAS_BASE_H,
      aspect_ratio: aspectRatio,
    },
    input_slots: templateInputSlots, // Save directly from Slots Manager array
    tags: [category.replace('_', ' ')],
    supported_languages: ['en', 'hi'],
    sort_order: 0,
  };

  try {
    let result;
    if (currentEditingTemplateId) {
      result = await AdminTemplatesAPI.update(currentEditingTemplateId, templateData);
      showAdminToast('✓', 'Template updated');
    } else {
      result = await AdminTemplatesAPI.create(templateData);
      currentEditingTemplateId = result.id;
      showAdminToast('✓', 'Template created');
    }

    // Generate and upload thumbnail
    try {
      await generateAndUploadThumbnail(result.id);
    } catch (e) {
      console.warn('Thumbnail generation skipped:', e.message);
    }
    return result;
  } catch (err) {
    showAdminToast('❌', err.message || 'Save failed');
    throw err;
  }
}

async function publishTemplate() {
  try {
    const result = await saveTemplate();
    const templateId = currentEditingTemplateId || result?.id;
    if (templateId) {
      await AdminTemplatesAPI.updateStatus(templateId, 'published');
      showAdminToast('✓', 'Template published — visible in mobile app');
    }
  } catch (err) {
    showAdminToast('❌', err.message || 'Publish failed');
  }
}

async function generateAndUploadThumbnail(templateId) {
  if (!fabricCanvas) return;
  // Export canvas as PNG blob
  const dataUrl = fabricCanvas.toDataURL({ format: 'png', multiplier: 0.5 });
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], 'thumbnail.png', { type: 'image/png' });

  try {
    const asset = await AdminTemplatesAPI.uploadAsset(templateId, file, 'background');
    // Update template thumbnail_url
    await AdminTemplatesAPI.update(templateId, { thumbnail_url: asset.r2_url });
  } catch (e) {
    console.warn('Thumbnail upload failed (storage may not be configured):', e.message);
  }
}

// ── Load Template ──
async function loadTemplateIntoEditor(templateId) {
  try {
    const template = await AdminTemplatesAPI.get(templateId);
    if (!template) return;

    updateEditorTitle(template.name);

    // Fill metadata fields
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('editor-template-name-input', template.name);
    setVal('editor-category', template.category);
    setVal('editor-format', template.format);
    setVal('editor-pricing', template.pricing);

    // Set aspect ratio from saved properties
    const savedRatio = template.canvas_data?.aspect_ratio || 'story';
    setVal('editor-aspect-ratio', savedRatio);
    if (savedRatio === 'story') {
      CANVAS_BASE_W = 1080;
      CANVAS_BASE_H = 1920;
    } else if (savedRatio === 'post') {
      CANVAS_BASE_W = 1080;
      CANVAS_BASE_H = 1080;
    } else if (savedRatio === 'landscape') {
      CANVAS_BASE_W = 1920;
      CANVAS_BASE_H = 1080;
    }
    applyZoom(editorZoom);

    // Load Fabric.js canvas state
    if (template.canvas_data?.fabricJSON) {
      const done = () => {
        fabricCanvas.renderAll();
        updateLayerPanel();
      };
      try {
        const res = fabricCanvas.loadFromJSON(template.canvas_data.fabricJSON, done);
        if (res && typeof res.then === 'function') {
          res.then(done);
        }
      } catch (e) {
        console.error('[AdminEditor] loadFromJSON error:', e);
      }
    } else if (template.canvas_data?.background) {
      fabricCanvas.backgroundColor = template.canvas_data.background;
      fabricCanvas.renderAll();
    }

    // Populate slots array
    templateInputSlots = template.input_slots || [];
    renderSlotsManagerList();

    // Show format timeline check
    const timeline = document.querySelector('.scene-timeline');
    if (timeline) timeline.style.display = template.format === 'video' ? 'flex' : 'none';

  } catch (err) {
    showAdminToast('❌', 'Failed to load template: ' + err.message);
  }
}

// ================================================================
// ANALYTICS
// ================================================================
function initAnalytics() {
  document.getElementById('analytics-tabs')?.addEventListener('click', (e) => {
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

async function renderAnalytics() {
  // Try loading from API first, fall back to placeholder charts
  try {
    const [overview, aiUsage] = await Promise.all([
      AnalyticsAPI.getOverview().catch(() => null),
      AnalyticsAPI.getAIUsage().catch(() => null),
    ]);

    if (overview) {
      renderExportsChart(overview);
      renderCategoriesChart(overview);
    } else {
      renderExportsChartFallback();
      renderCategoriesChartFallback();
    }

    if (aiUsage) {
      renderAIUsageChart(aiUsage);
    } else {
      renderAIUsageChartFallback();
    }
  } catch {
    renderExportsChartFallback();
    renderCategoriesChartFallback();
    renderAIUsageChartFallback();
  }

  renderTemplatePerformance();
  renderNewUsersChart();
  renderVoiceLanguagesChart();
  renderScriptTonesChart();
}

function renderExportsChartFallback() {
  const container = document.getElementById('exports-chart');
  if (!container) return;
  const data = [
    { label: 'Mon', value: 0 }, { label: 'Tue', value: 0 },
    { label: 'Wed', value: 0 }, { label: 'Thu', value: 0 },
    { label: 'Fri', value: 0 }, { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 },
  ];
  renderBarChart(container, data, '#3B82F6');
}

function renderExportsChart(overview) {
  const container = document.getElementById('exports-chart');
  if (!container) return;
  // Use whatever data is available from overview
  const data = [
    { label: 'Today', value: overview.total_exports_today || 0 },
  ];
  renderBarChart(container, data, '#3B82F6');
}

function renderCategoriesChartFallback() {
  const container = document.getElementById('categories-chart');
  if (!container) return;
  container.innerHTML = '<div style="color:#666;padding:24px;text-align:center">No category data yet</div>';
}

function renderCategoriesChart(overview) {
  renderCategoriesChartFallback();
}

function renderAIUsageChartFallback() {
  const container = document.getElementById('ai-usage-chart');
  if (!container) return;
  container.innerHTML = '<div style="color:#666;padding:24px;text-align:center">No AI usage data yet</div>';
}

function renderAIUsageChart(data) {
  renderAIUsageChartFallback();
}

function renderBarChart(container, data, color = '#3B82F6') {
  const max = Math.max(...data.map(d => d.value), 1);
  container.innerHTML = data.map(d => `
    <div class="bar-chart-col">
      <div class="bar-chart-bar" style="height:${(d.value / max) * 100}%;background:${color}">
        <span class="bar-chart-value">${d.value}</span>
      </div>
      <span class="bar-chart-label">${d.label}</span>
    </div>
  `).join('');
}

async function renderTemplatePerformance() {
  const tbody = document.getElementById('template-performance-table');
  if (!tbody) return;
  try {
    const stats = await AnalyticsAPI.getTemplateStats();
    if (!stats?.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;padding:16px">No template data</td></tr>';
      return;
    }
    const sorted = stats.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    tbody.innerHTML = sorted.slice(0, 10).map(t => `
      <tr>
        <td><div class="table-thumb" style="background:${t.canvas_data?.gradient || '#3B82F6'}">📰</div></td>
        <td class="table-name">${t.name}</td>
        <td style="font-family:var(--font-mono)">${(t.download_count || 0).toLocaleString()}</td>
        <td style="font-family:var(--font-mono)">—</td>
        <td><span style="font-family:var(--font-mono);color:var(--success);font-weight:600">—</span></td>
      </tr>
    `).join('');
  } catch {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;padding:16px">Failed to load</td></tr>';
  }
}

function renderNewUsersChart() {
  const container = document.getElementById('new-users-chart');
  if (!container) return;
  container.innerHTML = '<div style="color:#666;padding:24px;text-align:center">User metrics will populate with usage</div>';
}

function renderVoiceLanguagesChart() {
  const container = document.getElementById('voice-languages-chart');
  if (!container) return;
  container.innerHTML = '<div style="color:#666;padding:24px;text-align:center">Voice usage data will populate with usage</div>';
}

function renderScriptTonesChart() {
  const container = document.getElementById('script-tones-chart');
  if (!container) return;
  container.innerHTML = '<div style="color:#666;padding:24px;text-align:center">Script tone data will populate with usage</div>';
}

// ================================================================
// USER MANAGEMENT
// ================================================================
function initUsers() {
  document.getElementById('user-search')?.addEventListener('input', renderUsersTable);
}

async function renderUsersTable() {
  const search = document.getElementById('user-search')?.value?.toLowerCase() || '';

  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
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
        <td style="font-family:var(--font-mono)">—</td>
        <td style="font-family:var(--font-mono)">—</td>
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
  if (!toast) return;
  document.getElementById('admin-toast-icon').textContent = icon;
  document.getElementById('admin-toast-message').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ================================================================
// UTILITIES
// ================================================================
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
