// Shared utility functions

/**
 * Read quiz completion statistics from localStorage
 * @param {string} slug - Test identifier
 * @returns {Object} Stats object with starts and completions
 */
function getQuizStats(slug) {
  try {
    const raw = localStorage.getItem(`quizStats:${slug}`);
    const parsed = raw ? JSON.parse(raw) : null;
    return { starts: parsed?.starts || 0, completions: parsed?.completions || 0 };
  } catch (e) {
    return { starts: 0, completions: 0 };
  }
}

/**
 * Save quiz statistics to localStorage
 * @param {string} slug - Test identifier
 * @param {Object} stats - Stats object with starts and completions
 */
function saveQuizStats(slug, stats) {
  try {
    localStorage.setItem(`quizStats:${slug}`, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save quiz stats:', e);
  }
}

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Track analytics event
 * @param {string} eventName - Name of the event
 * @param {Object} data - Event data
 */
function track(eventName, data = {}) {
  if (typeof window.trackEvent === "function") {
    window.trackEvent(eventName, data);
    return;
  }
  if (typeof gtag === "function") {
    gtag('event', eventName, data);
  }
}

/**
 * Show toast notification
 * @param {string} msg - Message to display
 * @param {string} toastId - ID of toast element (default: 'toast')
 */
function showToast(msg, toastId = 'toast') {
  const t = document.getElementById(toastId);
  if (!t) return;
  
  // Ensure accessibility attributes are set
  if (!t.getAttribute("aria-live")) {
    t.setAttribute("aria-live", "polite");
    t.setAttribute("aria-atomic", "true");
    t.setAttribute("role", "status");
  }
  
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1200);
}

/**
 * Initialize theme from localStorage or system preference
 * Should be called as early as possible to prevent flash
 */
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  
  // If user has saved preference, use it
  if (savedTheme) {
    if (savedTheme === "light") {
      document.documentElement.classList.add("light-theme");
    }
    return;
  }
  
  // Otherwise, use system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (!prefersDark) {
    document.documentElement.classList.add("light-theme");
  }
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const root = document.documentElement;
  const isLight = root.classList.toggle("light-theme");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  
  // Update theme toggle button if it exists
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.textContent = isLight ? "☀️" : "🌙";
  }
  
  track("theme_toggle", { theme: isLight ? "light" : "dark" });
  return isLight;
}

// Initialize theme immediately on script load
initTheme();

function getLocalNumberMapValue(key, userId) {
  try {
    const map = JSON.parse(localStorage.getItem(key) || "{}");
    return Number(map?.[userId] || 0);
  } catch (e) {
    return 0;
  }
}

function setLocalNumberMapValue(key, userId, value) {
  try {
    const map = JSON.parse(localStorage.getItem(key) || "{}");
    map[userId] = Math.max(0, Number(value || 0));
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {}
}

function injectGlobalAccountBarStyle() {
  if (document.getElementById("globalAccountBarStyle")) return;
  const style = document.createElement("style");
  style.id = "globalAccountBarStyle";
  style.textContent = `
    .global-account-bar{
      display:flex;
      align-items:center;
      gap:8px;
      padding:8px 10px;
      border:1px solid var(--line);
      border-radius:14px;
      background:rgba(0,0,0,.18);
      backdrop-filter:blur(6px);
      box-shadow:0 10px 28px rgba(0,0,0,.25);
    }
    .global-account-bar.is-floating{
      position:fixed;
      top:12px;
      right:12px;
      z-index:1200;
    }
    .global-account-meta{
      font-size:13px;
      color:var(--text);
      white-space:nowrap;
    }
    .global-account-link{
      min-height:34px;
      padding:0 12px;
      border-radius:10px;
      border:1px solid var(--line);
      color:var(--text);
      background:rgba(255,255,255,.08);
      display:inline-flex;
      align-items:center;
      justify-content:center;
      font-weight:800;
      white-space:nowrap;
    }
    :root.light-theme .global-account-bar{ background:rgba(255,255,255,.68); }
    :root.light-theme .global-account-link{ background:rgba(164,150,148,.14); }
    @media (max-width:560px){
      .global-account-bar{ top:8px; right:8px; padding:6px 8px; border-radius:12px; }
      .global-account-meta{ font-size:11px; }
      .global-account-link{ min-height:30px; padding:0 10px; font-size:12px; }
    }
  `;
  document.head.appendChild(style);
}

async function resolveGlobalAccountState() {
  let user = null;
  let userId = "";
  let email = "";
  let generationCredits = 0;
  let reportCredits = 0;

  try {
    if (window.Supa?.isEnabled && window.Supa.isEnabled()) {
      user = await window.Supa.getCurrentUser();
      if (user?.id) {
        userId = String(user.id);
        email = String(user.email || "");
        generationCredits = Number(await window.Supa.getCredits(userId) || 0);
        reportCredits = Number(await window.Supa.getReportCredits(userId) || 0);
        setLocalNumberMapValue("genCreditsV1", userId, generationCredits);
        setLocalNumberMapValue("reportCreditsV1", userId, reportCredits);
      }
    }
  } catch (e) {}

  if (!userId) {
    try {
      if (window.Auth?.getCurrentUser) {
        user = window.Auth.getCurrentUser();
        if (user?.id) {
          userId = String(user.id);
          email = String(user.email || "");
        }
      }
    } catch (e) {}
  }

  if (!userId) {
    try { userId = String(localStorage.getItem("activeUserId") || ""); } catch (e) {}
  }

  if (userId) {
    if (!generationCredits) generationCredits = getLocalNumberMapValue("genCreditsV1", userId);
    if (!reportCredits) reportCredits = getLocalNumberMapValue("reportCreditsV1", userId);
    try { localStorage.setItem("activeUserId", userId); } catch (e) {}
  }

  return {
    loggedIn: !!userId,
    userId,
    email,
    generationCredits,
    reportCredits
  };
}

function renderGlobalAccountBar(state) {
  injectGlobalAccountBarStyle();
  let bar = document.getElementById("globalAccountBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "globalAccountBar";
    bar.className = "global-account-bar";
    document.body.appendChild(bar);
  }

  const next = encodeURIComponent(location.pathname + location.search);
  const href = state.loggedIn ? "/create-test.html" : `/login.html?next=${next}`;
  const label = state.loggedIn ? "내 계정" : "로그인";
  const meta = state.loggedIn
    ? `생성권 ${Number(state.generationCredits || 0)} · 이용권 ${Number(state.reportCredits || 0)}`
    : "생성권 - · 이용권 -";

  bar.innerHTML = `
    <span class="global-account-meta">${meta}</span>
    <a class="global-account-link" href="${href}">${label}</a>
  `;
  positionGlobalAccountBar();
}

function positionGlobalAccountBar() {
  const bar = document.getElementById("globalAccountBar");
  if (!bar) return;
  const toggle = document.getElementById("themeToggle");
  if (toggle && toggle.parentElement) {
    const parent = toggle.parentElement;
    if (bar.parentElement !== parent) parent.insertBefore(bar, toggle);
    bar.classList.remove("is-floating");
    bar.style.top = "";
    bar.style.right = "";
    return;
  }
  if (bar.parentElement !== document.body) document.body.appendChild(bar);
  bar.classList.add("is-floating");
  bar.style.top = "12px";
  bar.style.right = "12px";
}

async function initGlobalAccountBar() {
  if (!document.body) return;
  const state = await resolveGlobalAccountState();
  renderGlobalAccountBar(state);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { initGlobalAccountBar(); });
} else {
  initGlobalAccountBar();
}
window.addEventListener("resize", positionGlobalAccountBar);
window.addEventListener("scroll", positionGlobalAccountBar, { passive: true });
