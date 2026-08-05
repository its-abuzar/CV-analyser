/* ============================================================
   SkillMatch Pro — Frontend application
   ------------------------------------------------------------
   Vanilla JavaScript (ES6+). No frameworks, no backend.

   BACKEND INTEGRATION NOTE
   ------------------------
   The analysis pipeline below is SIMULATED with mock data so the
   UI is fully functional without a server. Every place where a
   future FastAPI request will be needed is marked with a
   "TODO: FastAPI" comment so it can be swapped in later with
   minimal changes.
   ============================================================ */

(() => {
  'use strict';

  /* ==========================================================
     CONSTANTS
     ========================================================== */

  const MODES = [
    { id: 'core', icon: 'fa-percentage', title: 'Core Match', desc: 'Overall match score & skill breakdown' },
    { id: 'techstack', icon: 'fa-code', title: 'Tech Stack', desc: 'Extract & compare technologies' },
    { id: 'experience', icon: 'fa-briefcase', title: 'Experience', desc: 'Years, relevance & gaps' },
    { id: 'achievements', icon: 'fa-trophy', title: 'Achievements', desc: 'Quantifiable wins & action verbs' },
    { id: 'structure', icon: 'fa-file-lines', title: 'Resume Structure', desc: 'Sections, readability & format' },
    { id: 'interview', icon: 'fa-question', title: 'Tech Interview', desc: 'Technical questions & answers' },
    { id: 'salary', icon: 'fa-dollar-sign', title: 'Salary Intel', desc: 'Market rate for your stack' }
  ];

  const MOCK_KEYWORDS = {
    matched: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'AWS', 'TensorFlow', 'Agile', 'Deep Learning', 'NLP', 'Statistics', 'PyTorch', 'Git', 'Linux', 'REST APIs', 'Problem Solving'],
    missing: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'GraphQL', 'TypeScript', 'Microservices', 'Redis', 'Kafka', 'Spark', 'Airflow', 'MLOps', 'SageMaker', 'Kubeflow']
  };

  const CV_MAX_MB = 10;
  const JD_MAX_MB = 10;
  const HISTORY_LIMIT = 100;

  const $ = (id) => document.getElementById(id);

  /* ==========================================================
     STATE
     ========================================================== */

  const state = {
    page: 'home',
    theme: 'dark',
    mode: 'core',
    cvTab: 'cv-upload',
    jdTab: 'jd-text',
    cvFile: null,
    jdFile: null,
    cvSource: null,
    jdSource: null,
    cvText: '',
    jdText: '',
    analyzing: false,
    historyQuery: '',
    runTimers: [],
    lastResult: null,
    reportData: null,
    profile: storageGet('sm_profile', {}),
    history: storageGet('sm_history', [])
  };

  /* ==========================================================
     SAFE STORAGE HELPERS
     (wrapped so corrupted localStorage never crashes the app)
     ========================================================== */

  function storageGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage unavailable (private mode / quota) — ignore */
    }
  }

  function storageGetRaw(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSetRaw(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) { /* ignore */ }
  }

  /* ==========================================================
     UTILITIES
     ========================================================== */

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function formatClock(date = new Date()) {
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':');
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function clampScore(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function normalizeUrl(url) {
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  function validateUrl(url, type) {
    try {
      const host = new URL(url).hostname;
      const domain = type === 'linkedin' ? 'linkedin.com' : 'github.com';
      return host === domain || host.endsWith(`.${domain}`);
    } catch (e) {
      return false;
    }
  }

  function extractUsername(url, type) {
    const clean = url.replace(/\/+$/, '');
    const parts = clean.split('/').filter(Boolean);
    let last = '';
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i].split('?')[0].split('#')[0];
      if (!part || ['in', 'profile', 'company', 'orgs'].includes(part)) continue;
      last = part;
      break;
    }
    return last || (type === 'linkedin' ? 'profile' : 'user');
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function currentMode() {
    return MODES.find((m) => m.id === state.mode) || MODES[0];
  }

  /* ==========================================================
     THEME
     ========================================================== */

  function initTheme() {
    const saved = storageGetRaw('sm_theme');
    state.theme = saved === 'light' ? 'light' : 'dark';
    applyTheme();
    $('themeToggle').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      storageSetRaw('sm_theme', state.theme);
      applyTheme();
    });
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
  }

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  function initNavigation() {
    document.querySelectorAll('[data-page]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(el.dataset.page);
      });
    });
    navigateTo('home');
  }

  function navigateTo(page) {
    if (!document.getElementById(`page-${page}`)) return;
    state.page = page;

    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
    $(`page-${page}`).classList.add('active');

    document.querySelectorAll('.nav-link').forEach((l) => {
      const isActive = l.dataset.page === page;
      l.classList.toggle('active', isActive);
      if (isActive) l.setAttribute('aria-current', 'page');
      else l.removeAttribute('aria-current');
    });

    closeMobileMenu();

    if (page === 'history') renderHistory();
    if (page === 'dashboard') renderProfileHints();
    if (page === 'report') {
      const active = document.querySelector('.report-tab.active');
      if (active) selectReportTab(active.dataset.reportTab);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initMobileMenu() {
    $('mobileMenuBtn').addEventListener('click', () => {
      const open = $('navLinks').classList.toggle('open');
      $('mobileMenuBtn').setAttribute('aria-expanded', String(open));
    });
  }

  function closeMobileMenu() {
    $('navLinks').classList.remove('open');
    $('mobileMenuBtn').setAttribute('aria-expanded', 'false');
  }

  /* ==========================================================
     TABS
     ========================================================== */

  function initTabs() {
    document.querySelectorAll('.tab-bar').forEach(setupTabBar);
  }

  function setupTabBar(bar) {
    bar.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const barEl = tab.closest('.tab-bar');
      barEl.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
      const parent = barEl.closest('.card');
      parent.querySelectorAll('.tab-content').forEach((c) => c.classList.toggle('active', c.dataset.tabContent === tab.dataset.tab));
      if (barEl.id === 'cvTabs') state.cvTab = tab.dataset.tab;
      if (barEl.id === 'jdTabs') state.jdTab = tab.dataset.tab;
    });
  }

  function initSubTabs() {
    document.querySelectorAll('.sub-tab-bar').forEach((bar) => {
      bar.addEventListener('click', (e) => {
        const tab = e.target.closest('.sub-tab');
        if (!tab) return;
        const wrap = bar.closest('.sub-tabs');
        wrap.querySelectorAll('.sub-tab').forEach((t) => t.classList.toggle('active', t === tab));
        wrap.querySelectorAll('.sub-panel').forEach((p) => p.classList.toggle('active', p.dataset.subPanel === tab.dataset.sub));
      });
    });
  }

  /* ==========================================================
     UPLOADS (frontend-only — files are kept in state for a
     future POST /analyze request, never uploaded today)
     ========================================================== */

  const cvUpload = {
    areaId: 'uploadArea', inputId: 'cvFileInput',
    contentId: 'uploadContent', infoId: 'fileInfo',
    nameId: 'fileName', removeId: 'removeFileBtn',
    exts: ['pdf', 'docx'], maxMb: CV_MAX_MB
  };

  const jdUpload = {
    areaId: 'jdUploadArea', inputId: 'jdFileInput',
    contentId: 'jdUploadContent', infoId: 'jdFileInfo',
    nameId: 'jdFileName', removeId: 'removeJdFileBtn',
    exts: ['pdf', 'docx', 'txt'], maxMb: JD_MAX_MB
  };

  function initUploads() {
    setupUploadArea(cvUpload, handleCvFile, removeCvFile);
    setupUploadArea(jdUpload, handleJdFile, removeJdFile);
  }

  function setupUploadArea(opts, onFile, onRemove) {
    const area = $(opts.areaId);
    const input = $(opts.inputId);

    area.addEventListener('click', () => input.click());
    area.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    // dragDepth counter prevents flicker when dragging over children
    let dragDepth = 0;
    area.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragDepth++;
      area.classList.add('drag-over');
    });
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('drag-over');
    });
    area.addEventListener('dragleave', () => {
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) area.classList.remove('drag-over');
    });
    area.addEventListener('drop', (e) => {
      e.preventDefault();
      dragDepth = 0;
      area.classList.remove('drag-over');
      if (e.dataTransfer.files.length) onFile(e.dataTransfer.files[0]);
    });

    input.addEventListener('change', () => {
      if (input.files.length) onFile(input.files[0]);
    });

    $(opts.removeId).addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove();
    });
  }

  function validateFile(file, opts) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!opts.exts.includes(ext)) return `Please select a ${opts.exts.join(' or ')} file`;
    if (file.size > opts.maxMb * 1024 * 1024) return `File size must be less than ${opts.maxMb}MB`;
    return null;
  }

  function showFileInArea(opts, file) {
    $(opts.areaId).classList.add('has-file');
    $(opts.contentId).hidden = true;
    $(opts.infoId).hidden = false;
    $(opts.nameId).textContent = file.name;
  }

  function clearFileInArea(opts) {
    $(opts.inputId).value = '';
    $(opts.areaId).classList.remove('has-file');
    $(opts.contentId).hidden = false;
    $(opts.infoId).hidden = true;
  }

  function handleCvFile(file) {
    const err = validateFile(file, cvUpload);
    if (err) { showError(err); return; }
    // TODO: FastAPI — this file will be sent as `cv_file` in the POST /analyze FormData.
    state.cvFile = file;
    showFileInArea(cvUpload, file);
    hideError();
    updateAnalyzeBtn();
  }

  function removeCvFile() {
    state.cvFile = null;
    clearFileInArea(cvUpload);
    updateAnalyzeBtn();
  }

  function handleJdFile(file) {
    const err = validateFile(file, jdUpload);
    if (err) { showError(err); return; }
    // TODO: FastAPI — this file will be sent as `jd_file` in the POST /analyze FormData.
    state.jdFile = file;
    showFileInArea(jdUpload, file);
    hideError();
    updateAnalyzeBtn();
  }

  function removeJdFile() {
    state.jdFile = null;
    clearFileInArea(jdUpload);
    updateAnalyzeBtn();
  }

  /* ==========================================================
     TEXT AREAS & CHAR COUNTERS
     ========================================================== */

  function initCharCounters() {
    $('cvTextarea').addEventListener('input', () => {
      state.cvText = $('cvTextarea').value;
      $('cvCharCount').textContent = state.cvText.length;
      updateAnalyzeBtn();
    });
    $('jdTextarea').addEventListener('input', () => {
      state.jdText = $('jdTextarea').value;
      $('jdCharCount').textContent = state.jdText.length;
      updateAnalyzeBtn();
    });
  }

  /* ==========================================================
     LINK IMPORTS (LinkedIn / GitHub) — simulated, frontend-only
     ========================================================== */

  function initLinkImports() {
    document.querySelectorAll('[data-import-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.importBtn;
        const input = document.querySelector(`[data-url-input="${target}"]`);
        if (!input || !input.value.trim()) {
          showError('Please paste a link first');
          return;
        }
        const type = target.split('-')[1];
        const url = normalizeUrl(input.value.trim());
        if (!validateUrl(url, type)) {
          showError(`Please enter a valid ${type === 'linkedin' ? 'LinkedIn' : 'GitHub'} URL`);
          return;
        }
        if (target === 'jd-linkedin') importJobLink(url);
        else importCvLink(target, type, url);
      });
    });

    document.querySelectorAll('[data-remove-import]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.removeImport;
        if (target === 'jd-linkedin') removeJdImport();
        else removeCvImport(target);
      });
    });

    document.querySelectorAll('[data-use-profile]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.useProfile;
        const url = state.profile[type];
        if (url) importCvLink(`cv-${type}`, type, url);
      });
    });

    document.querySelectorAll('[data-connect]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.connect;
        const url = state.profile[type];
        if (!url) {
          showError(`No ${type === 'linkedin' ? 'LinkedIn' : 'GitHub'} link saved in your profile yet. Paste a link or add one on the Profile page.`);
          return;
        }
        // Simulated OAuth connect delay — swap for a real flow later.
        const icon = btn.querySelector('i');
        const originalClass = icon.className;
        icon.className = 'fas fa-circle-notch fa-spin';
        btn.disabled = true;
        setTimeout(() => {
          icon.className = originalClass;
          btn.disabled = false;
          importCvLink(`cv-${type}`, type, url);
        }, 700);
      });
    });
  }

  function importCvLink(target, type, url) {
    const input = document.querySelector(`[data-url-input="${target}"]`);
    if (input && !input.value.trim()) input.value = url;
    const btn = document.querySelector(`[data-import-btn="${target}"]`);
    if (btn) {
      btn.disabled = true;
      btn.querySelector('i').className = 'fas fa-circle-notch fa-spin';
    }
    setTimeout(() => {
      const label = `${type === 'linkedin' ? 'LinkedIn' : 'GitHub'}: ${extractUsername(url, type)}`;
      state.cvSource = { type, label, url };
      const el = document.querySelector(`[data-imported-state="${target}"]`);
      if (el) {
        el.hidden = false;
        el.querySelector('[data-imported-label]').textContent = label;
      }
      if (btn) {
        btn.disabled = false;
        btn.querySelector('i').className = 'fas fa-arrow-down';
      }
      showToast(`${label} imported as CV source`, 'success');
      updateAnalyzeBtn();
    }, 800);
  }

  function removeCvImport(target) {
    if (state.cvSource && `cv-${state.cvSource.type}` === target) state.cvSource = null;
    const el = document.querySelector(`[data-imported-state="${target}"]`);
    if (el) el.hidden = true;
    const input = document.querySelector(`[data-url-input="${target}"]`);
    if (input) input.value = '';
    updateAnalyzeBtn();
  }

  function importJobLink(url) {
    const btn = document.querySelector('[data-import-btn="jd-linkedin"]');
    const input = document.querySelector('[data-url-input="jd-linkedin"]');
    if (input && !input.value.trim()) input.value = url;
    btn.disabled = true;
    btn.querySelector('i').className = 'fas fa-circle-notch fa-spin';
    setTimeout(() => {
      const jdText = generateMockJobDescription();
      const ta = $('jdTextarea');
      ta.value = jdText;
      state.jdText = jdText;
      state.jdSource = { url };
      $('jdCharCount').textContent = jdText.length;
      const el = $('jdImportedState');
      if (el) {
        el.hidden = false;
        el.querySelector('[data-imported-label]').textContent = 'LinkedIn posting imported';
      }
      btn.disabled = false;
      btn.querySelector('i').className = 'fas fa-arrow-down';
      showToast('Job description imported from LinkedIn posting', 'success');
      updateAnalyzeBtn();
    }, 1000);
  }

  function removeJdImport() {
    state.jdSource = null;
    $('jdImportedState').hidden = true;
    $('jdTextarea').value = '';
    state.jdText = '';
    $('jdCharCount').textContent = '0';
    updateAnalyzeBtn();
  }

  function renderProfileHints() {
    ['linkedin', 'github'].forEach((type) => {
      const hint = document.querySelector(`[data-profile-hint="${type}"]`);
      if (!hint) return;
      const linkEl = hint.querySelector('a');
      if (state.profile[type]) {
        hint.hidden = false;
        linkEl.textContent = state.profile[type];
        linkEl.href = state.profile[type];
      } else {
        hint.hidden = true;
      }
    });
  }

  /* ==========================================================
     PROFILE
     ========================================================== */

  function initProfile() {
    $('profileLinkedin').value = state.profile.linkedin || '';
    $('profileGithub').value = state.profile.github || '';
    renderProfileStatus();
    renderProfileHints();

    $('saveProfileBtn').addEventListener('click', () => {
      const linkedin = normalizeUrl($('profileLinkedin').value.trim());
      const github = normalizeUrl($('profileGithub').value.trim());
      if (linkedin && !validateUrl(linkedin, 'linkedin')) {
        showError('Please enter a valid LinkedIn URL');
        return;
      }
      if (github && !validateUrl(github, 'github')) {
        showError('Please enter a valid GitHub URL');
        return;
      }
      state.profile = { linkedin, github };
      storageSet('sm_profile', state.profile);
      renderProfileStatus();
      renderProfileHints();
      showToast('Profile saved successfully', 'success');
    });
  }

  function renderProfileStatus() {
    ['linkedin', 'github'].forEach((type) => {
      const badge = $(`${type}Status`);
      const connected = !!state.profile[type];
      badge.className = `status-badge ${connected ? 'connected' : 'not-connected'}`;
      badge.textContent = connected ? 'Connected' : 'Not connected';
    });
  }

  /* ==========================================================
     MODE SELECTOR & HOME FEATURES
     ========================================================== */

  function initModeSelector() {
    const grid = $('modeGrid');
    MODES.forEach((m) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `mode-card ${m.id === state.mode ? 'active' : ''}`;
      card.dataset.mode = m.id;
      card.innerHTML = `<i class="fas ${m.icon}"></i><h4>${m.title}</h4><p>${m.desc}</p>`;
      card.addEventListener('click', () => selectMode(m.id));
      grid.appendChild(card);
    });
  }

  function initHomeFeatures() {
    const grid = $('homeFeatureGrid');
    MODES.forEach((m) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'feature-card';
      card.innerHTML = `<i class="fas ${m.icon}"></i><h4>${m.title}</h4><p>${m.desc}</p>`;
      card.addEventListener('click', () => {
        selectMode(m.id);
        navigateTo('dashboard');
      });
      grid.appendChild(card);
    });
  }

  function selectMode(id) {
    state.mode = id;
    document.querySelectorAll('.mode-card').forEach((c) => {
      c.classList.toggle('active', c.dataset.mode === id);
    });
    $('analyzeBtnText').textContent = `Run ${currentMode().title} Analysis`;
    updateAnalyzeBtn();
  }

  /* ==========================================================
     ANALYSIS — orchestration
     ------------------------------------------------------------
     The whole pipeline is SIMULATED. The mock generators live
     at the bottom of this section and are clearly isolated so
     they can be replaced by a single fetch() call.

     TODO: FastAPI — replace `runSimulatedLogs` + `generateMockData`
     with a real request, e.g.:

       const form = new FormData();
       if (state.cvFile) form.append('cv_file', state.cvFile);
       if (state.jdFile) form.append('jd_file', state.jdFile);
       form.append('cv_text', state.cvText);
       form.append('jd_text', state.jdText);
       form.append('mode', state.mode);

       const res = await fetch('http://localhost:8000/analyze', {
         method: 'POST', body: form
       });
       if (!res.ok) throw new Error('Analysis failed');
       const data = await res.json();

     `data` must match the shape expected by displayResults():
       { score, skills: [{label, value}], matched: [], missing: [], mode }
     ========================================================== */

  function initAnalyzeButton() {
    $('analyzeBtn').addEventListener('click', runAnalysis);
    updateAnalyzeBtn();
  }

  function canAnalyze() {
    const cvReady = !!state.cvFile || !!state.cvSource || state.cvText.trim().length > 0;
    const jdReady = state.jdText.trim().length > 0 || !!state.jdFile;
    return cvReady && jdReady && !state.analyzing;
  }

  function analysisBlockers() {
    const cvReady = !!state.cvFile || !!state.cvSource || state.cvText.trim().length > 0;
    const jdReady = state.jdText.trim().length > 0 || !!state.jdFile;
    if (!cvReady) return 'Add a CV first — upload a file, paste a link, or paste CV text.';
    if (!jdReady) return 'Add a job description — paste the text or upload a JD file.';
    return null;
  }

  function updateAnalyzeBtn() {
    $('analyzeBtn').disabled = !canAnalyze();
  }

  function runAnalysis() {
    if (state.analyzing) return;

    // Get the file, JD, and mode from state
    const file = state.cvFile;
    const jobDescription = state.jdText.trim();
    const mode = state.mode;

    if (!file) {
      showError('Please upload a resume file (PDF or DOCX) before analyzing.');
      return;
    }
    if (!jobDescription) {
      showError('Please enter or paste a job description before analyzing.');
      return;
    }

    startAnalysisUi();

    // Build FormData
    const form = new FormData();
    form.append('resume', file);
    form.append('job_description', jobDescription);
    form.append('mode', mode);

    // Show simulated logs while waiting for the backend
    runSimulatedLogs(async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/analyze', {
          method: 'POST',
          body: form
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.detail || `Server returned ${res.status}`);
        }

        const data = await res.json();
        finishAnalysis(data);
      } catch (err) {
        state.analyzing = false;
        $('analyzeBtn').querySelector('.btn-text').hidden = false;
        $('analyzeBtn').querySelector('.btn-loader').hidden = true;
        $('resultsSkeleton').hidden = true;
        $('liveLogs').hidden = true;
        updateAnalyzeBtn();
        showError(err.message || 'Analysis failed — is the backend running?');
        showToast('Analysis failed', 'error');
      }
    });
  }

  function startAnalysisUi() {
    state.analyzing = true;
    updateAnalyzeBtn();
    hideError();
    $('resultsSection').hidden = true;
    $('resultsSkeleton').hidden = false;
    $('analyzeBtn').querySelector('.btn-text').hidden = true;
    $('analyzeBtn').querySelector('.btn-loader').hidden = false;
    $('liveLogs').hidden = false;
    $('liveLogs').classList.add('is-running');
    setLogStatus('running');
  }

  function finishAnalysis(data) {
    state.analyzing = false;
    state.lastResult = data;
    $('analyzeBtn').querySelector('.btn-text').hidden = false;
    $('analyzeBtn').querySelector('.btn-loader').hidden = true;
    $('resultsSkeleton').hidden = true;
    displayResults(data);
    saveHistory(data);
    updateAnalyzeBtn();
    showToast('Analysis complete', 'success');
  }

  /* ---- Simulated live logs ------------------------------- */

  const LOG_PLAN = [
    { text: 'Initializing analysis engine', icon: 'fa-microchip', type: 'info' },
    { text: 'Parsing CV document', icon: 'fa-file-lines', type: 'info' },
    { text: 'Extracting skills & experience', icon: 'fa-magnifying-glass', type: 'info' },
    { text: 'Analyzing job description', icon: 'fa-briefcase', type: 'info' },
    { text: 'Computing keyword matches', icon: 'fa-tags', type: 'info' },
    { text: 'Generating mode-specific insights', icon: 'fa-wand-magic-sparkles', type: 'info' },
    { text: 'Analysis complete', icon: 'fa-check', type: 'success' }
  ];

  function runSimulatedLogs(onDone) {
    const body = $('logsBody');
    body.innerHTML = '';
    state.runTimers = [];
    let step = 0;

    const schedule = () => {
      if (!state.analyzing) return;
      if (step < LOG_PLAN.length) {
        appendLogLine(LOG_PLAN[step++]);
        state.runTimers.push(setTimeout(schedule, 320 + Math.random() * 380));
      } else {
        setLogStatus('done');
        state.runTimers.push(setTimeout(onDone, 450));
      }
    };
    state.runTimers.push(setTimeout(schedule, 150));
  }

  function appendLogLine(step) {
    const body = $('logsBody');
    const line = document.createElement('div');
    line.className = `log-line log-${step.type}`;
    line.innerHTML = `<span class="log-time">${formatClock()}</span><i class="fas ${step.icon}"></i><span class="log-text">${step.text}</span>`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function setLogStatus(kind) {
    const el = $('logsStatus');
    el.classList.toggle('is-running', kind === 'running');
    el.classList.toggle('is-done', kind === 'done');
    el.innerHTML = kind === 'done'
      ? '<i class="fas fa-check"></i> Complete'
      : '<i class="fas fa-circle"></i> Running';
  }

  /* ---- Mock data generator ---------------------------------
     TODO: FastAPI — replace this function with the response of
     POST /analyze. Keep the return shape identical.           */

  function generateMockData(mode) {
    let score = 0;
    let skills = [];
    let matchedCount = 0;
    let missingCount = 0;
    const allMatched = [...MOCK_KEYWORDS.matched];
    const allMissing = [...MOCK_KEYWORDS.missing];

    switch (mode) {
      case 'core':
        score = 78;
        skills = [
          { label: 'Technical Skills', value: 82 },
          { label: 'Domain Knowledge', value: 65 },
          { label: 'Soft Skills', value: 71 }
        ];
        matchedCount = 7;
        missingCount = 4;
        break;
      case 'techstack':
        score = 72;
        skills = [
          { label: 'Frontend', value: 68 },
          { label: 'Backend', value: 75 },
          { label: 'DevOps', value: 55 },
          { label: 'Data', value: 80 }
        ];
        matchedCount = 6;
        missingCount = 4;
        break;
      case 'experience':
        score = 65;
        skills = [
          { label: 'Years Experience', value: 72 },
          { label: 'Role Relevance', value: 68 },
          { label: 'Industry Fit', value: 58 }
        ];
        matchedCount = 5;
        missingCount = 5;
        break;
      case 'achievements':
        score = 70;
        skills = [
          { label: 'Quantifiable Impact', value: 74 },
          { label: 'Action Verb Strength', value: 68 },
          { label: 'Results Focus', value: 70 }
        ];
        matchedCount = 6;
        missingCount = 4;
        break;
      case 'structure':
        score = 85;
        skills = [
          { label: 'Completeness', value: 82 },
          { label: 'Readability', value: 78 },
          { label: 'Formatting', value: 90 }
        ];
        matchedCount = 8;
        missingCount = 2;
        break;
      case 'interview':
        score = 60;
        skills = [
          { label: 'Technical Depth', value: 65 },
          { label: 'System Design', value: 55 },
          { label: 'Problem Solving', value: 72 }
        ];
        matchedCount = 4;
        missingCount = 6;
        break;
      case 'salary':
        score = 74;
        skills = [
          { label: 'Stack Value', value: 76 },
          { label: 'Experience Worth', value: 70 },
          { label: 'Market Demand', value: 78 }
        ];
        matchedCount = 6;
        missingCount = 3;
        break;
      default:
        score = 70;
        skills = [
          { label: 'Technical Skills', value: 75 },
          { label: 'Domain Knowledge', value: 65 },
          { label: 'Soft Skills', value: 70 }
        ];
        matchedCount = 5;
        missingCount = 5;
    }

    return {
      score,
      skills,
      matched: shuffle(allMatched).slice(0, matchedCount),
      missing: shuffle(allMissing).slice(0, missingCount),
      mode
    };
  }

  function generateMockJobDescription() {
    return `Senior Software Engineer - Machine Learning

About the role:
We are looking for a Senior Software Engineer to join our ML Platform team. You will build scalable data pipelines, deploy machine learning models to production, and collaborate closely with data scientists and product teams.

Responsibilities:
- Design and build REST APIs and microservices for ML feature serving
- Deploy and monitor ML models on AWS using Docker and Kubernetes
- Optimize data pipelines processing millions of events per day
- Work with SQL and NoSQL databases (PostgreSQL, MongoDB)
- Implement CI/CD pipelines for automated model training and deployment
- Mentor junior engineers and drive technical design reviews

Requirements:
- 5+ years of experience in Python and backend development
- Strong knowledge of machine learning fundamentals (TensorFlow or PyTorch)
- Experience with AWS, Docker, Kubernetes and MLOps practices
- Solid understanding of data analysis, statistics and SQL
- Experience building and consuming RESTful APIs
- Excellent problem-solving and communication skills

Nice to have:
- Experience with Spark, Kafka or Airflow
- GraphQL, TypeScript or React
- Terraform or Infrastructure as Code
- Experience with agile development methodologies`;
  }

  /* ==========================================================
     RESULTS RENDERING
     ========================================================== */

  function displayResults(data) {
    animateScore($('scoreCircle'), $('scoreNumber'), data.score);
    $('statMatched').textContent = data.matched.length;
    $('statMissing').textContent = data.missing.length;
    $('statKeywords').textContent = data.matched.length + data.missing.length;
    renderSkillBars($('skillBars'), data.skills);
    renderTags('matchedTags', data.matched, 'matched');
    renderTags('missingTags', data.missing, 'missing');
    $('matchedCount').textContent = data.matched.length;
    $('missingCount').textContent = data.missing.length;
    renderModeCards(data.mode);
    $('resultsSection').hidden = false;
    $('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function animateScore(circle, numberEl, target) {
    const clamped = clampScore(target);
    const duration = 1200;
    const start = performance.now();

    const frame = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const current = Math.round(clamped * ease);
      numberEl.textContent = current;
      const deg = (current / 100) * 360;
      circle.style.background = `conic-gradient(var(--primary) ${deg}deg, var(--bg-tertiary) ${deg}deg)`;
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  function skillsHtml(skills) {
    return skills.map((s) => {
      const level = s.value >= 75 ? 'high' : s.value >= 55 ? 'med' : 'low';
      return `
        <div class="skill-bar-item">
          <div class="skill-bar-header">
            <span class="skill-bar-label">${escapeHtml(s.label)}</span>
            <span class="skill-bar-value">${s.value}%</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill ${level}" data-w="${s.value}" style="width:0%"></div>
          </div>
        </div>`;
    }).join('');
  }

  function animateBars(container) {
    container.querySelectorAll('.skill-bar-fill[data-w]').forEach((fill, i) => {
      setTimeout(() => { fill.style.width = `${fill.dataset.w}%`; }, 100 + i * 150);
    });
  }

  function renderSkillBars(container, skills) {
    container.innerHTML = skillsHtml(skills);
    animateBars(container);
  }

  function renderTags(containerId, items, type) {
    const container = $(containerId);
    container.innerHTML = '';
    if (!items.length) {
      container.classList.add('empty');
      return;
    }
    container.classList.remove('empty');
    const frag = document.createDocumentFragment();
    items.forEach((kw, i) => {
      const tag = document.createElement('span');
      tag.className = `tag ${type}`;
      tag.textContent = kw;
      tag.style.animationDelay = `${i * 40}ms`;
      frag.appendChild(tag);
    });
    container.appendChild(frag);
  }

  function keywordsHtml(data) {
    return `
      <div class="keywords-grid">
        <div class="keyword-group">
          <h5><span class="kw-dot matched"></span> Matched <span class="kw-count">${data.matched.length}</span></h5>
          <div class="tags-container">${data.matched.map((k) => `<span class="tag matched">${escapeHtml(k)}</span>`).join('')}</div>
        </div>
        <div class="keyword-group">
          <h5><span class="kw-dot missing"></span> Missing <span class="kw-count">${data.missing.length}</span></h5>
          <div class="tags-container">${data.missing.map((k) => `<span class="tag missing">${escapeHtml(k)}</span>`).join('')}</div>
        </div>
      </div>`;
  }

  /* ---- Mode-specific result sections -----------------------
     Single source of truth shared by the dashboard results and
     the Detailed Report page.                                */

  const MODE_SECTIONS = {
    core: [
      {
        title: 'Tech Stack Summary',
        icon: 'fa-code',
        type: 'badges',
        intro: 'Python, JavaScript, React, Node.js, PostgreSQL',
        items: [
          { text: 'Python', state: 'present' }, { text: 'React', state: 'present' },
          { text: 'SQL', state: 'present' }, { text: 'AWS', state: 'present' },
          { text: 'Docker', state: 'missing' }, { text: 'Kubernetes', state: 'missing' }
        ]
      },
      {
        title: 'Key Insights',
        icon: 'fa-lightbulb',
        type: 'insights',
        items: [
          { icon: 'fa-check-circle', tone: 'success', text: 'Strong Python & ML background' },
          { icon: 'fa-check-circle', tone: 'success', text: '5+ relevant projects identified' },
          { icon: 'fa-circle-exclamation', tone: 'warning', text: 'Missing cloud orchestration skills' }
        ]
      }
    ],
    techstack: [
      {
        title: 'Tech Stack Comparison',
        icon: 'fa-code',
        type: 'tech-cols',
        cv: ['Python', 'JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        job: ['Python', 'JavaScript', 'React', 'Docker', 'Kubernetes', 'AWS', 'MongoDB', 'TypeScript']
      },
      {
        title: 'Industry Terminology',
        icon: 'fa-industry',
        type: 'badges',
        items: [
          { text: 'Microservices', state: 'present' }, { text: 'RESTful API', state: 'present' },
          { text: 'Cloud Native', state: 'present' }, { text: 'CI/CD', state: 'present' },
          { text: 'Serverless', state: 'missing' }, { text: 'Event-Driven', state: 'missing' }
        ]
      }
    ],
    experience: [
      {
        title: 'Experience Comparison',
        icon: 'fa-clock',
        type: 'exp-stats',
        stats: [
          { value: '5.2', label: 'CV Years' },
          { value: '4.0', label: 'Required Years' },
          { value: '72%', label: 'Relevance' },
          { value: '+1.2', label: 'Years Advantage' }
        ]
      },
      {
        title: 'Gap Alert',
        icon: 'fa-triangle-exclamation',
        type: 'gap-alert',
        text: '8-month gap detected between Jun 2023 & Feb 2024'
      },
      {
        title: 'Project Relevance',
        icon: 'fa-briefcase',
        type: 'projects',
        items: [
          { text: 'ML Pipeline Automation', value: '92%', tone: 'success' },
          { text: 'Data Dashboard', value: '78%', tone: 'primary' },
          { text: 'E-commerce API', value: '55%', tone: 'warning' }
        ]
      },
      {
        title: 'Career Timeline',
        icon: 'fa-timeline',
        type: 'timeline',
        alert: '8-month gap detected between Jun 2023 & Feb 2024',
        items: [
          { title: 'Senior Engineer, TechCorp', period: '2022 - Present' },
          { title: 'ML Engineer, DataFlow', period: '2020 - 2023' },
          { title: 'Junior Dev, StartUp', period: '2018 - 2020' }
        ]
      }
    ],
    achievements: [
      {
        title: 'Quantifiable Achievements',
        icon: 'fa-trophy',
        type: 'achievements',
        items: [
          'Increased model accuracy by <strong>34%</strong> through feature engineering',
          'Reduced deployment time by <strong>60%</strong> with CI/CD pipeline',
          'Managed a team of <strong>5</strong> engineers delivering 3 major releases',
          'Improved query performance by <strong>45%</strong> via database optimization',
          'Generated <strong>$200K</strong> revenue through ML-powered recommendations'
        ]
      },
      {
        title: 'Action Verb Strength',
        icon: 'fa-pen',
        type: 'verbs',
        items: [
          { verb: 'Achieved', rating: 'Strong', strength: 4 },
          { verb: 'Led', rating: 'Strong', strength: 4 },
          { verb: 'Helped', rating: 'Weak', strength: 1 }
        ]
      }
    ],
    structure: [
      {
        title: 'Structure Overview',
        icon: 'fa-layer-group',
        type: 'stat-grid',
        stats: [
          { value: '82%', label: 'Completeness', tone: 'success' },
          { value: '68', label: 'Readability (Grade 9)', tone: 'primary' },
          { value: '90%', label: 'Formatting', tone: 'success' },
          { value: '2', label: 'Missing Sections', tone: 'warning' }
        ]
      },
      {
        title: 'Section Check',
        icon: 'fa-list',
        type: 'checklist',
        present: ['Contact Info', 'Professional Summary', 'Work Experience', 'Education', 'Skills'],
        missing: ['Certifications', 'Projects Section']
      }
    ],
    interview: [
      {
        title: 'Technical Interview Questions',
        icon: 'fa-question',
        type: 'interview',
        questions: [
          'Explain the difference between supervised and unsupervised learning. Provide examples of algorithms for each.',
          'How would you design a system to handle real-time data processing for millions of events per second?',
          'Describe a time you optimized a slow database query. What tools and techniques did you use?',
          'Explain RESTful API design principles. How do you handle versioning and error responses?',
          'What is the CAP theorem? How does it apply to choosing a database for a distributed system?'
        ]
      }
    ],
    salary: [
      {
        title: 'Estimated Salary Range',
        icon: 'fa-dollar-sign',
        type: 'salary',
        amount: '$135K - $175K',
        note: 'Based on your stack, experience, and location'
      },
      {
        title: 'Salary Factors',
        icon: 'fa-sliders',
        type: 'factors',
        items: [
          { label: 'Tech Stack Premium', value: '+$15K', tone: 'success' },
          { label: 'Years Experience', value: '+$10K', tone: 'success' },
          { label: 'Location (Remote)', value: '-$5K', tone: 'neutral' },
          { label: 'Missing Cloud Skills', value: '-$8K', tone: 'danger' },
          { label: 'Industry (Tech)', value: '+$12K', tone: 'success' }
        ]
      }
    ]
  };

  function renderModeCards(mode) {
    $('modeSpecificCards').innerHTML = (MODE_SECTIONS[mode] || []).map(renderSection).join('');
  }

  function renderSection(s) {
    switch (s.type) {
      case 'tech-cols':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="tech-cols">
              <div>
                <h5 class="col-label">Your CV</h5>
                <div class="badge-group">${s.cv.map((t) => `<span class="badge primary">${escapeHtml(t)}</span>`).join('')}</div>
              </div>
              <div>
                <h5 class="col-label">Job Requires</h5>
                <div class="badge-group">${s.job.map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join('')}</div>
              </div>
            </div>
          </div>`;
      case 'badges':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            ${s.intro ? `<p class="card-intro">${s.intro}</p>` : ''}
            <div class="badge-group">
              ${s.items.map((i) => `
                <span class="badge ${i.state === 'present' ? 'primary' : ''}">
                  <i class="fas ${i.state === 'present' ? 'fa-check' : 'fa-plus'}"></i> ${escapeHtml(i.text)}
                </span>`).join('')}
            </div>
          </div>`;
      case 'insights':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <ul class="insight-list">
              ${s.items.map((i) => `<li class="insight-item"><i class="fas ${i.icon} tone-${i.tone}"></i> <span>${i.text}</span></li>`).join('')}
            </ul>
          </div>`;
      case 'exp-stats':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="experience-stats">
              ${s.stats.map((x) => `<div class="exp-stat"><div class="exp-value">${x.value}</div><div class="exp-label">${x.label}</div></div>`).join('')}
            </div>
          </div>`;
      case 'gap-alert':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="gap-alert"><i class="fas fa-clock"></i> ${s.text}</div>
          </div>`;
      case 'projects':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="project-list">
              ${s.items.map((i) => `<div class="project-row"><span>${escapeHtml(i.text)}</span><span class="value tone-${i.tone}">${i.value}</span></div>`).join('')}
            </div>
          </div>`;
      case 'timeline':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            ${s.alert ? `<div class="gap-alert timeline-alert"><i class="fas fa-clock"></i> ${s.alert}</div>` : ''}
            <div class="timeline-list">
              ${s.items.map((i) => `<div class="timeline-row"><span>${escapeHtml(i.title)}</span><span class="period">${i.period}</span></div>`).join('')}
            </div>
          </div>`;
      case 'achievements':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <ul class="achievement-list">
              ${s.items.map((i) => `<li class="achievement-item"><i class="fas fa-check-circle"></i> <span>${i}</span></li>`).join('')}
            </ul>
          </div>`;
      case 'verbs':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="verb-list">
              ${s.items.map((v) => `
                <div class="verb-row">
                  <div class="verb-header">
                    <span>${escapeHtml(v.verb)}</span>
                    <span class="verb-rating ${v.strength >= 4 ? 'tone-success' : 'tone-danger'}">${v.rating}</span>
                  </div>
                  <div class="verb-strength">
                    ${Array.from({ length: 5 }, (_, k) => `<span class="bar ${k < v.strength ? 'filled' : ''}"></span>`).join('')}
                  </div>
                </div>`).join('')}
            </div>
          </div>`;
      case 'stat-grid':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="structure-grid">
              ${s.stats.map((x) => `<div class="structure-item"><div class="s-value tone-${x.tone}">${x.value}</div><div class="s-label">${x.label}</div></div>`).join('')}
            </div>
          </div>`;
      case 'checklist':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="checklist">
              ${s.present.map((x) => `<div class="check-item"><i class="fas fa-check tone-success"></i> ${x}</div>`).join('')}
              ${s.missing.map((x) => `<div class="check-item"><i class="fas fa-xmark tone-danger"></i> ${x}</div>`).join('')}
            </div>
          </div>`;
      case 'interview':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="interview-list">
              ${s.questions.map((q, i) => `<div class="interview-item"><div class="interview-num">${i + 1}</div><div class="interview-text">${q}</div></div>`).join('')}
            </div>
          </div>`;
      case 'salary':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="salary-range">
              <div class="salary-amount">${s.amount}</div>
              <div class="salary-note">${s.note}</div>
            </div>
          </div>`;
      case 'factors':
        return `
          <div class="result-card">
            <h4 class="result-card-title"><i class="fas ${s.icon}"></i> ${s.title}</h4>
            <div class="salary-factors">
              ${s.items.map((i) => `<div class="factor-row"><span class="factor-label">${i.label}</span><span class="factor-value tone-${i.tone}">${i.value}</span></div>`).join('')}
            </div>
          </div>`;
      default:
        return '';
    }
  }

  /* ==========================================================
     HISTORY (localStorage only)
     ========================================================== */

  function initHistory() {
    $('clearHistoryBtn').addEventListener('click', handleClearHistory);
    $('historySearch').addEventListener('input', (e) => {
      state.historyQuery = e.target.value;
      renderHistory();
    });
    $('historyBody').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (btn.dataset.action === 'view') viewHistoryEntry(id);
      else deleteHistoryEntry(id);
    });
  }

  function saveHistory(data) {
    const mode = currentMode();
    const cvName = state.cvFile
      ? state.cvFile.name
      : state.cvSource
        ? state.cvSource.label
        : 'Pasted CV text';
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      cvName,
      mode: mode.title,
      modeId: mode.id,
      score: data.score
    };
    state.history.unshift(entry);
    if (state.history.length > HISTORY_LIMIT) state.history.pop();
    storageSet('sm_history', state.history);
  }

  function renderHistory() {
    const query = state.historyQuery.trim().toLowerCase();
    const items = state.history.filter((h) => (
      !query || `${h.cvName} ${h.mode} ${h.date}`.toLowerCase().includes(query)
    ));
    const hasAny = state.history.length > 0;

    $('historyEmpty').hidden = hasAny;
    $('historyToolbar').hidden = !hasAny;
    $('historyNoMatch').hidden = !(hasAny && items.length === 0);
    $('historyTableWrap').hidden = items.length === 0;
    $('historyCount').textContent = hasAny ? `${items.length} of ${state.history.length} analyses` : '';
    $('clearHistoryBtn').disabled = !hasAny;

    const body = $('historyBody');
    const frag = document.createDocumentFragment();
    items.forEach((h) => {
      const tr = document.createElement('tr');
      const scoreClass = h.score >= 75 ? 'tone-success' : h.score >= 55 ? 'tone-warning' : 'tone-danger';
      tr.innerHTML = `
        <td class="td-date">${escapeHtml(h.date)}</td>
        <td class="td-name" title="${escapeHtml(h.cvName)}">${escapeHtml(h.cvName)}</td>
        <td>${escapeHtml(h.mode)}</td>
        <td><span class="history-score ${scoreClass}">${h.score}%</span></td>
        <td class="td-actions">
          <button class="btn btn-secondary btn-sm" data-action="view" data-id="${h.id}" type="button"><i class="fas fa-eye"></i> View</button>
          <button class="btn-icon btn-danger-icon" data-action="delete" data-id="${h.id}" aria-label="Delete entry" type="button"><i class="fas fa-trash-can"></i></button>
        </td>`;
      frag.appendChild(tr);
    });
    body.innerHTML = '';
    body.appendChild(frag);
  }

  function deleteHistoryEntry(id) {
    const entry = state.history.find((h) => h.id === id);
    if (!entry) return;
    state.history = state.history.filter((h) => h.id !== id);
    storageSet('sm_history', state.history);
    renderHistory();
    showToast(`Removed "${entry.cvName}" from history`, 'success');
  }

  async function handleClearHistory() {
    if (!state.history.length) return;
    const ok = await openConfirm({
      title: 'Clear all history?',
      message: 'This will permanently delete every saved analysis.',
      confirmLabel: 'Clear all'
    });
    if (!ok) return;
    state.history = [];
    storageSet('sm_history', state.history);
    renderHistory();
    showToast('History cleared', 'success');
  }

  /* ==========================================================
     DETAILED REPORT
     ========================================================== */

  function initReport() {
    document.querySelectorAll('.report-tab').forEach((tab) => {
      tab.addEventListener('click', () => selectReportTab(tab.dataset.reportTab));
    });
  }

  function selectReportTab(tabId) {
    document.querySelectorAll('.report-tab').forEach((t) => t.classList.toggle('active', t.dataset.reportTab === tabId));
    document.querySelectorAll('.report-panel').forEach((p) => p.classList.toggle('active', p.dataset.reportPanel === tabId));
    populateReportPanel(tabId);
  }

  function openReport(data) {
    state.reportData = data || state.lastResult || generateMockData(state.mode);
    navigateTo('report');
  }

  function populateReportPanel(tabId) {
    const panel = $(`report${cap(tabId)}`);
    if (!panel) return;

    if (tabId === 'overview') {
      const data = state.reportData || generateMockData(state.mode);
      panel.innerHTML = `
        <div class="result-card">
          <h4 class="result-card-title"><i class="fas fa-chart-bar"></i> Overall Match</h4>
          <div class="tech-cols">
            <div class="score-circle-wrapper">
              <div class="score-circle" id="reportScoreCircle">
                <span class="score-value"><span id="reportScoreNumber">0</span><span class="score-pct">%</span></span>
                <span class="score-label">Match</span>
              </div>
            </div>
            <div>
              <h5 class="col-label">Skill Breakdown</h5>
              ${skillsHtml(data.skills)}
            </div>
          </div>
        </div>
        <div class="result-card" style="margin-top:1.25rem;">
          <h4 class="result-card-title"><i class="fas fa-tags"></i> Keywords</h4>
          ${keywordsHtml(data)}
        </div>`;
      animateScore($('reportScoreCircle'), $('reportScoreNumber'), data.score);
      animateBars(panel);
      return;
    }

    panel.innerHTML = (MODE_SECTIONS[tabId] || []).map(renderSection).join('');
  }

  function viewHistoryEntry(id) {
    const entry = state.history.find((h) => h.id === id);
    if (!entry) return;
    const mock = generateMockData(entry.modeId);
    openReport({ ...mock, score: entry.score });
  }

  /* ==========================================================
     RESULTS SIDE ACTIONS
     ========================================================== */

  function initResultsActions() {
    $('reportBtn').addEventListener('click', () => openReport());
    $('exportPdfBtn').addEventListener('click', exportPdf);
    $('shareBtn').addEventListener('click', shareResults);
    $('newAnalysisBtn').addEventListener('click', resetAnalysis);
    $('dismissError').addEventListener('click', hideError);
    $('backToDashboard').addEventListener('click', () => navigateTo('dashboard'));
  }

  function exportPdf() {
    // TODO: FastAPI / real export — replace with a server-side PDF
    // generation endpoint or a library when required.
    showToast('Opening print dialog — choose "Save as PDF"', 'info');
    setTimeout(() => window.print(), 300);
  }

  function shareResults() {
    const score = state.lastResult ? `${state.lastResult.score}%` : '--';
    const text = `SkillMatch Pro — ${currentMode().title}: ${score} match`;
    const done = () => showToast('Results summary copied to clipboard', 'success');
    const fail = () => showToast('Could not copy to clipboard', 'error');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fail);
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        done();
      } catch (e) {
        fail();
      }
    }
  }

  function resetAnalysis() {
    state.runTimers.forEach(clearTimeout);
    state.runTimers = [];
    state.analyzing = false;
    state.cvFile = null;
    state.jdFile = null;
    state.cvSource = null;
    state.jdSource = null;
    state.cvText = '';
    state.jdText = '';

    clearFileInArea(cvUpload);
    clearFileInArea(jdUpload);
    document.querySelectorAll('[data-imported-state]').forEach((el) => { el.hidden = true; });
    document.querySelectorAll('[data-url-input]').forEach((el) => { el.value = ''; });
    $('cvTextarea').value = '';
    $('jdTextarea').value = '';
    $('cvCharCount').textContent = '0';
    $('jdCharCount').textContent = '0';
    $('resultsSection').hidden = true;
    $('resultsSkeleton').hidden = true;
    $('liveLogs').hidden = true;
    $('liveLogs').classList.remove('is-running');
    hideError();
    setLogStatus('running');
    updateAnalyzeBtn();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================
     PRICING (design only — no payment integration)
     ========================================================== */

  function initPricing() {
    document.querySelectorAll('.pricing-cta').forEach((btn) => {
      btn.addEventListener('click', () => {
        // TODO: FastAPI / payments — wire this to a real checkout flow later.
        showToast('Plan selection will be available soon', 'info');
      });
    });
  }

  /* ==========================================================
     TOASTS, ERRORS & CONFIRM MODAL
     ========================================================== */

  function showToast(msg, type = 'success') {
    const icons = { success: 'fa-check-circle', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span>${escapeHtml(msg)}</span>`;
    $('toast-container').appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  let errorTimer = null;

  function showError(msg) {
    $('errorMessage').textContent = msg;
    $('errorToast').hidden = false;
    clearTimeout(errorTimer);
    errorTimer = setTimeout(hideError, 5000);
  }

  function hideError() {
    clearTimeout(errorTimer);
    $('errorToast').hidden = true;
  }

  let confirmCallback = null;
  let confirmLastFocus = null;

  function initConfirmModal() {
    $('confirmCancel').addEventListener('click', () => settleConfirm(false));
    $('confirmOk').addEventListener('click', () => settleConfirm(true));
    $('confirmModal').addEventListener('click', (e) => {
      if (e.target === $('confirmModal')) settleConfirm(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('confirmModal').hidden) settleConfirm(false);
    });
  }

  function openConfirm({ title, message, confirmLabel = 'Confirm' }) {
    $('confirmTitle').textContent = title;
    $('confirmMessage').textContent = message;
    $('confirmOk').textContent = confirmLabel;
    confirmLastFocus = document.activeElement;
    $('confirmModal').hidden = false;
    $('confirmCancel').focus();
    return new Promise((resolve) => { confirmCallback = resolve; });
  }

  function settleConfirm(result) {
    if (!confirmCallback) return;
    const cb = confirmCallback;
    confirmCallback = null;
    $('confirmModal').hidden = true;
    if (confirmLastFocus) confirmLastFocus.focus();
    cb(result);
  }

  /* ==========================================================
     INIT
     ========================================================== */

  let initialized = false;

  function init() {
    // Guard against double initialization (e.g. script loaded twice).
    if (initialized) return;
    initialized = true;

    initTheme();
    initNavigation();
    initTabs();
    initSubTabs();
    initUploads();
    initCharCounters();
    initModeSelector();
    initHomeFeatures();
    initLinkImports();
    initProfile();
    initHistory();
    initReport();
    initAnalyzeButton();
    initResultsActions();
    initPricing();
    initMobileMenu();
    initConfirmModal();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
