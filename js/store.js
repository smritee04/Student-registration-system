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

function updateStudent(id, data) {
  let students = getStudents();
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) throw new Error("Student not found.");
  students[idx] = { ...students[idx], ...data };
  saveStudents(students);
  return students[idx];
}

function deleteStudent(id) {
  let students = getStudents();
  students = students.filter(s => s.id !== id);
  saveStudents(students);
}

function findStudentByStudentId(studentId) {
  return getStudents().find(s => s.studentId === studentId) || null;
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
