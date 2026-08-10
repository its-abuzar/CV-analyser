# Frontend Architecture Documentation

## Overview

The frontend is a **vanilla JavaScript (ES6+) single-page application** with no framework dependencies. It uses hash-based routing for page navigation and localStorage for data persistence.

## File Structure

```
frontend/
├── index.html      # Main HTML structure (571 lines)
├── script.js       # Application logic (1725+ lines)
└── style.css       # Styling (44062 bytes)
```

## Architecture Patterns

### 1. Module Pattern (IIFE)
```javascript
(() => {
  'use strict';
  // All code encapsulated
})();
```

### 2. State Management
Centralized `state` object holds all application state:
```javascript
const state = {
  page: 'home',
  theme: 'dark',
  mode: 'core',
  cvTab: 'cv-upload',
  jdTab: 'jd-text',
  cvFile: null,
  jdFile: null,
  // ... more state
};
```

### 3. Event Delegation
Single event listeners on parent elements with `data-*` attributes for action routing.

### 4. Render Functions
Each page/section has dedicated render functions called on state changes.

## Page System

### Pages (Hash-based Routing)
| Hash | Page | Description |
|------|------|-------------|
| `#home` | Home | Landing page with features |
| `#dashboard` | Dashboard | Main analysis interface |
| `#report` | Report | Detailed multi-tab report |
| `#history` | History | Past analyses |
| `#profile` | Profile | LinkedIn/GitHub links |
| `#pricing` | Pricing | Subscription plans |

### Navigation
```javascript
// In script.js
function navigate(page) {
  state.page = page;
  renderPage(page);
  window.location.hash = page;
}
```

## Component Architecture

### 1. Dashboard Page (Main Analysis Interface)

**Input Section:**
- CV Input: 4 tabs (Upload, LinkedIn, GitHub, Text)
- JD Input: 3 tabs (Upload, LinkedIn, Text)
- Analysis Mode Selector: 7 mode cards
- Analyze Button: Triggers simulation (TODO: FastAPI)

**Results Section:**
- Score Circle (animated SVG)
- Skill Breakdown (horizontal bars)
- Mode-Specific Cards (dynamic per mode)
- Keyword Analysis (matched/missing tags)

**Live Logs:**
- Real-time simulation with progress steps
- Expandable terminal-style output

### 2. Report Page (7 Tabs)

| Tab | ID | Content |
|-----|-----|---------|
| Overview | `overview` | Summary stats |
| Tech Stack | `techstack` | Technology comparison |
| Experience | `experience` | Timeline & gaps |
| Achievements | `achievements` | Quantified wins |
| Structure | `structure` | Resume format analysis |
| Interview | `interview` | Technical Q&A |
| Salary | `salary` | Market compensation data |

### 3. History Page
- Searchable/filterable table
- localStorage persistence (100 item limit)
- Clear history functionality

### 4. Profile Page
- LinkedIn URL input
- GitHub URL input
- Save to localStorage
- Used as defaults on Dashboard

## State Persistence

### localStorage Keys
| Key | Description |
|-----|-------------|
| `sm_profile` | LinkedIn/GitHub profile URLs |
| `sm_history` | Analysis history array |
| `sm_theme` | User theme preference |

### Storage Helpers
```javascript
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
    // Ignore quota/private mode errors
  }
}
```

## Theme System

### CSS Custom Properties
```css
:root {
  --bg-primary: #0d1117;
  --text-primary: #e6edf3;
  --accent: #58a6ff;
  /* ... more variables */
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #1f2328;
  /* ... light overrides */
}
```

### Theme Toggle
```javascript
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  storageSet('sm_theme', state.theme);
}
```

## Analysis Modes Configuration

```javascript
const MODES = [
  { id: 'core', icon: 'fa-percentage', title: 'Core Match', desc: 'Overall match score & skill breakdown' },
  { id: 'techstack', icon: 'fa-code', title: 'Tech Stack', desc: 'Extract & compare technologies' },
  { id: 'experience', icon: 'fa-briefcase', title: 'Experience', desc: 'Years, relevance & gaps' },
  { id: 'achievements', icon: 'fa-trophy', title: 'Achievements', desc: 'Quantifiable wins & action verbs' },
  { id: 'structure', icon: 'fa-file-lines', title: 'Resume Structure', desc: 'Sections, readability & format' },
  { id: 'interview', icon: 'fa-question', title: 'Tech Interview', desc: 'Technical questions & answers' },
  { id: 'salary', icon: 'fa-dollar-sign', title: 'Salary Intel', desc: 'Market rate for your stack' }
];
```

## File Upload Handling

### CV Upload
- Accept: `.pdf`, `.docx`
- Max size: 10MB
- Drag & drop + click to select
- FileReader API for preview

### JD Upload
- Accept: `.pdf`, `.docx`, `.txt`
- Max size: 10MB

### Text Input
- CV: 10,000 character limit
- JD: 5,000 character limit
- Live character counters

## Mock Data & Simulation

### Keywords (Mock)
```javascript
const MOCK_KEYWORDS = {
  matched: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'AWS', ...],
  missing: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'GraphQL', ...]
};
```

### Analysis Simulation
- `simulateAnalysis()` - Runs mock pipeline with setTimeout steps
- Live logs update in real-time
- Results populated with mock data
- **TODO: Replace with FastAPI calls** (marked throughout code)

## Integration Points (TODO: FastAPI)

Marked with comments throughout `script.js`:
```javascript
// TODO: FastAPI - Replace with actual API call
const response = await fetch('/api/analysis/compare', {
  method: 'POST',
  body: JSON.stringify({ cv, jd, mode })
});
```

### Required API Endpoints
1. `POST /analysis/compare` - Full analysis
2. `POST /analysis/mode` - Single mode analysis
3. `GET /analysis/history` - Fetch history
4. `POST /analysis/export` - Generate PDF
5. `POST /auth/*` - Authentication

## Accessibility Features

- Skip link for keyboard navigation
- ARIA labels on all interactive elements
- Semantic HTML structure
- Focus management
- Live regions for dynamic content
- Reduced motion support
- High contrast theme support

## Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Features
- Collapsible navigation (hamburger menu)
- Stacked input cards
- Touch-friendly targets (44px minimum)
- Optimized typography scaling

## Performance Considerations

- No external JS dependencies (except Font Awesome CDN)
- CSS custom properties for efficient theming
- Event delegation reduces listener count
- Debounced search/input handlers
- Lazy rendering of history table rows
- localStorage batching

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Workflow

### Local Development
```bash
# Serve frontend (any static server)
cd frontend
python -m http.server 8080
# or
npx serve .
```

### Building for Production
No build step required - vanilla JS/CSS/HTML.

### Testing
- Manual testing across browsers
- No automated test framework currently

## Future Improvements

1. **Framework Migration**: Consider React/Vue for complex state
2. **TypeScript**: Add type safety
3. **Build System**: Vite for bundling/optimization
4. **PWA**: Service worker for offline support
5. **Testing**: Vitest + Playwright
6. **i18n**: Internationalization support