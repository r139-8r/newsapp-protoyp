/* ================================================================
   NewsForge Mobile — App Logic & Router
   Mock data replaced with real API calls via api.js
   ================================================================ */

// ── App State ──
const state = {
  currentScreen: null,
  selectedTemplate: null,
  hasVoiceAttached: false,
  isPlaying: false,
  generatedScript: '',
  currentVoiceBlobUrl: null,   // Blob URL from voice generation
  currentAudioEl: null,        // HTMLAudioElement for playback
  currentProjectId: null,      // ID of the project being edited
  availableVoices: [],         // Loaded from API
  templateCache: [],           // OTA-synced templates
  fabricPreviewCanvas: null,   // Fabric.js canvas for fill screen preview
  slotValues: {},              // User-filled input slot values
  fillData: {
    headline: '',
    source: '',
    date: '',
    category: 'breaking',
    hasImage: false,
  }
};

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', async () => {
  await checkAppConfig();  // Check maintenance mode first
  initSplash();
  initOnboarding();
  initAuth();
  initHome();
  initNavigation();
  initFillScreen();
  initAITools();
  initScriptWriter();
  initVoiceGenerator();
  initExport();
  initProjects();
  initProfile();
});

// ================================================================
// SPLASH SCREEN
// ================================================================
function initSplash() {
  setTimeout(() => {
    document.getElementById('splash-screen').classList.add('hide');
    const hasSeenOnboarding = localStorage.getItem('nf_onboarded');
    const isLoggedIn = localStorage.getItem('nf_logged_in');

    if (!hasSeenOnboarding) {
      showOnboarding();
    } else if (!isLoggedIn) {
      showAuth();
    } else {
      showMainApp();
    }
  }, 2000);
}

// ================================================================
// ONBOARDING
// ================================================================
let currentSlide = 0;

function showOnboarding() {
  document.getElementById('onboarding-screen').style.display = 'flex';
}

function initOnboarding() {
  const nextBtn = document.getElementById('onboarding-next-btn');
  const skipBtn = document.getElementById('onboarding-skip-btn');

  nextBtn.addEventListener('click', () => {
    if (currentSlide < 2) {
      setSlide(currentSlide + 1);
    } else {
      localStorage.setItem('nf_onboarded', 'true');
      document.getElementById('onboarding-screen').style.display = 'none';
      showAuth();
    }
  });

  skipBtn.addEventListener('click', () => {
    localStorage.setItem('nf_onboarded', 'true');
    document.getElementById('onboarding-screen').style.display = 'none';
    showAuth();
  });

  // Swipe support
  let touchStartX = 0;
  const carousel = document.querySelector('.onboarding-carousel');
  carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  carousel.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < 2) setSlide(currentSlide + 1);
      if (diff < 0 && currentSlide > 0) setSlide(currentSlide - 1);
    }
  });
}

function setSlide(index) {
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.onboarding-dot');
  const btn = document.getElementById('onboarding-next-btn');

  slides[currentSlide].classList.remove('active');
  slides[currentSlide].classList.add('exit-left');
  dots[currentSlide].classList.remove('active');

  currentSlide = index;

  setTimeout(() => {
    slides.forEach(s => s.classList.remove('exit-left'));
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }, 50);

  btn.textContent = currentSlide === 2 ? 'Get Started' : 'Next';
}

// ================================================================
// AUTH
// ================================================================
function showAuth() {
  document.getElementById('auth-screen').style.display = 'flex';
}

function initAuth() {
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.tab === 'login';
      document.getElementById('login-form').classList.toggle('hidden', !isLogin);
      document.getElementById('register-form').classList.toggle('hidden', isLogin);
    });
  });

  // Google sign in — fires Firebase popup then exchanges token with backend
  document.getElementById('google-sign-in-btn').addEventListener('click', async () => {
    const btn = document.getElementById('google-sign-in-btn');
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    try {
      // Firebase Google sign-in (firebase must be initialized in index.html)
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const idToken = await result.user.getIdToken();
        await AuthAPI.loginWithGoogle(idToken);
        await completeAuth();
      } else {
        // Fallback for development without Firebase
        showToast('⚠️', 'Google sign-in requires Firebase configuration');
      }
    } catch (err) {
      showToast('❌', err.message || 'Google sign-in failed');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Continue with Google';
    }
  });

  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value || '';
    const password = document.getElementById('login-password')?.value || '';
    const btn = e.target.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
    try {
      await AuthAPI.loginWithEmail(email, password);
      await completeAuth();
    } catch (err) {
      showToast('❌', err.message || 'Login failed. Check your credentials.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
    }
  });

  // Register form
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name')?.value || '';
    const email = document.getElementById('register-email')?.value || '';
    const password = document.getElementById('register-password')?.value || '';
    const btn = e.target.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
    try {
      await AuthAPI.registerWithEmail(name, email, password);
      await completeAuth();
    } catch (err) {
      showToast('❌', err.message || 'Registration failed.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
    }
  });
}

async function completeAuth() {
  document.getElementById('auth-screen').style.display = 'none';
  await showMainApp();
}

// ================================================================
// MAIN APP & NAVIGATION
// ================================================================
async function showMainApp() {
  document.getElementById('bottom-nav').style.display = 'flex';
  // OTA sync templates in background (non-blocking)
  performOTASync().then(() => {
    if (state.currentScreen === 'home') renderTemplateGrid();
  });
  navigate('home');
}

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      navigate(screen);
    });
  });
}

function navigate(screen) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  // Map nav names to screen IDs
  const screenMap = {
    'home': 'home-screen',
    'projects': 'projects-screen',
    'ai-tools': 'ai-tools-screen',
    'profile': 'profile-screen',
  };

  const screenId = screenMap[screen] || screen;
  const el = document.getElementById(screenId);
  if (el) {
    el.style.display = 'block';
    // Force reflow then activate
    void el.offsetHeight;
    el.classList.add('active');
  }

  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-screen="${screen}"]`);
  if (navItem) navItem.classList.add('active');

  // Show/hide bottom nav
  const noNavScreens = ['preview-screen', 'fill-screen', 'script-screen', 'voice-screen', 'export-screen'];
  const nav = document.getElementById('bottom-nav');
  if (noNavScreens.includes(screenId)) {
    nav.style.display = 'none';
  } else {
    nav.style.display = 'flex';
  }

  state.currentScreen = screen;

  // Render content
  if (screen === 'home') renderTemplateGrid();
  if (screen === 'projects') renderProjects();
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  const el = document.getElementById(screenId);
  if (el) {
    el.style.display = 'block';
    void el.offsetHeight;
    el.classList.add('active');
  }

  // Hide nav for sub-screens
  const nav = document.getElementById('bottom-nav');
  const noNav = ['preview-screen', 'fill-screen', 'script-screen', 'voice-screen', 'export-screen'];
  nav.style.display = noNav.includes(screenId) ? 'none' : 'flex';
}

// ================================================================
// HOME / TEMPLATE BROWSER
// ================================================================
let activeCategory = 'all';

function initHome() {
  // Category pills
  document.getElementById('category-pills').addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeCategory = pill.dataset.category;
    renderTemplateGrid();
  });

  // Search
  document.getElementById('template-search').addEventListener('input', (e) => {
    renderTemplateGrid(e.target.value.toLowerCase());
  });
}

async function renderTemplateGrid(search = '') {
  const grid = document.getElementById('template-grid');

  // Show skeleton while loading
  grid.innerHTML = '<div style="color:#888;text-align:center;padding:40px;grid-column:1/-1">Loading templates...</div>';

  try {
    const response = await TemplatesAPI.list(
      activeCategory !== 'all' ? activeCategory : null,
      search || null,
    );
    const templates = response?.templates || [];
    // Cache locally for offline support
    state.templateCache = templates;

    if (!templates.length) {
      grid.innerHTML = '<div style="color:#888;text-align:center;padding:40px;grid-column:1/-1">No templates found</div>';
      return;
    }

    grid.innerHTML = templates.map(t => {
      const canvasData = t.canvas_data || {};
      const gradient = canvasData.gradient || canvasData.background || 'linear-gradient(135deg,#1F2937,#111827)';
      const outputSizes = t.output_sizes || {};
      const sizes = Object.keys(outputSizes);
      const firstSize = sizes[0] || 'story';
      const thumbnailStyle = t.thumbnail_url
        ? `background-image:url(${t.thumbnail_url});background-size:cover;background-position:center`
        : `background:${gradient}`;
      return `
      <div class="template-card" data-id="${t.id}">
        <div class="template-card-thumb" style="${thumbnailStyle}">
          <div class="template-card-badges">
            <span class="badge badge-format ${t.format === 'video' ? 'video' : ''}">${t.format}</span>
            <span class="badge badge-size">${firstSize}</span>
            ${t.pricing === 'free' ? '' : '<span class="badge badge-new">Pro ⭐</span>'}
          </div>
          ${t.thumbnail_url ? '' : '<span style="font-size:48px;opacity:0.5;position:absolute;bottom:30%;left:50%;transform:translateX(-50%)">📰</span>'}
        </div>
        <div class="template-card-info">
          <div class="template-card-name">${t.name}</div>
          <div class="template-card-meta">${capitalize(t.category)} • ${firstSize}</div>
        </div>
      </div>`;
    }).join('');

    // Card click handlers
    grid.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        openTemplatePreview(card.dataset.id);
      });
    });
  } catch (err) {
    // Fallback to local cache on network failure
    const cached = TemplatesAPI.getLocalCache();
    if (cached.length) {
      state.templateCache = cached;
      grid.innerHTML = '<div style="color:#F59E0B;text-align:center;padding:8px;grid-column:1/-1;font-size:12px">Showing cached templates (offline)</div>';
      renderTemplateGridFromCache(cached, search);
    } else {
      grid.innerHTML = `<div style="color:#EF4444;text-align:center;padding:40px;grid-column:1/-1">Failed to load templates. ${err.message}</div>`;
    }
  }
}

function renderTemplateGridFromCache(templates, search = '') {
  const grid = document.getElementById('template-grid');
  let filtered = templates;
  if (activeCategory !== 'all') filtered = filtered.filter(t => t.category === activeCategory);
  if (search) filtered = filtered.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  if (!filtered.length) {
    grid.innerHTML += '<div style="color:#888;text-align:center;padding:40px;grid-column:1/-1">No templates found</div>';
    return;
  }
  grid.innerHTML += filtered.map(t => {
    const gradient = t.canvas_data?.gradient || '#1F2937';
    return `<div class="template-card" data-id="${t.id}">
      <div class="template-card-thumb" style="background:${gradient}">
        <span style="font-size:48px;opacity:0.5;position:absolute;bottom:30%;left:50%;transform:translateX(-50%)">📰</span>
      </div>
      <div class="template-card-info">
        <div class="template-card-name">${t.name}</div>
        <div class="template-card-meta">${capitalize(t.category)}</div>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => openTemplatePreview(card.dataset.id));
  });
}

// ================================================================
// TEMPLATE PREVIEW
// ================================================================
async function openTemplatePreview(id) {
  showScreen('preview-screen');
  document.getElementById('preview-title').textContent = 'Loading...';

  try {
    const template = await TemplatesAPI.get(id);
    state.selectedTemplate = template;

    document.getElementById('preview-title').textContent = template.name;
    document.getElementById('preview-format').textContent = capitalize(template.format);
    document.getElementById('preview-category').textContent = capitalize(template.category);
    const outputSizes = template.output_sizes || {};
    const sizes = Object.keys(outputSizes);
    document.getElementById('preview-size').textContent = sizes.join(', ') || 'Story';
    const langs = (template.supported_languages || ['en']).join(', ').toUpperCase();
    document.getElementById('preview-languages').textContent = langs;
    document.getElementById('preview-description').textContent =
      `Professional ${template.category.replace('_', ' ')} template in ${template.format} format. Perfect for social media and news broadcasting.`;

    // Preview hero
    const hero = document.getElementById('preview-hero');
    if (template.thumbnail_url) {
      hero.style.backgroundImage = `url(${template.thumbnail_url})`;
      hero.style.backgroundSize = 'cover';
    } else {
      const gradient = template.canvas_data?.gradient || template.canvas_data?.background || '#1F2937';
      hero.style.background = gradient;
    }
    hero.innerHTML = '';

    // Badges
    const badgesEl = document.getElementById('preview-badges');
    badgesEl.innerHTML = `
      <span class="badge badge-format ${template.format === 'video' ? 'video' : ''}">${template.format}</span>
      ${sizes.map(s => `<span class="badge badge-size">${s}</span>`).join('')}
      <span class="badge badge-free">${template.pricing === 'free' ? 'Free' : 'Pro'}</span>
    `;

    // Back button
    document.getElementById('preview-back-btn').onclick = () => navigate('home');
    // Use Template button
    document.getElementById('use-template-btn').onclick = () => openFillScreen(template);

  } catch (err) {
    showToast('❌', 'Failed to load template');
    navigate('home');
  }
}

// ================================================================
// FILL SCREEN (Fabric.js Canvas + Dynamic Form)
// ================================================================
function initFillScreen() {
  const exportBtn = document.getElementById('fill-export-btn');
  const aiBtn = document.getElementById('fill-ai-btn');

  // Export button
  exportBtn.addEventListener('click', () => openExportScreen());

  // AI Tools button
  aiBtn.addEventListener('click', () => navigate('ai-tools'));

  // Back
  document.getElementById('fill-back-btn').addEventListener('click', () => {
    // Dispose preview canvas on exit
    if (state.fabricPreviewCanvas) {
      state.fabricPreviewCanvas.dispose();
      state.fabricPreviewCanvas = null;
    }
    showScreen('preview-screen');
  });
}

function openFillScreen(template) {
  state.selectedTemplate = template;
  state.slotValues = {};
  document.getElementById('fill-template-name').textContent = template.name;

  showScreen('fill-screen');

  // Initialize Fabric.js preview canvas
  initFillCanvas(template);

  // Generate dynamic form from input_slots
  generateDynamicForm(template);

  // Voice indicator
  document.getElementById('voice-indicator-container').style.display = state.hasVoiceAttached ? 'block' : 'none';

  // Enable export immediately (user can export with defaults)
  document.getElementById('fill-export-btn').disabled = false;
}

function initFillCanvas(template) {
  const container = document.getElementById('fill-canvas');
  if (!container) return;

  // Dispose previous
  if (state.fabricPreviewCanvas) {
    state.fabricPreviewCanvas.dispose();
    state.fabricPreviewCanvas = null;
  }

  // Recreate the DOM element to avoid Fabric.js canvas reuse bugs
  container.innerHTML = '<canvas id="fabric-preview-canvas"></canvas>';
  const canvasEl = document.getElementById('fabric-preview-canvas');
  if (!canvasEl) return;

  // Size the canvas to fit the container while maintaining aspect ratio
  const containerW = container.clientWidth || 300;
  const canvasBaseW = template.canvas_data?.canvas_width || 1080;
  const canvasBaseH = template.canvas_data?.canvas_height || 1920;
  const aspectRatio = canvasBaseH / canvasBaseW;
  const displayW = containerW;
  const displayH = Math.round(containerW * aspectRatio);

  canvasEl.width = displayW;
  canvasEl.height = displayH;

  state.fabricPreviewCanvas = new fabric.StaticCanvas('fabric-preview-canvas', {
    width: displayW,
    height: displayH,
    backgroundColor: template.canvas_data?.background || '#1a1a1a',
  });

  const zoomFactor = displayW / canvasBaseW;
  state.fabricPreviewCanvas.setZoom(zoomFactor);

  // Load canvas data if available
  if (template.canvas_data?.fabricJSON) {
    const done = () => {
      state.fabricPreviewCanvas.renderAll();
    };
    try {
      const res = state.fabricPreviewCanvas.loadFromJSON(template.canvas_data.fabricJSON, done);
      if (res && typeof res.then === 'function') {
        res.then(done);
      }
    } catch (e) {
      console.error('[FillCanvas] loadFromJSON error:', e);
    }
  } else {
    // Fallback: show gradient background with a placeholder
    const bg = template.canvas_data?.gradient || template.canvas_data?.background || '#1F2937';
    state.fabricPreviewCanvas.backgroundColor = template.canvas_data?.background || '#1a1a1a';
    state.fabricPreviewCanvas.renderAll();
  }
}

function generateDynamicForm(template) {
  const container = document.getElementById('fill-dynamic-fields');
  if (!container) return;

  const inputSlots = template.input_slots || [];

  // If template has no input_slots, show a minimal headline+source form
  if (!inputSlots.length) {
    container.innerHTML = `
      <div class="input-group">
        <label>Headline</label>
        <input type="text" id="fill-slot-headline" placeholder="Enter your headline..." maxlength="80" data-slot-id="headline">
        <span class="char-counter">0/80</span>
      </div>
      <div class="input-group">
        <label>Source</label>
        <input type="text" id="fill-slot-source" placeholder="e.g., NewsForge Media" data-slot-id="source">
      </div>
    `;
    bindSlotListeners(container);
    return;
  }

  // Generate form fields from input_slots
  container.innerHTML = inputSlots.map(slot => {
    const slotId = slot.slot_id || slot.id;
    const label = slot.label || slotId;
    const type = slot.type || 'text';
    const maxChars = slot.constraints?.max_length || slot.max_chars || 200;
    const placeholder = slot.constraints?.placeholder || slot.placeholder || `Enter ${label.toLowerCase()}...`;
    const required = slot.constraints?.required || slot.required || false;

    if (type === 'text') {
      return `
        <div class="input-group">
          <label>${label}${required ? ' *' : ''}</label>
          <input type="text" id="fill-slot-${slotId}" placeholder="${placeholder}" maxlength="${maxChars}" data-slot-id="${slotId}" data-target="${slot.target_object_id || slotId}">
          <span class="char-counter">0/${maxChars}</span>
        </div>
      `;
    } else if (type === 'image') {
      return `
        <div class="input-group">
          <label>${label}</label>
          <div class="image-picker" id="fill-image-picker-${slotId}" data-slot-id="${slotId}" data-target="${slot.target_object_id || slotId}">
            <input type="file" accept="image/*" id="fill-image-input-${slotId}" style="display:none">
            <span class="image-picker-icon">📷</span>
            <span class="image-picker-text">Tap to upload photo</span>
          </div>
        </div>
      `;
    } else if (type === 'select') {
      const options = slot.options || [];
      return `
        <div class="input-group">
          <label>${label}</label>
          <select id="fill-slot-${slotId}" data-slot-id="${slotId}" data-target="${slot.target_object_id || slotId}">
            ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
          </select>
        </div>
      `;
    } else if (type === 'date') {
      return `
        <div class="input-group">
          <label>${label}</label>
          <input type="date" id="fill-slot-${slotId}" data-slot-id="${slotId}" data-target="${slot.target_object_id || slotId}" value="${new Date().toISOString().split('T')[0]}">
        </div>
      `;
    } else {
      return `
        <div class="input-group">
          <label>${label}</label>
          <input type="text" id="fill-slot-${slotId}" placeholder="${placeholder}" data-slot-id="${slotId}" data-target="${slot.target_object_id || slotId}">
        </div>
      `;
    }
  }).join('');

  bindSlotListeners(container);
}

function bindSlotListeners(container) {
  // Text inputs — update canvas + char counter
  container.querySelectorAll('input[type="text"]').forEach(input => {
    const counter = input.parentElement.querySelector('.char-counter');
    input.addEventListener('input', () => {
      const slotId = input.dataset.slotId;
      const targetId = input.dataset.target || slotId;
      state.slotValues[slotId] = input.value;

      if (counter) {
        const max = input.maxLength || 200;
        counter.textContent = `${input.value.length}/${max}`;
      }

      // Update Fabric.js canvas object
      updateCanvasSlot(targetId, input.value);
    });
  });

  // Select inputs
  container.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', () => {
      const slotId = select.dataset.slotId;
      const targetId = select.dataset.target || slotId;
      state.slotValues[slotId] = select.value;
      updateCanvasSlot(targetId, select.value);
    });
  });

  // Date inputs
  container.querySelectorAll('input[type="date"]').forEach(input => {
    input.addEventListener('change', () => {
      const slotId = input.dataset.slotId;
      const targetId = input.dataset.target || slotId;
      state.slotValues[slotId] = input.value;
      updateCanvasSlot(targetId, input.value);
    });
  });

  // Image pickers
  container.querySelectorAll('.image-picker').forEach(picker => {
    const fileInput = picker.querySelector('input[type="file"]');
    picker.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        picker.innerHTML = `<img src="${ev.target.result}" alt="Uploaded" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`;
        picker.classList.add('has-image');
        const slotId = picker.dataset.slotId;
        const targetId = picker.dataset.target || slotId;
        state.slotValues[slotId] = ev.target.result;
        updateCanvasImageSlot(targetId, ev.target.result);
      };
      reader.readAsDataURL(file);
    });
  });
}

function updateCanvasSlot(targetId, value) {
  if (!state.fabricPreviewCanvas) return;
  const objects = state.fabricPreviewCanvas.getObjects();
  const target = objects.find(o =>
    o.id === targetId || o.name === targetId ||
    o.slot_config?.slot_id === targetId
  );
  if (target && (target.type === 'i-text' || target.type === 'textbox' || target.type === 'text')) {
    target.set('text', value || target.slot_config?.placeholder || '');
    state.fabricPreviewCanvas.renderAll();
  }
}

function updateCanvasImageSlot(targetId, dataUrl) {
  if (!state.fabricPreviewCanvas) return;
  const objects = state.fabricPreviewCanvas.getObjects();
  const target = objects.find(o =>
    o.id === targetId || o.name === targetId ||
    o.slot_config?.slot_id === targetId
  );
  if (target && target.type === 'image') {
    // Record original width and height under scaling
    const origW = (target.width || 100) * (target.scaleX || 1);
    const origH = (target.height || 100) * (target.scaleY || 1);

    fabric.Image.fromURL(dataUrl, { crossOrigin: 'anonymous' }).then(newImg => {
      target.setElement(newImg.getElement());
      // Adjust scales so they fit original visual bounding box
      target.set({
        scaleX: origW / (newImg.width || 1),
        scaleY: origH / (newImg.height || 1)
      });
      state.fabricPreviewCanvas.renderAll();
    });
  }
}

function checkFillReady() {
  // With dynamic forms, export is always available once fill screen is open
  document.getElementById('fill-export-btn').disabled = false;
}

// ================================================================
// AI TOOLS
// ================================================================
function initAITools() {
  document.getElementById('ai-script-card').addEventListener('click', () => {
    showScreen('script-screen');
  });

  document.getElementById('ai-voice-card').addEventListener('click', () => {
    showScreen('voice-screen');
  });
}

// ================================================================
// AI SCRIPT WRITER
// ================================================================
function initScriptWriter() {
  const topicInput = document.getElementById('script-topic');
  const generateBtn = document.getElementById('generate-script-btn');
  const outputSection = document.getElementById('script-output-section');
  const outputText = document.getElementById('script-output-text');

  // Back
  document.getElementById('script-back-btn').addEventListener('click', () => navigate('ai-tools'));

  // Tone pills
  document.getElementById('tone-pills').addEventListener('click', (e) => {
    const pill = e.target.closest('.tone-pill');
    if (!pill) return;
    document.querySelectorAll('.tone-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });

  // Length pills
  document.getElementById('length-pills').addEventListener('click', (e) => {
    const pill = e.target.closest('.length-pill');
    if (!pill) return;
    document.querySelectorAll('.length-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });

  // Generate — calls real Groq/Mistral API
  generateBtn.addEventListener('click', async () => {
    if (!topicInput.value.trim()) {
      showToast('⚠️', 'Please enter a topic or headline');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating...';
    outputSection.style.display = 'none';

    const tone = document.querySelector('.tone-pill.active')?.dataset.tone || 'formal';
    const lengthEl = document.querySelector('.length-pill.active');
    const targetLength = lengthEl ? parseInt(lengthEl.dataset.length || '30') : 30;
    const keyPoints = document.getElementById('script-key-points')?.value || '';

    try {
      const result = await ScriptAPI.generate(topicInput.value.trim(), tone, targetLength, keyPoints);
      state.generatedScript = result.script;
      outputText.textContent = result.script;
      outputSection.style.display = 'block';
      outputSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      showToast('❌', err.message || 'Script generation failed. Try again.');
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = '✨ Generate Script';
    }
  });

  // Copy
  document.getElementById('copy-script-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(state.generatedScript).then(() => {
      showToast('✓', 'Script copied to clipboard');
    }).catch(() => {
      showToast('✓', 'Script copied!');
    });
  });

  // Use for Voice
  document.getElementById('use-for-voice-btn').addEventListener('click', () => {
    document.getElementById('voice-script-input').value = state.generatedScript;
    showScreen('voice-screen');
  });

  // Regenerate
  document.getElementById('regenerate-script-btn').addEventListener('click', () => {
    generateBtn.click();
  });
}

// ================================================================
// AI VOICE GENERATOR
// ================================================================
function initVoiceGenerator() {
  // Back
  document.getElementById('voice-back-btn').addEventListener('click', () => navigate('ai-tools'));

  // Voice selector
  document.getElementById('voice-selector').addEventListener('click', (e) => {
    const option = e.target.closest('.voice-option');
    if (!option) return;
    document.querySelectorAll('.voice-option').forEach(o => o.classList.remove('active'));
    option.classList.add('active');
  });

  // Speed slider
  const speedSlider = document.getElementById('voice-speed');
  const speedValue = document.getElementById('speed-value');
  speedSlider.addEventListener('input', () => {
    speedValue.textContent = `${parseFloat(speedSlider.value).toFixed(1)}×`;
  });

  // Load voices from API
  VoiceAPI.listVoices().then(voices => {
    state.availableVoices = voices;
    const selector = document.getElementById('voice-selector');
    if (selector && voices.length) {
      selector.innerHTML = voices.map((v, i) => `
        <div class="voice-option ${i === 0 ? 'active' : ''}" data-voice-id="${v.voice_id}">
          <div class="voice-option-info">
            <span class="voice-name">${v.display_name}</span>
            <span class="voice-lang">${v.language}</span>
          </div>
          <span class="voice-gender">${v.gender === 'female' ? '👩' : '👨'}</span>
        </div>
      `).join('');
      // Re-attach click handlers
      selector.querySelectorAll('.voice-option').forEach(opt => {
        opt.addEventListener('click', () => {
          selector.querySelectorAll('.voice-option').forEach(o => o.classList.remove('active'));
          opt.classList.add('active');
        });
      });
    }
  }).catch(() => {});

  // Generate voice — calls real Edge TTS API
  const generateBtn = document.getElementById('generate-voice-btn');
  generateBtn.addEventListener('click', async () => {
    const script = document.getElementById('voice-script-input').value.trim();
    if (!script) {
      showToast('⚠️', 'Please enter a script to voice');
      return;
    }

    const activeVoice = document.querySelector('.voice-option.active');
    const voiceId = activeVoice?.dataset.voiceId || (state.availableVoices[0]?.voice_id || 'emma');
    const speed = parseFloat(document.getElementById('voice-speed')?.value || '1.0');

    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating voice...';

    try {
      // Revoke previous blob URL to free memory
      if (state.currentVoiceBlobUrl) {
        URL.revokeObjectURL(state.currentVoiceBlobUrl);
        state.currentVoiceBlobUrl = null;
      }

      const blobUrl = await VoiceAPI.generate(script, voiceId, speed);
      state.currentVoiceBlobUrl = blobUrl;

      // Create audio element
      if (state.currentAudioEl) state.currentAudioEl.pause();
      state.currentAudioEl = new Audio(blobUrl);
      state.currentAudioEl.onended = () => {
        state.isPlaying = false;
        document.getElementById('play-voice-btn').textContent = '▶';
      };

      // Show audio player
      const outputSection = document.getElementById('voice-output-section');
      outputSection.style.display = 'block';

      // Generate waveform bars
      const waveform = document.getElementById('audio-waveform');
      waveform.innerHTML = '';
      for (let i = 0; i < 50; i++) {
        const bar = document.createElement('div');
        bar.className = 'waveform-bar';
        bar.style.height = `${Math.random() * 36 + 12}px`;
        if (i < 17) bar.classList.add('active');
        waveform.appendChild(bar);
      }

      outputSection.scrollIntoView({ behavior: 'smooth' });
      showToast('✓', 'Voice generated successfully!');
    } catch (err) {
      showToast('❌', err.message || 'Voice generation failed. Try again.');
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = '🎙️ Generate Voice';
    }
  });

  // Play/pause — uses real Audio element
  document.getElementById('play-voice-btn').addEventListener('click', () => {
    if (!state.currentAudioEl) { showToast('⚠️', 'Generate a voice first'); return; }
    state.isPlaying = !state.isPlaying;
    document.getElementById('play-voice-btn').textContent = state.isPlaying ? '⏸' : '▶';
    if (state.isPlaying) { state.currentAudioEl.play(); }
    else { state.currentAudioEl.pause(); }
  });

  // Attach to template
  document.getElementById('attach-voice-btn').addEventListener('click', () => {
    state.hasVoiceAttached = true;
    document.getElementById('voice-indicator-container').style.display = 'block';
    showToast('✓', 'Voice attached to template');

    if (state.selectedTemplate) {
      showScreen('fill-screen');
    } else {
      navigate('home');
    }
  });

  // Download
  document.getElementById('download-voice-btn').addEventListener('click', () => {
    showToast('✓', 'Voice audio saved to downloads');
  });

  // Regenerate voice
  document.getElementById('regenerate-voice-btn').addEventListener('click', () => {
    generateBtn.click();
  });
}

function simulatePlayback() {
  let progress = 35;
  const bars = document.querySelectorAll('.waveform-bar');
  const progressBar = document.getElementById('audio-progress-bar');
  const timeEl = document.getElementById('audio-time');

  const interval = setInterval(() => {
    if (!state.isPlaying || progress >= 100) {
      clearInterval(interval);
      if (progress >= 100) {
        state.isPlaying = false;
        document.getElementById('play-voice-btn').textContent = '▶';
      }
      return;
    }
    progress += 1;
    progressBar.style.width = `${progress}%`;

    const current = Math.floor(progress * 0.32);
    timeEl.textContent = `0:${String(current).padStart(2, '0')} / 0:32`;

    bars.forEach((bar, i) => {
      const threshold = Math.floor(progress / 100 * bars.length);
      bar.classList.toggle('active', i < threshold);
    });
  }, 100);
}

// ================================================================
// EXPORT
// ================================================================
function initExport() {
  // Back
  document.getElementById('export-back-btn').addEventListener('click', () => {
    showScreen('fill-screen');
  });

  // Format pills
  initPillGroup('format-pills');
  initPillGroup('size-pills');
  initPillGroup('quality-pills');

  // Voice toggle
  document.getElementById('voice-toggle').addEventListener('click', function() {
    this.classList.toggle('active');
  });

  // Export Now
  document.getElementById('export-now-btn').addEventListener('click', () => {
    startExport();
  });

  // Create Another
  document.getElementById('create-another-btn').addEventListener('click', () => {
    navigate('home');
  });
}

function initPillGroup(containerId) {
  document.getElementById(containerId).addEventListener('click', (e) => {
    const pill = e.target.closest('.option-pill');
    if (!pill) return;
    const container = document.getElementById(containerId);
    container.querySelectorAll('.option-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
}

function openExportScreen() {
  document.getElementById('export-options-view').style.display = 'flex';
  document.getElementById('export-progress-view').style.display = 'none';
  document.getElementById('export-complete-view').style.display = 'none';

  // Show voice toggle if voice attached
  document.getElementById('voice-toggle-section').style.display = state.hasVoiceAttached ? 'block' : 'none';

  showScreen('export-screen');
}

async function startExport() {
  const canvas = state.fabricPreviewCanvas;
  if (!canvas) {
    showToast('❌', 'No canvas to export');
    return;
  }

  document.getElementById('export-options-view').style.display = 'none';
  document.getElementById('export-progress-view').style.display = 'block';
  document.getElementById('export-complete-view').style.display = 'none';

  const progressBar = document.getElementById('export-progress-bar');
  const percentEl = document.getElementById('export-percent');
  const labelEl = document.getElementById('export-progress-label');

  const onProgress = (pct, label) => {
    progressBar.style.width = `${pct}%`;
    percentEl.textContent = `${Math.round(pct)}%`;
    labelEl.textContent = label || 'Processing...';
  };

  // Get selected format and size
  const formatPill = document.querySelector('#format-pills .option-pill.active');
  const sizePill = document.querySelector('#size-pills .option-pill.active');
  const format = formatPill?.dataset?.format || 'png';
  const sizeName = sizePill?.dataset?.size || 'story';

  const template = state.selectedTemplate;
  const outputSizes = template?.output_sizes || { story: { width: 1080, height: 1920 } };
  const outputSize = outputSizes[sizeName] || outputSizes.story || { width: 1080, height: 1920 };

  try {
    let blob;
    const fileName = `newsforge_${template?.name?.replace(/\s+/g, '_') || 'export'}_${Date.now()}`;

    if (format === 'mp4') {
      // Video export via FFmpeg.wasm
      const voiceBlob = state.hasVoiceAttached && state.currentVoiceBlobUrl
        ? await (await fetch(state.currentVoiceBlobUrl)).blob()
        : null;
      const scenes = template?.scenes || null;

      blob = await Renderer.exportVideo(canvas, scenes, voiceBlob, outputSize, onProgress);
      Renderer.downloadBlob(blob, `${fileName}.mp4`);
    } else {
      // Image export
      blob = await Renderer.exportImage(canvas, format, outputSize, onProgress);
      Renderer.downloadBlob(blob, `${fileName}.${format}`);
    }

    // Show complete
    setTimeout(() => {
      document.getElementById('export-progress-view').style.display = 'none';
      document.getElementById('export-complete-view').style.display = 'block';
    }, 500);

    // Log export to backend (non-blocking)
    try {
      await ExportsAPI.logExport({
        template_id: template?.id,
        format,
        size: sizeName,
        output_width: outputSize.width,
        output_height: outputSize.height,
      });
    } catch {}

  } catch (err) {
    console.error('[Export] Failed:', err);
    showToast('❌', err.message || 'Export failed. Try image format.');
    // Reset to options view
    document.getElementById('export-progress-view').style.display = 'none';
    document.getElementById('export-options-view').style.display = 'flex';
  }
}

// ================================================================
// MY PROJECTS
// ================================================================
function initProjects() {
  // Rendered on navigate
}

async function renderProjects() {
  const list = document.getElementById('projects-list');
  list.innerHTML = '<div style="color:#888;text-align:center;padding:40px">Loading projects...</div>';

  try {
    const response = await ProjectsAPI.list();
    const projects = response?.projects || [];

    if (!projects.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📁</div>
          <div class="empty-title">No projects yet</div>
          <div class="empty-desc">Your created and exported content will appear here.</div>
        </div>
      `;
      return;
    }

    list.innerHTML = projects.map(p => {
      const statusClass = p.is_exported ? 'exported' : 'draft';
      const statusText = p.is_exported ? 'exported' : 'draft';
      return `
        <div class="project-card" data-id="${p.id}" data-template-id="${p.template_id || ''}">
          <div class="project-thumb" style="background:var(--bg-surface-elevated)">
            <span style="font-size:24px;opacity:0.7">📰</span>
          </div>
          <div class="project-info">
            <div class="project-name">${p.name}</div>
            <div class="project-template">${p.output_format || 'Template'}</div>
            <div class="project-date">${formatDate(p.updated_at)}</div>
          </div>
          <span class="project-status ${statusClass}">${statusText}</span>
        </div>
      `;
    }).join('');

    // Click handler — re-open template preview
    list.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const templateId = card.dataset.templateId;
        if (templateId) openTemplatePreview(templateId);
      });
    });
  } catch (err) {
    list.innerHTML = `<div style="color:#EF4444;text-align:center;padding:40px">Failed to load projects. ${err.message}</div>`;
  }
}

// ================================================================
// PROFILE
// ================================================================
function initProfile() {
  // Load usage stats
  AccountAPI.getUsage().then(stats => {
    const planEl = document.getElementById('profile-plan');
    const exportsEl = document.getElementById('profile-exports');
    if (planEl) planEl.textContent = stats.plan || 'free';
    if (exportsEl) exportsEl.textContent = `${stats.exports_today} today`;
  }).catch(() => {});

  // Load user profile
  const user = Auth.getUser();
  if (user) {
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    if (nameEl) nameEl.textContent = user.name || '';
    if (emailEl) emailEl.textContent = user.email || '';
  }

  document.getElementById('logout-btn').addEventListener('click', () => {
    Auth.logout();
  });

  document.getElementById('setting-cache').addEventListener('click', () => {
    localStorage.removeItem('nf_template_cache');
    localStorage.removeItem('nf_last_sync');
    showToast('✓', 'Template cache cleared');
  });

  document.getElementById('setting-export-data').addEventListener('click', async () => {
    try {
      showToast('📥', 'Preparing data export...');
      await AccountAPI.exportData();
    } catch (err) {
      showToast('❌', 'Export failed. Try again.');
    }
  });

  document.getElementById('setting-delete').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete your account? This action is PERMANENT and cannot be undone.')) {
      try {
        showToast('⏳', 'Deleting account...');
        await AccountAPI.deleteAccount();
      } catch (err) {
        showToast('❌', err.message || 'Account deletion failed.');
      }
    }
  });
}

// ================================================================
// TOAST
// ================================================================
function showToast(icon, message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-message').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ================================================================
// UTILITIES
// ================================================================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
