/* =====================================================
   store.js — localStorage-backed data store
   All student data persists across page loads.
===================================================== */
const API_URL =
  "https://script.google.com/macros/s/AKfycbyt0kdOEXeiwL4zj6bCfdmqA-qiUikKOfqxvuh5N9Y9rDzvrNkPiCougtY8vOs23R6j/exec";
const STUDENTS_KEY = "sreg_students";
const SESSION_KEY  = "sreg_user";

// ── STUDENTS ──────────────────────────────────────────
async function getStudents() {
  const res = await fetch(API_URL);
  return await res.json();
}

function saveStudents(arr) {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(arr));
}

async function addStudent(data) {
  const students = await getStudents();

  if (students.find(s => s.studentId === data.studentId)) {
    throw new Error("Student ID already exists.");
  }

  const student = {
    id: "stu_" + Date.now(),
    ...data,
    createdAt: new Date().toISOString()
  };

 await fetch(API_URL, {
  method: "POST",
  body: JSON.stringify(student)
});

  return student;
}

async function updateStudent(id, data) {

 const res = await fetch(API_URL, {
  method: "POST",
  body: JSON.stringify({
    action: "update",
    id: id,
    ...data
  })
});

  return await res.json();
}

async function deleteStudent(id) {

  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "delete",
      id: id
    })
  });

  return await res.json();
}

async function findStudentByStudentId(studentId) {
  const students = await getStudents();
  return students.find(s => s.studentId === studentId) || null;
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

// ── ADMIN AUTH ───────────────────────────────────────
// Admin credentials stored in localStorage so admin can be changed
const ADMIN_KEY = "sreg_admin";

function getAdminCredentials() {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY)); }
  catch { return null; }
}

function initDefaultAdmin() {
  if (!getAdminCredentials()) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify({ email: "admin@university.edu", password: "admin123" }));
  }
}

// Run on load
initDefaultAdmin();
