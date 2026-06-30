/* =====================================================
   auth.js — Login page logic
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initLoginPage();
});

function initLoginPage() {
  const form       = document.getElementById("loginForm");
  const adminTab   = document.getElementById("tabAdmin");
  const studentTab = document.getElementById("tabStudent");
  if (!form) return;

  // Redirect if already logged in
  const existing = getSession();
  if (existing) { redirectByRole(existing.role); return; }

  // Show live student count
  const countEl = document.getElementById("totalCount");
  if (countEl) countEl.textContent = getStudents().length;

  let activeRole = "admin";

  adminTab?.addEventListener("click",   () => switchTab("admin"));
  studentTab?.addEventListener("click", () => switchTab("student"));

  function switchTab(role) {
    activeRole = role;
    adminTab.classList.toggle("active",   role === "admin");
    studentTab.classList.toggle("active", role === "student");

    const userLabel = document.getElementById("userLabel");
    const userInput = document.getElementById("username");
    const hint      = document.getElementById("loginHint");
    const registerLink = document.getElementById("registerLink");

    if (role === "admin") {
      userLabel.textContent = "Email Address";
      userInput.placeholder = "admin@university.edu";
      userInput.type = "email";
      if (hint) hint.innerHTML = 'Default credentials: ';
      if (registerLink) registerLink.style.display = "none";
    } else {
      userLabel.textContent = "Student ID";
      userInput.placeholder = "e.g. CS2024001";
      userInput.type = "text";
      if (hint) hint.innerHTML = 'Use your <strong>Student ID</strong> as username and the <strong>password you set</strong> during registration.';
      if (registerLink) registerLink.style.display = "block";
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const btn      = form.querySelector("[type=submit]");
    const errEl    = document.getElementById("loginError");

    if (!username || !password) {
      showError(errEl, "Please fill in all fields.");
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block"></span> Signing in…`;
    if (errEl) errEl.style.display = "none";

    try {
      if (activeRole === "admin") {
        const creds = getAdminCredentials();
        if (username !== creds.email || password !== creds.password) {
          throw new Error("Invalid email or password.");
        }
        setSession({ role: "admin", name: "Administrator", email: username });
        redirectByRole("admin");
      } else {
        const student = findStudentByStudentId(username);
        if (!student) throw new Error("Student ID not found. Please register first.");
        if (password !== student.password) throw new Error("Incorrect password.");
        setSession({ role: "student", name: student.fullName, studentId: student.studentId, id: student.id });
        redirectByRole("student");
      }
    } catch (err) {
      showError(errEl, err.message || "Login failed.");
      btn.disabled = false;
      btn.innerHTML = `Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
    }
  });
}

function showError(el, msg) {
  if (!el) { alert(msg); return; }
  el.textContent = msg;
  el.style.display = "block";
}

function logout() {
  clearSession();
  window.location.href = "../../index.html";
}
