/* =====================================================
   app.js — Shared utilities for all dashboard pages
===================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showToast(msg, type = "success") {
  let container = $(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const icons = { success: "✓", error: "✕", warn: "!", info: "ℹ" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || "ℹ"}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function esc(val = "") {
  return String(val).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function yearBadge(year) {
  const cls   = { "1": "badge-green", "2": "badge-blue", "3": "badge-purple", "4": "badge-gold" }[year] || "badge-gray";
  const label = { "1": "1st Year", "2": "2nd Year", "3": "3rd Year", "4": "4th Year" }[year] || year;
  return `<span class="badge ${cls}">${label}</span>`;
}

function genderBadge(g) {
  const cls = { "Male": "badge-blue", "Female": "badge-purple", "Other": "badge-gray" }[g] || "badge-gray";
  return `<span class="badge ${cls}">${esc(g)}</span>`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── SIDEBAR TOGGLE ───────────────────────────────────
function initSidebar() {
  const sidebar   = $(".sidebar");
  const overlay   = $(".sidebar-overlay");
  const hamburger = $(".hamburger-btn");

  hamburger?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("open");
  });
  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("open");
  });
}

function setActiveSidebarLink() {
  const current = location.pathname.split("/").pop();
  $$(".sidebar-link[href]").forEach(a => {
    const href = a.getAttribute("href")?.split("/").pop();
    if (href === current) a.classList.add("active");
  });
}

function populateSidebarUser() {
  const user = getSession();
  if (!user) return;
  const display = user.name || user.studentId || user.email || "User";
  const nameEl   = $(".sidebar-user-name");
  const roleEl   = $(".sidebar-user-role");
  const avatarEl = $(".sidebar-user-avatar");
  if (nameEl)   nameEl.textContent   = display;
  if (roleEl)   roleEl.textContent   = user.role === "admin" ? "Administrator" : "Student";
  if (avatarEl) avatarEl.textContent = display.charAt(0).toUpperCase();
}

function initLogout() {
  $$("[data-logout]").forEach(btn => {
    btn.addEventListener("click", () => {
      clearSession();
      window.location.href = "/index.html";
    });
  });
}

function validateForm(form, rules) {
  let valid = true;
  $$(".error", form).forEach(el => el.classList.remove("error"));
  $$(".field-error", form).forEach(el => { el.textContent = ""; el.classList.remove("show"); });

  for (const [field, rule] of Object.entries(rules)) {
    const input = form.elements[field];
    if (!input) continue;
    const val   = input.value.trim();
    const errEl = form.querySelector(`[data-error="${field}"]`);

    if (rule.required && !val) {
      markError(input, errEl, `${rule.label} is required.`);
      valid = false;
    } else if (rule.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      markError(input, errEl, "Enter a valid email address.");
      valid = false;
    } else if (rule.minLen && val.length < rule.minLen) {
      markError(input, errEl, `${rule.label} must be at least ${rule.minLen} characters.`);
      valid = false;
    }
  }
  return valid;
}

function markError(input, errEl, msg) {
  input.classList.add("error");
  if (errEl) { errEl.textContent = msg; errEl.classList.add("show"); }
}

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  setActiveSidebarLink();
  populateSidebarUser();
  initLogout();
});
