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
