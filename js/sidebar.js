/* =====================================================
   sidebar.js — Injects sidebar + topbar into dashboard pages
===================================================== */

const ADMIN_SIDEBAR = `
<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <div class="sidebar-logo-text">
        <strong>StudentReg</strong>
        <span>University Portal</span>
      </div>
    </div>
  </div>

  <div class="sidebar-user">
    <div class="sidebar-user-info">
      <div class="sidebar-user-avatar">A</div>
      <div>
        <div class="sidebar-user-name">Administrator</div>
        <div class="sidebar-user-role">Admin</div>
      </div>
    </div>
  </div>

  <nav class="sidebar-nav">
    <div class="sidebar-section-label">Main</div>
    <a href="dashboard.html" class="sidebar-link">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      Dashboard
    </a>
    <a href="students.html" class="sidebar-link">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      All Students
    </a>
    <a href="register.html" class="sidebar-link">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
      Register Student
    </a>

    <div class="sidebar-section-label" style="margin-top:.5rem">Account</div>
    <button class="sidebar-link" data-logout>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Sign Out
    </button>
  </nav>
</aside>
<div class="sidebar-overlay" id="sidebarOverlay"></div>`;

const STUDENT_SIDEBAR = `
<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <div class="sidebar-logo-text">
        <strong>StudentReg</strong>
        <span>Student Portal</span>
      </div>
    </div>
  </div>

  <div class="sidebar-user">
    <div class="sidebar-user-info">
      <div class="sidebar-user-avatar">S</div>
      <div>
        <div class="sidebar-user-name">Student</div>
        <div class="sidebar-user-role">Student</div>
      </div>
    </div>
  </div>

  <nav class="sidebar-nav">
    <div class="sidebar-section-label">My Portal</div>
    <a href="dashboard.html" class="sidebar-link">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      Dashboard
    </a>
    <a href="profile.html" class="sidebar-link">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      My Profile
    </a>
    <a href="register.html" class="sidebar-link">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
      My Registration
    </a>

    <div class="sidebar-section-label" style="margin-top:.5rem">Account</div>
    <button class="sidebar-link" data-logout>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Sign Out
    </button>
  </nav>
</aside>
<div class="sidebar-overlay" id="sidebarOverlay"></div>`;

/* =====================================================
   sidebar.js — Injected components with Logout logic
===================================================== */

// ... (Keep your existing ADMIN_SIDEBAR and STUDENT_SIDEBAR constants here) ...

const TOPBAR_HTML = (title, role) => `
<header class="topbar">
  <div class="topbar-left">
    <button class="hamburger-btn" aria-label="Toggle sidebar">
      <span></span><span></span><span></span>
    </button>
    <div>
      <div class="topbar-title">${title}</div>
      <div class="topbar-breadcrumb">StudentReg University Portal</div>
    </div>
  </div>
  <div class="topbar-right">
    <span class="topbar-badge">${role === "admin" ? "Admin" : "Student"}</span>
  </div>
</header>`;

/**
 * Handles clearing the session and redirecting
 */
function performLogout() {
  localStorage.removeItem('sreg_user');
  window.location.href = "../../index.html";
}

/**
 * Injects layout and binds logout functionality
 */
function injectLayout(role, pageTitle) {
  const sidebarTarget = document.getElementById("sidebar-placeholder");
  const topbarTarget  = document.getElementById("topbar-placeholder");

  // Inject HTML
  if (sidebarTarget) sidebarTarget.innerHTML = role === "admin" ? ADMIN_SIDEBAR : STUDENT_SIDEBAR;
  if (topbarTarget)  topbarTarget.innerHTML  = TOPBAR_HTML(pageTitle, role);

  // Bind Logout Event
  const logoutBtn = document.querySelector("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      performLogout();
    });
  }
}