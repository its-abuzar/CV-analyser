const S = {
  page: 'home',
  theme: 'dark',
  mode: 'core',
  file: null,
  cvTab: 'upload',
  jdTab: 'jd-text',
  jdText: '',
  analyzing: false,
  history: JSON.parse(localStorage.getItem('sm_history') || '[]')
};

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

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initTabs();
  initUpload();
  initCharCounter();
  initModeSelector();
  initAnalyzeButton();
  initHomeFeatures();
  initNewAnalysis();
  initHistory();
  initSideActions();
  initMobileMenu();
});

function initTheme() {
  const saved = localStorage.getItem('sm_theme');
  if (saved) S.theme = saved;
  applyTheme();
  document.getElementById('themeToggle').addEventListener('click', () => {
    S.theme = S.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sm_theme', S.theme);
    applyTheme();
  });
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', S.theme);
}

function initNavigation() {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });
  navigateTo('home');
}

function navigateTo(page) {
  S.page = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (navLink) navLink.classList.add('active');
  document.getElementById('navLinks')?.classList.remove('open');
  if (page === 'history') renderHistory();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initTabs() {
  document.querySelectorAll('.tab-bar').forEach(bar => {
    bar.addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const barEl = tab.closest('.tab-bar');
      const isCV = barEl.id === 'cvTabs';
      const isJD = barEl.id === 'jdTabs';
      barEl.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      const parentCard = barEl.closest('.card');
      parentCard.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const content = parentCard.querySelector(`[data-tab-content="${tabId}"]`);
      if (content) content.classList.add('active');
      if (isCV) S.cvTab = tabId;
      if (isJD) S.jdTab = tabId;
    });
  });
  document.querySelector('#cvTabs .tab.active')?.click();
  document.querySelector('#jdTabs .tab.active')?.click();
}

function initUpload() {
  const area = document.getElementById('uploadArea');
  const input = document.getElementById('cvFileInput');
  area.addEventListener('click', () => input.click());
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  input.addEventListener('change', () => {
    if (input.files.length) handleFile(input.files[0]);
  });
  document.getElementById('removeFileBtn').addEventListener('click', e => {
    e.stopPropagation();
    clearFile();
  });
}

function handleFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['pdf', 'docx'].includes(ext)) {
    showError('Please select a PDF or DOCX file');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError('File size must be less than 10MB');
    return;
  }
  S.file = file;
  const area = document.getElementById('uploadArea');
  area.classList.add('has-file');
  document.getElementById('uploadContent').hidden = true;
  document.getElementById('fileInfo').hidden = false;
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('errorToast').hidden = true;
  updateAnalyzeBtn();
}

function clearFile() {
  S.file = null;
  document.getElementById('cvFileInput').value = '';
  document.getElementById('uploadArea').classList.remove('has-file');
  document.getElementById('uploadContent').hidden = false;
  document.getElementById('fileInfo').hidden = true;
  updateAnalyzeBtn();
}

function initCharCounter() {
  const ta = document.getElementById('jdTextarea');
  ta.addEventListener('input', () => {
    S.jdText = ta.value;
    document.getElementById('jdCharCount').textContent = ta.value.length;
    updateAnalyzeBtn();
  });
}

function initModeSelector() {
  const grid = document.getElementById('modeGrid');
  grid.innerHTML = '';
  MODES.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = `mode-card ${m.id === S.mode ? 'active' : ''}`;
    card.dataset.mode = m.id;
    card.innerHTML = `<i class="fas ${m.icon}"></i><h4>${m.title}</h4><p>${m.desc}</p>`;
    card.addEventListener('click', () => selectMode(m.id));
    grid.appendChild(card);
    if (i === 0) card.classList.add('active');
  });
}

function initHomeFeatures() {
  const grid = document.getElementById('homeFeatureGrid');
  grid.innerHTML = '';
  MODES.forEach(m => {
    const card = document.createElement('div');
    card.className = 'feature-card';
    card.innerHTML = `<i class="fas ${m.icon}"></i><h4>${m.title}</h4><p>${m.desc}</p>`;
    card.addEventListener('click', () => { selectMode(m.id); navigateTo('dashboard'); });
    grid.appendChild(card);
  });
}

function selectMode(id) {
  S.mode = id;
  document.querySelectorAll('.mode-card').forEach(c => {
    c.classList.toggle('active', c.dataset.mode === id);
  });
  const mode = MODES.find(m => m.id === id);
  if (mode) document.getElementById('analyzeBtnText').textContent = `Run ${mode.title} Analysis`;
  updateAnalyzeBtn();
}

function initAnalyzeButton() {
  document.getElementById('analyzeBtn').addEventListener('click', runAnalysis);
  updateAnalyzeBtn();
}

function updateAnalyzeBtn() {
  const btn = document.getElementById('analyzeBtn');
  const ready = S.file && S.jdText.trim().length > 0 && !S.analyzing;
  btn.disabled = !ready;
}

function runAnalysis() {
  if (S.analyzing || !S.file || !S.jdText.trim()) return;
  S.analyzing = true;
  updateAnalyzeBtn();
  document.getElementById('errorToast').hidden = true;
  document.getElementById('resultsSection').hidden = true;
  document.getElementById('analyzeBtn').querySelector('.btn-text').hidden = true;
  document.getElementById('analyzeBtn').querySelector('.btn-loader').hidden = false;
  const logs = document.getElementById('liveLogs');
  logs.hidden = false;
  const body = document.getElementById('logsBody');
  body.innerHTML = '';
  const logSteps = [
    { text: 'Initializing analysis engine...', type: 'info', delay: 100 },
    { text: 'Parsing CV document...', type: 'info', delay: 400 },
    { text: 'Extracting skills & experience...', type: 'info', delay: 700 },
    { text: 'Analyzing job description...', type: 'info', delay: 1000 },
    { text: 'Computing keyword matches...', type: 'info', delay: 1300 },
    { text: 'Generating mode-specific insights...', type: 'info', delay: 1600 },
    { text: 'Analysis complete', type: 'success', delay: 1900 }
  ];
  logSteps.forEach(step => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = `log-line log-${step.type}`;
      line.innerHTML = `<i class="fas fa-${step.type === 'success' ? 'check' : 'circle'}"></i> ${step.text}`;
      body.appendChild(line);
      body.scrollTop = body.scrollHeight;
    }, step.delay);
  });
  setTimeout(() => {
    document.getElementById('logsStatus').textContent = 'Complete';
    const data = generateMockData(S.mode);
    displayResults(data);
    saveHistory(data.score);
    S.analyzing = false;
    updateAnalyzeBtn();
    document.getElementById('analyzeBtn').querySelector('.btn-text').hidden = false;
    document.getElementById('analyzeBtn').querySelector('.btn-loader').hidden = true;
  }, 2200);
}

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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function displayResults(data) {
  animateScore(data.score);
  document.getElementById('scoreDetails').querySelector('.stat-matched').textContent = data.matched.length;
  document.getElementById('scoreDetails').querySelector('.stat-missing').textContent = data.missing.length;
  document.getElementById('scoreDetails').querySelector('.stat-keywords').textContent = data.matched.length + data.missing.length;
  renderSkillBars(data.skills);
  renderTags('matchedTags', data.matched, 'matched');
  renderTags('missingTags', data.missing, 'missing');
  document.getElementById('matchedCount').textContent = data.matched.length;
  document.getElementById('missingCount').textContent = data.missing.length;
  renderModeCards(data.mode);
  document.getElementById('resultsSection').hidden = false;
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function animateScore(target) {
  const circle = document.getElementById('scoreCircle');
  const valueEl = document.getElementById('scoreValue');
  const clamped = Math.max(0, Math.min(100, Math.round(target)));
  const dur = 1200;
  const start = performance.now();

  function update(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const current = Math.round(clamped * ease);
    valueEl.innerHTML = `${current}<span class="score-pct">%</span>`;
    const deg = (current / 100) * 360;
    circle.style.background = `conic-gradient(var(--primary) ${deg}deg, var(--bg-tertiary) ${deg}deg)`;
    if (p < 1) requestAnimationFrame(update);
    else {
      valueEl.innerHTML = `${clamped}<span class="score-pct">%</span>`;
      circle.style.background = `conic-gradient(var(--primary) ${(clamped / 100) * 360}deg, var(--bg-tertiary) ${(clamped / 100) * 360}deg)`;
    }
  }
  requestAnimationFrame(update);
}

function renderSkillBars(skills) {
  const container = document.getElementById('skillBars');
  container.innerHTML = '';
  skills.forEach((s, i) => {
    const item = document.createElement('div');
    item.className = 'skill-bar-item';
    const level = s.value >= 75 ? 'high' : s.value >= 55 ? 'med' : 'low';
    item.innerHTML = `
      <div class="skill-bar-header">
        <span class="skill-bar-label">${s.label}</span>
        <span class="skill-bar-value">${s.value}%</span>
      </div>
      <div class="skill-bar-track">
        <div class="skill-bar-fill ${level}" style="width:0%"></div>
      </div>
    `;
    container.appendChild(item);
    setTimeout(() => {
      item.querySelector('.skill-bar-fill').style.width = `${s.value}%`;
    }, 100 + i * 150);
  });
}

function renderTags(containerId, items, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!items.length) {
    container.classList.add('empty');
    return;
  }
  container.classList.remove('empty');
  items.forEach((kw, i) => {
    const tag = document.createElement('span');
    tag.className = `tag ${type}`;
    tag.textContent = kw;
    tag.style.animationDelay = `${i * 40}ms`;
    container.appendChild(tag);
  });
}

function renderModeCards(mode) {
  const container = document.getElementById('modeSpecificCards');
  container.innerHTML = '';
  if (mode === 'core') {
    container.innerHTML = `
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-code"></i> Tech Stack Summary</h4>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.75rem;">Python, JavaScript, React, Node.js, PostgreSQL</p>
        <div class="badge-group">
          <span class="badge primary"><i class="fas fa-check"></i> Python</span>
          <span class="badge primary"><i class="fas fa-check"></i> React</span>
          <span class="badge primary"><i class="fas fa-check"></i> SQL</span>
          <span class="badge primary"><i class="fas fa-check"></i> AWS</span>
          <span class="badge"><i class="fas fa-plus"></i> Docker</span>
          <span class="badge"><i class="fas fa-plus"></i> Kubernetes</span>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-lightbulb"></i> Key Insights</h4>
        <ul style="list-style:none;font-size:0.85rem;display:flex;flex-direction:column;gap:0.5rem;">
          <li style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-check-circle" style="color:var(--success);"></i> Strong Python & ML background</li>
          <li style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-check-circle" style="color:var(--success);"></i> 5+ relevant projects identified</li>
          <li style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-circle-exclamation" style="color:var(--warning);"></i> Missing cloud orchestration skills</li>
        </ul>
      </div>`;
  } else if (mode === 'techstack') {
    container.innerHTML = `
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-code"></i> Technologies: CV</h4>
        <div class="badge-group">
          <span class="badge primary">Python</span> <span class="badge primary">JavaScript</span> <span class="badge primary">React</span>
          <span class="badge primary">Node.js</span> <span class="badge primary">PostgreSQL</span> <span class="badge primary">AWS</span>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-briefcase"></i> Technologies: Job</h4>
        <div class="badge-group">
          <span class="badge primary">Python</span> <span class="badge primary">JavaScript</span> <span class="badge primary">React</span>
          <span class="badge">Docker</span> <span class="badge">Kubernetes</span> <span class="badge">AWS</span>
          <span class="badge">MongoDB</span> <span class="badge">TypeScript</span>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-industry"></i> Industry Terminology</h4>
        <div class="badge-group">
          <span class="badge primary"><i class="fas fa-check"></i> Microservices</span>
          <span class="badge primary"><i class="fas fa-check"></i> RESTful API</span>
          <span class="badge primary"><i class="fas fa-check"></i> Cloud Native</span>
          <span class="badge primary"><i class="fas fa-check"></i> CI/CD</span>
          <span class="badge"><i class="fas fa-xmark"></i> Serverless</span>
          <span class="badge"><i class="fas fa-xmark"></i> Event-Driven</span>
        </div>
      </div>`;
  } else if (mode === 'experience') {
    container.innerHTML = `
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-clock"></i> Experience Comparison</h4>
        <div class="experience-stats">
          <div class="exp-stat"><div class="exp-value">5.2</div><div class="exp-label">CV Years</div></div>
          <div class="exp-stat"><div class="exp-value">4.0</div><div class="exp-label">Required Years</div></div>
          <div class="exp-stat"><div class="exp-value">72%</div><div class="exp-label">Relevance</div></div>
          <div class="exp-stat"><div class="exp-value">+1.2</div><div class="exp-label">Years Advantage</div></div>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-triangle-exclamation"></i> Gap Alert</h4>
        <div class="gap-alert"><i class="fas fa-clock"></i> 8-month gap detected between Jun 2023 & Feb 2024</div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-briefcase"></i> Project Relevance</h4>
        <div style="display:flex;flex-direction:column;gap:0.6rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;padding:0.5rem 0.75rem;background:var(--bg);border-radius:var(--radius-sm);border:1px solid var(--border-light);">
            <span>ML Pipeline Automation</span> <span style="font-weight:600;color:var(--success);">92%</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;padding:0.5rem 0.75rem;background:var(--bg);border-radius:var(--radius-sm);border:1px solid var(--border-light);">
            <span>Data Dashboard</span> <span style="font-weight:600;color:var(--primary);">78%</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;padding:0.5rem 0.75rem;background:var(--bg);border-radius:var(--radius-sm);border:1px solid var(--border-light);">
            <span>E-commerce API</span> <span style="font-weight:600;color:var(--warning);">55%</span>
          </div>
        </div>
      </div>`;
  } else if (mode === 'achievements') {
    container.innerHTML = `
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-trophy"></i> Quantifiable Achievements</h4>
        <div class="achievement-list">
          <div class="achievement-item"><i class="fas fa-check-circle"></i> <span>Increased model accuracy by <strong>34%</strong> through feature engineering</span></div>
          <div class="achievement-item"><i class="fas fa-check-circle"></i> <span>Reduced deployment time by <strong>60%</strong> with CI/CD pipeline</span></div>
          <div class="achievement-item"><i class="fas fa-check-circle"></i> <span>Managed a team of <strong>5</strong> engineers delivering 3 major releases</span></div>
          <div class="achievement-item"><i class="fas fa-check-circle"></i> <span>Improved query performance by <strong>45%</strong> via database optimization</span></div>
          <div class="achievement-item"><i class="fas fa-check-circle"></i> <span>Generated <strong>$200K</strong> revenue through ML-powered recommendations</span></div>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-pen"></i> Action Verb Strength</h4>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.25rem;">
              <span style="color:var(--text-secondary);">Achieved</span> <span style="font-weight:600;">Strong</span>
            </div>
            <div class="verb-strength"><span class="bar filled"></span><span class="bar filled"></span><span class="bar filled"></span><span class="bar filled"></span><span class="bar"></span></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.25rem;">
              <span style="color:var(--text-secondary);">Led</span> <span style="font-weight:600;">Strong</span>
            </div>
            <div class="verb-strength"><span class="bar filled"></span><span class="bar filled"></span><span class="bar filled"></span><span class="bar filled"></span><span class="bar"></span></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.25rem;">
              <span style="color:var(--text-secondary);">Helped</span> <span style="font-weight:600;">Weak</span>
            </div>
            <div class="verb-strength"><span class="bar filled"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span></div>
          </div>
        </div>
      </div>`;
  } else if (mode === 'structure') {
    container.innerHTML = `
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-layer-group"></i> Structure Overview</h4>
        <div class="structure-grid">
          <div class="structure-item"><div class="s-value" style="color:var(--success);">82%</div><div class="s-label">Completeness</div></div>
          <div class="structure-item"><div class="s-value" style="color:var(--primary);">68</div><div class="s-label">Readability (Grade 9)</div></div>
          <div class="structure-item"><div class="s-value" style="color:var(--success);">90%</div><div class="s-label">Formatting</div></div>
          <div class="structure-item"><div class="s-value" style="color:var(--warning);">2</div><div class="s-label">Missing Sections</div></div>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-list"></i> Section Check</h4>
        <div style="display:flex;flex-direction:column;gap:0.35rem;font-size:0.85rem;">
          <div style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-check" style="color:var(--success);"></i> Contact Info</div>
          <div style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-check" style="color:var(--success);"></i> Professional Summary</div>
          <div style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-check" style="color:var(--success);"></i> Work Experience</div>
          <div style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-check" style="color:var(--success);"></i> Education</div>
          <div style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-check" style="color:var(--success);"></i> Skills</div>
          <div style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-xmark" style="color:var(--danger);"></i> Certifications</div>
          <div style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-xmark" style="color:var(--danger);"></i> Projects Section</div>
        </div>
      </div>`;
  } else if (mode === 'interview') {
    container.innerHTML = `
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-question"></i> Technical Interview Questions</h4>
        <div class="interview-list">
          <div class="interview-item"><div class="interview-num">1</div><div class="interview-text">Explain the difference between supervised and unsupervised learning. Provide examples of algorithms for each.</div></div>
          <div class="interview-item"><div class="interview-num">2</div><div class="interview-text">How would you design a system to handle real-time data processing for millions of events per second?</div></div>
          <div class="interview-item"><div class="interview-num">3</div><div class="interview-text">Describe a time you optimized a slow database query. What tools and techniques did you use?</div></div>
          <div class="interview-item"><div class="interview-num">4</div><div class="interview-text">Explain RESTful API design principles. How do you handle versioning and error responses?</div></div>
          <div class="interview-item"><div class="interview-num">5</div><div class="interview-text">What is the CAP theorem? How does it apply to choosing a database for a distributed system?</div></div>
        </div>
      </div>`;
  } else if (mode === 'salary') {
    container.innerHTML = `
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-dollar-sign"></i> Estimated Salary Range</h4>
        <div class="salary-range">
          <div class="salary-amount">$135K - $175K</div>
          <div class="salary-note">Based on your stack, experience, and location</div>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-sliders"></i> Salary Factors</h4>
        <div class="salary-factors">
          <div class="factor-row"><span class="factor-label">Tech Stack Premium</span> <span class="factor-value" style="color:var(--success);">+$15K</span></div>
          <div class="factor-row"><span class="factor-label">Years Experience</span> <span class="factor-value" style="color:var(--success);">+$10K</span></div>
          <div class="factor-row"><span class="factor-label">Location (Remote)</span> <span class="factor-value" style="color:var(--text);">-$5K</span></div>
          <div class="factor-row"><span class="factor-label">Missing Cloud Skills</span> <span class="factor-value" style="color:var(--danger);">-$8K</span></div>
          <div class="factor-row"><span class="factor-label">Industry (Tech)</span> <span class="factor-value" style="color:var(--success);">+$12K</span></div>
        </div>
      </div>`;
  }
}

function saveHistory(score) {
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    cvName: S.file ? S.file.name : 'Unknown',
    mode: MODES.find(m => m.id === S.mode)?.title || 'Unknown',
    score
  };
  S.history.unshift(entry);
  localStorage.setItem('sm_history', JSON.stringify(S.history));
}

function initHistory() {
  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (S.history.length === 0) return;
    if (confirm('Clear all analysis history?')) {
      S.history = [];
      localStorage.setItem('sm_history', JSON.stringify(S.history));
      renderHistory();
      showToast('History cleared', 'success');
    }
  });
}

function renderHistory() {
  const empty = document.getElementById('historyEmpty');
  const wrap = document.getElementById('historyTableWrap');
  const body = document.getElementById('historyBody');
  if (S.history.length === 0) {
    empty.hidden = false;
    wrap.hidden = true;
    return;
  }
  empty.hidden = true;
  wrap.hidden = false;
  body.innerHTML = '';
  S.history.forEach(h => {
    const tr = document.createElement('tr');
    const scoreClass = h.score >= 75 ? 'color:var(--success)' : h.score >= 55 ? 'color:var(--warning)' : 'color:var(--danger)';
    tr.innerHTML = `
      <td style="white-space:nowrap;">${h.date}</td>
      <td>${h.cvName}</td>
      <td>${h.mode}</td>
      <td><span class="history-score" style="${scoreClass}">${h.score}%</span></td>
      <td><button class="btn btn-secondary btn-sm view-history-btn" data-id="${h.id}"><i class="fas fa-eye"></i> View</button></td>`;
    body.appendChild(tr);
  });
  body.querySelectorAll('.view-history-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = S.history.find(h => h.id === Number(btn.dataset.id));
      if (entry) showToast(`Viewing: ${entry.cvName} (${entry.mode})`, 'success');
    });
  });
}

function initNewAnalysis() {
  document.getElementById('newAnalysisBtn').addEventListener('click', resetAnalysis);
}

function resetAnalysis() {
  clearFile();
  document.getElementById('jdTextarea').value = '';
  S.jdText = '';
  document.getElementById('jdCharCount').textContent = '0';
  document.getElementById('resultsSection').hidden = true;
  document.getElementById('liveLogs').hidden = true;
  document.getElementById('errorToast').hidden = true;
  document.getElementById('logsStatus').textContent = 'Running';
  updateAnalyzeBtn();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initSideActions() {
  document.getElementById('exportPdfBtn').addEventListener('click', () => showToast('PDF report exported', 'success'));
  document.getElementById('shareBtn').addEventListener('click', () => showToast('Share link copied to clipboard', 'success'));
  document.getElementById('dismissError').addEventListener('click', () => document.getElementById('errorToast').hidden = true);
  document.getElementById('backToDashboard').addEventListener('click', () => navigateTo('dashboard'));
  initReportTabs();
}

function initReportTabs() {
  document.querySelectorAll('.report-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.report-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(`report${tab.dataset.reportTab.charAt(0).toUpperCase() + tab.dataset.reportTab.slice(1)}`);
      if (panel) {
        panel.classList.add('active');
        populateReportPanel(tab.dataset.reportTab);
      }
    });
  });
  document.querySelector('.report-tab.active')?.click();
}

function populateReportPanel(tabId) {
  const panel = document.getElementById(`report${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  if (!panel || panel.dataset.populated) return;
  panel.dataset.populated = 'true';
  if (tabId === 'overview') {
    panel.innerHTML = `
      <div class="result-card" style="margin-bottom:1.25rem;">
        <h4 class="result-card-title"><i class="fas fa-chart-bar"></i> Overall Match</h4>
        <div style="display:flex;align-items:center;gap:2rem;flex-wrap:wrap;">
          <div class="score-circle" style="width:120px;height:120px;background:conic-gradient(var(--primary) 281deg, var(--bg-tertiary) 281deg);flex-shrink:0;">
            <span style="position:relative;z-index:1;font-size:2rem;font-weight:700;">78<span style="font-size:0.85rem;color:var(--text-muted);">%</span></span>
            <span style="position:relative;z-index:1;font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;">Match</span>
          </div>
          <div style="flex:1;">
            <div style="display:flex;flex-direction:column;gap:0.5rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.85rem;"><span>Technical Skills</span><span style="font-weight:600;">82%</span></div>
              <div class="skill-bar-track"><div class="skill-bar-fill high" style="width:82%"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:0.85rem;"><span>Domain Knowledge</span><span style="font-weight:600;">65%</span></div>
              <div class="skill-bar-track"><div class="skill-bar-fill med" style="width:65%"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:0.85rem;"><span>Soft Skills</span><span style="font-weight:600;">71%</span></div>
              <div class="skill-bar-track"><div class="skill-bar-fill med" style="width:71%"></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-tags"></i> Keywords</h4>
        <div class="keywords-grid">
          <div class="keyword-group"><h5><span class="kw-dot matched"></span> Matched <span class="kw-count">7</span></h5>
            <div class="tags-container">${MOCK_KEYWORDS.matched.slice(0, 7).map(k => `<span class="tag matched">${k}</span>`).join('')}</div>
          </div>
          <div class="keyword-group"><h5><span class="kw-dot missing"></span> Missing <span class="kw-count">4</span></h5>
            <div class="tags-container">${MOCK_KEYWORDS.missing.slice(0, 4).map(k => `<span class="tag missing">${k}</span>`).join('')}</div>
          </div>
        </div>
      </div>`;
  } else if (tabId === 'techstack') {
    panel.innerHTML = `
      <div class="result-card" style="margin-bottom:1.25rem;">
        <h4 class="result-card-title"><i class="fas fa-code"></i> Tech Stack Comparison</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
          <div><h5 style="font-size:0.8rem;font-weight:600;margin-bottom:0.5rem;color:var(--text-secondary);">Your CV</h5>
            <div class="badge-group">${['Python','JavaScript','React','Node.js','PostgreSQL','AWS'].map(t => `<span class="badge primary">${t}</span>`).join('')}</div>
          </div>
          <div><h5 style="font-size:0.8rem;font-weight:600;margin-bottom:0.5rem;color:var(--text-secondary);">Job Requires</h5>
            <div class="badge-group">${['Python','JavaScript','React','Docker','Kubernetes','AWS','MongoDB'].map(t => `<span class="badge">${t}</span>`).join('')}</div>
          </div>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-industry"></i> Industry Terminology</h4>
        <div class="badge-group">
          <span class="badge primary">Microservices</span><span class="badge primary">RESTful API</span>
          <span class="badge">Serverless</span><span class="badge">Event-Driven</span>
        </div>
      </div>`;
  } else if (tabId === 'experience') {
    panel.innerHTML = `
      <div class="result-card" style="margin-bottom:1.25rem;">
        <h4 class="result-card-title"><i class="fas fa-clock"></i> Experience Breakdown</h4>
        <div class="experience-stats">
          <div class="exp-stat"><div class="exp-value">5.2</div><div class="exp-label">Total Years</div></div>
          <div class="exp-stat"><div class="exp-value">4</div><div class="exp-label">Relevant Years</div></div>
          <div class="exp-stat"><div class="exp-value">3</div><div class="exp-label">Companies</div></div>
          <div class="exp-stat"><div class="exp-value">2.1</div><div class="exp-label">Avg Tenure</div></div>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-timeline"></i> Career Timeline</h4>
        <div class="gap-alert" style="margin-bottom:0.75rem;"><i class="fas fa-clock"></i> 8-month gap detected between Jun 2023 & Feb 2024</div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.85rem;">
          <div style="display:flex;justify-content:space-between;padding:0.4rem 0.75rem;background:var(--bg);border-radius:var(--radius-sm);"><span>Senior Engineer, TechCorp</span><span style="color:var(--text-muted);">2022 - Present</span></div>
          <div style="display:flex;justify-content:space-between;padding:0.4rem 0.75rem;background:var(--bg);border-radius:var(--radius-sm);"><span>ML Engineer, DataFlow</span><span style="color:var(--text-muted);">2020 - 2023</span></div>
          <div style="display:flex;justify-content:space-between;padding:0.4rem 0.75rem;background:var(--bg);border-radius:var(--radius-sm);"><span>Junior Dev, StartUp</span><span style="color:var(--text-muted);">2018 - 2020</span></div>
        </div>
      </div>`;
  } else if (tabId === 'achievements') {
    panel.innerHTML = `
      <div class="result-card" style="margin-bottom:1.25rem;">
        <h4 class="result-card-title"><i class="fas fa-trophy"></i> Quantifiable Wins</h4>
        <div class="achievement-list">
          <div class="achievement-item"><i class="fas fa-check-circle"></i> <span>Increased model accuracy by <strong>34%</strong></span></div>
          <div class="achievement-item"><i class="fas fa-check-circle"></i> <span>Reduced deployment time by <strong>60%</strong></span></div>
          <div class="achievement-item"><i class="fas fa-check-circle"></i> <span>Managed team of <strong>5</strong> engineers</span></div>
          <div class="achievement-item"><i class="fas fa-check-circle"></i> <span>Improved query perf by <strong>45%</strong></span></div>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-pen"></i> Action Verb Analysis</h4>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.75rem;">Score: <strong style="color:var(--primary);">68%</strong> - Good use of strong verbs</p>
        <div style="display:flex;flex-direction:column;gap:0.4rem;">
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;padding:0.3rem 0;border-bottom:1px solid var(--border-light);"><span>Achieved, Led, Delivered</span><span style="color:var(--success);font-weight:600;">Strong</span></div>
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;padding:0.3rem 0;border-bottom:1px solid var(--border-light);"><span>Worked, Helped, Got</span><span style="color:var(--danger);font-weight:600;">Weak</span></div>
        </div>
      </div>`;
  } else if (tabId === 'structure') {
    panel.innerHTML = `
      <div class="result-card" style="margin-bottom:1.25rem;">
        <h4 class="result-card-title"><i class="fas fa-layer-group"></i> Structure & Readability</h4>
        <div class="structure-grid">
          <div class="structure-item"><div class="s-value" style="color:var(--success);">82%</div><div class="s-label">Completeness</div></div>
          <div class="structure-item"><div class="s-value" style="color:var(--primary);">68</div><div class="s-label">Readability</div></div>
          <div class="structure-item"><div class="s-value" style="color:var(--success);">90%</div><div class="s-label">Formatting</div></div>
          <div class="structure-item"><div class="s-value" style="color:var(--warning);">2</div><div class="s-label">Missing</div></div>
        </div>
      </div>
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-list"></i> Section Checklist</h4>
        <div style="display:flex;flex-direction:column;gap:0.35rem;font-size:0.85rem;">
          ${['Contact Info','Professional Summary','Work Experience','Education','Skills'].map(s => `<div style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-check" style="color:var(--success);"></i> ${s}</div>`).join('')}
          ${['Certifications','Projects'].map(s => `<div style="display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-xmark" style="color:var(--danger);"></i> ${s}</div>`).join('')}
        </div>
      </div>`;
  } else if (tabId === 'interview') {
    panel.innerHTML = `
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-question"></i> Generated Questions</h4>
        <div class="interview-list">
          ${[1,2,3,4,5].map(n => {
            const questions = [
              'Explain the difference between supervised and unsupervised learning.',
              'How would you design a real-time data processing system?',
              'Describe optimizing a slow database query.',
              'Explain RESTful API design principles.',
              'What is the CAP theorem and how does it apply?'
            ];
            return `<div class="interview-item"><div class="interview-num">${n}</div><div class="interview-text">${questions[n-1]}</div></div>`;
          }).join('')}
        </div>
      </div>`;
  } else if (tabId === 'salary') {
    panel.innerHTML = `
      <div class="result-card">
        <h4 class="result-card-title"><i class="fas fa-dollar-sign"></i> Market Rate</h4>
        <div class="salary-range">
          <div class="salary-amount">$135K - $175K</div>
          <div class="salary-note">Annual salary estimate for your profile</div>
        </div>
      </div>
      <div class="result-card" style="margin-top:1.25rem;">
        <h4 class="result-card-title"><i class="fas fa-sliders"></i> Factors</h4>
        <div class="salary-factors">
          <div class="factor-row"><span class="factor-label">Tech Stack</span><span class="factor-value" style="color:var(--success);">+$15K</span></div>
          <div class="factor-row"><span class="factor-label">Experience</span><span class="factor-value" style="color:var(--success);">+$10K</span></div>
          <div class="factor-row"><span class="factor-label">Location</span><span class="factor-value" style="color:var(--text);">-$5K</span></div>
          <div class="factor-row"><span class="factor-label">Skill Gaps</span><span class="factor-value" style="color:var(--danger);">-$8K</span></div>
          <div class="factor-row"><span class="factor-label">Industry Demand</span><span class="factor-value" style="color:var(--success);">+$12K</span></div>
        </div>
      </div>`;
  }
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'circle-exclamation'}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showError(msg) {
  document.getElementById('errorMessage').textContent = msg;
  document.getElementById('errorToast').hidden = false;
  setTimeout(() => document.getElementById('errorToast').hidden = true, 5000);
}

function initMobileMenu() {
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
}
