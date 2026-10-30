/* =====================================================
   store.js — Data layer
   Student data lives in Google Sheets via a Google Apps Script
   web app (API_URL). Only the login session uses localStorage.
===================================================== */
const API_URL =
  "https://script.google.com/macros/s/AKfycbyt0kdOEXeiwL4zj6bCfdmqA-qiUikKOfqxvuh5N9Y9rDzvrNkPiCougtY8vOs23R6j/exec";
const SESSION_KEY  = "sreg_user";

// ── API HELPER ───────────────────────────────────────
// Every call is a POST with the session token attached. The backend checks
// the token, so list / update / delete only work for a logged-in admin.
async function api(action, payload = {}) {
  const session = getSession();
  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ ...payload, action, token: session?.token })
    });
  } catch {
    throw new Error("Cannot reach the server. Check your connection.");
  }

  const out = await res.json();
  if (!out.success) {
    if (out.error === "Unauthorized") {
      clearSession();
      window.location.href = location.pathname.includes("/pages/") ? "../../index.html" : "index.html";
      throw new Error("Session expired. Please sign in again.");
    }
    throw new Error(out.error || "Request failed.");
  }
  return out;
}

// ── STUDENTS ──────────────────────────────────────────
// Public count for the login page (no personal data).
async function getStudentCount() {
  const res = await fetch(API_URL);
  return (await res.json()).count;
}

// Admin only.
async function getStudents() {
  return (await api("list")).students;
}

async function addStudent(data) {
  return await api("register", { student: data });
}

async function updateStudent(id, data) {
  return await api("update", { id, ...data });
}

async function deleteStudent(id) {
  return await api("delete", { id });
}

// Students get their own record; admins search the full list.
async function findStudentByStudentId(studentId) {
  const session = getSession();
  if (session?.role === "student") {
    return (await api("me")).student || null;
  }
  const students = await getStudents();
  return students.find(s => String(s.studentId).toLowerCase() === String(studentId).toLowerCase()) || null;
}

// ── SESSION ──────────────────────────────────────────
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function requireAuth(role) {
  const user = getSession();
if (!user) {
    window.location.href = "../../index.html";
    return null;
}

  if (role && user.role !== role) {
    window.location.href =
      user.role === "admin"
        ? "../admin/dashboard.html"
        : "../student/dashboard.html";
    return null;
  }

  return user;
}
function redirectByRole(role) {
  if (role === "admin") {
    window.location.href = "./pages/admin/dashboard.html";
  } else {
    window.location.href = "./pages/student/dashboard.html";
  }
}

