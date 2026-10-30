/**
 * StudentReg backend — Google Apps Script web app
 *
 * Security model
 *  - Passwords are salted + hashed (never stored or returned in plain text).
 *  - Student/admin login happens HERE, not in the browser.
 *  - Login returns a random session token (valid 6 hours).
 *  - list / update / delete require an ADMIN token.
 *  - "me" requires a STUDENT token and returns only that student's record.
 *  - "register" is public (self sign-up) but validated server-side.
 *  - Repeated failed logins are throttled (5 tries / 15 minutes).
 *
 * One-time setup after pasting this file:
 *  1. Run migratePasswords() once from the editor (hashes existing passwords).
 *  2. Deploy > Manage deployments > pencil icon > Version: New version > Deploy.
 */

const SHEET_ID = "YOUR_STUDENTS_SPREADSHEET_ID";
const SHEET_NAME = "Students";

const ADMIN_SHEET_ID = "YOUR_ADMIN_SPREADSHEET_ID";
const ADMIN_SHEET = "Admin"; // column A = email, column B = password

const DEPARTMENTS = [
  "Computer Science", "Information Technology", "Electronics",
  "Mechanical", "Civil", "Electrical", "MBA", "MCA"
];
const YEARS = ["1", "2", "3", "4"];
const GENDERS = ["Male", "Female", "Other"];
const EDITABLE_FIELDS = ["fullName", "email", "phone", "department", "year", "gender"];

const TOKEN_TTL_SECONDS = 21600; // 6 hours (CacheService maximum)
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_SECONDS = 900;     // 15 minutes
const HASH_PREFIX = "sha256$";

/* ───────────────────────── Entry points ───────────────────────── */

// Public, harmless: only returns how many students exist (login page counter).
function doGet() {
  const sheet = studentsSheet_();
  return json_({ ok: true, count: Math.max(sheet.getLastRow() - 1, 0) });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    switch (data.action) {
      case "adminLogin":
        return json_(adminLogin_(data));

      case "studentLogin":
        return json_(studentLogin_(data));

      case "register": // public self-registration + admin "Register Student"
        return json_(register_(data));

      case "list": {
        requireRole_(data.token, "admin");
        const { rows } = readStudents_(studentsSheet_());
        return json_({ success: true, students: rows.map(r => publicStudent_(r.rec)) });
      }

      case "me": {
        const session = requireRole_(data.token, "student");
        const { rows } = readStudents_(studentsSheet_());
        const found = rows.find(r => sameId_(r.rec.studentId, session.studentId));
        return json_({ success: true, student: found ? publicStudent_(found.rec) : null });
      }

      case "update":
        requireRole_(data.token, "admin");
        return json_(update_(data));

      case "delete":
        requireRole_(data.token, "admin");
        return json_(delete_(data));

      default:
        fail_("Unknown action.");
    }
  } catch (err) {
    if (err.isUserError) return json_({ success: false, error: err.message });
    console.error(err);
    return json_({ success: false, error: "Server error. Please try again." });
  }
}

/* ───────────────────────── Actions ───────────────────────── */

function adminLogin_(data) {
  const email = str_(data.email, 100).toLowerCase();
  const password = String(data.password == null ? "" : data.password);
  const throttleKey = "admin:" + email;
  assertNotLocked_(throttleKey);

  const sheet = SpreadsheetApp.openById(ADMIN_SHEET_ID).getSheetByName(ADMIN_SHEET);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() !== email) continue;

    const check = verifyPassword_(password, values[i][1]);
    if (check.ok) {
      if (check.legacy) writeText_(sheet.getRange(i + 1, 2), hashPassword_(password));
      clearFails_(throttleKey);
      return { success: true, token: createSession_({ role: "admin", email: email }) };
    }
    break;
  }

  recordFail_(throttleKey);
  fail_("Invalid email or password.");
}

function studentLogin_(data) {
  const studentId = str_(data.studentId, 30);
  const password = String(data.password == null ? "" : data.password);
  const throttleKey = "student:" + studentId.toLowerCase();
  assertNotLocked_(throttleKey);

  const sheet = studentsSheet_();
  const { headers, rows } = readStudents_(sheet);
  const found = rows.find(r => sameId_(r.rec.studentId, studentId));

  if (found) {
    const check = verifyPassword_(password, found.rec.password);
    if (check.ok) {
      if (check.legacy) {
        writeText_(sheet.getRange(found.row, headers.indexOf("password") + 1), hashPassword_(password));
      }
      clearFails_(throttleKey);
      return {
        success: true,
        token: createSession_({ role: "student", studentId: String(found.rec.studentId) }),
        student: publicStudent_(found.rec)
      };
    }
  }

  recordFail_(throttleKey);
  fail_("Invalid Student ID or password.");
}

function register_(data) {
  const s = data.student || {};
  const clean = {
    studentId: str_(s.studentId, 30),
    fullName: str_(s.fullName, 100),
    email: str_(s.email, 100),
    phone: str_(s.phone, 20),
    department: str_(s.department, 60),
    year: str_(s.year, 1),
    gender: str_(s.gender, 10)
  };
  validateFields_(clean);

  const password = String(s.password == null ? "" : s.password);
  if (!password) fail_("Password is required.");

  withLock_(() => {
    const sheet = studentsSheet_();
    const { headers, rows } = readStudents_(sheet);

    if (rows.some(r => sameId_(r.rec.studentId, clean.studentId))) {
      fail_("Student ID already exists.");
    }

    const record = Object.assign({
      id: "stu_" + Date.now() + "_" + Utilities.getUuid().slice(0, 6),
      password: hashPassword_(password),
      createdAt: new Date().toISOString()
    }, clean);

    const values = headers.map(h => (record[h] !== undefined ? record[h] : ""));
    const range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length);
    range.setNumberFormat("@"); // store as plain text: no formula injection, keeps leading zeros
    range.setValues([values]);
  });

  return { success: true };
}

function update_(data) {
  withLock_(() => {
    const sheet = studentsSheet_();
    const { headers, rows } = readStudents_(sheet);
    const target = rows.find(r => String(r.rec.id) === String(data.id));
    if (!target) fail_("Student not found.");

    const updates = {};
    EDITABLE_FIELDS.forEach(f => {
      if (f in data) updates[f] = str_(data[f], f === "phone" ? 20 : 100);
    });
    validateFields_(updates);

    if (data.password) updates.password = hashPassword_(String(data.password));

    Object.keys(updates).forEach(field => {
      const col = headers.indexOf(field);
      if (col >= 0) writeText_(sheet.getRange(target.row, col + 1), updates[field]);
    });
  });
  return { success: true };
}

function delete_(data) {
  withLock_(() => {
    const sheet = studentsSheet_();
    const { rows } = readStudents_(sheet);
    const target = rows.find(r => String(r.rec.id) === String(data.id));
    if (!target) fail_("Student not found.");
    sheet.deleteRow(target.row);
  });
  return { success: true };
}

/* ───────────────────────── Sessions & throttling ───────────────────────── */

function createSession_(info) {
  const token = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put("sess:" + token, JSON.stringify(info), TOKEN_TTL_SECONDS);
  return token;
}

function requireRole_(token, role) {
  const raw = token ? CacheService.getScriptCache().get("sess:" + token) : null;
  const session = raw ? JSON.parse(raw) : null;
  if (!session || session.role !== role) fail_("Unauthorized");
  return session;
}

function assertNotLocked_(key) {
  const fails = Number(CacheService.getScriptCache().get("fail:" + key) || 0);
  if (fails >= MAX_FAILED_LOGINS) fail_("Too many failed attempts. Try again in 15 minutes.");
}

function recordFail_(key) {
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get("fail:" + key) || 0) + 1;
  cache.put("fail:" + key, String(fails), LOCKOUT_SECONDS);
}

function clearFails_(key) {
  CacheService.getScriptCache().remove("fail:" + key);
}

/* ───────────────────────── Passwords ───────────────────────── */

// Salted SHA-256. Much better than plain text; for a production system use a
// slow hash (bcrypt/argon2) on a real backend.
function hashPassword_(password, salt) {
  salt = salt || Utilities.getUuid().replace(/-/g, "");
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, salt + ":" + password, Utilities.Charset.UTF_8);
  const hex = bytes.map(b => ("0" + (b & 0xff).toString(16)).slice(-2)).join("");
  return HASH_PREFIX + salt + "$" + hex;
}

// Returns { ok, legacy }. legacy = stored value was still plain text.
function verifyPassword_(password, stored) {
  stored = String(stored == null ? "" : stored);
  if (stored.indexOf(HASH_PREFIX) !== 0) {
    return { ok: stored !== "" && safeEqual_(stored, String(password)), legacy: true };
  }
  const salt = stored.split("$")[1];
  return { ok: safeEqual_(hashPassword_(password, salt), stored), legacy: false };
}

function safeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Run ONCE from the Apps Script editor to hash passwords already in the sheets.
function migratePasswords() {
  const targets = [
    { sheet: studentsSheet_(), passwordHeader: "password" },
    { sheet: SpreadsheetApp.openById(ADMIN_SHEET_ID).getSheetByName(ADMIN_SHEET), passwordCol: 1 }
  ];
  let changed = 0;

  targets.forEach(t => {
    const values = t.sheet.getDataRange().getValues();
    const col = t.passwordCol !== undefined ? t.passwordCol : values[0].indexOf(t.passwordHeader);
    if (col < 0) return;
    for (let i = 1; i < values.length; i++) {
      const pw = values[i][col];
      if (pw !== "" && String(pw).indexOf(HASH_PREFIX) !== 0) {
        writeText_(t.sheet.getRange(i + 1, col + 1), hashPassword_(String(pw)));
        changed++;
      }
    }
  });

  Logger.log("Hashed " + changed + " password(s).");
}

/* ───────────────────────── Helpers ───────────────────────── */

function studentsSheet_() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}

function readStudents_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0] || [];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const rec = {};
    headers.forEach((h, c) => { rec[h] = values[i][c]; });
    rows.push({ row: i + 1, rec: rec });
  }
  return { headers: headers, rows: rows };
}

function publicStudent_(rec) {
  const copy = Object.assign({}, rec);
  delete copy.password;
  return copy;
}

function validateFields_(f) {
  if ("studentId" in f && !f.studentId) fail_("Student ID is required.");
  if ("fullName" in f && !f.fullName) fail_("Full name is required.");
  if ("email" in f && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) fail_("Enter a valid email address.");
  if ("phone" in f && !f.phone) fail_("Phone is required.");
  if ("department" in f && DEPARTMENTS.indexOf(f.department) < 0) fail_("Select a valid department.");
  if ("year" in f && YEARS.indexOf(f.year) < 0) fail_("Select a valid academic year.");
  if ("gender" in f && GENDERS.indexOf(f.gender) < 0) fail_("Select a valid gender.");
}

function sameId_(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

function str_(value, maxLength) {
  return String(value == null ? "" : value).trim().slice(0, maxLength || 200);
}

function writeText_(range, value) {
  range.setNumberFormat("@");
  range.setValue(value);
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { fn(); } finally { lock.releaseLock(); }
}

function fail_(message) {
  const err = new Error(message);
  err.isUserError = true;
  throw err;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
