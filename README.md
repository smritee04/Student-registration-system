# StudentReg — University Student Registration Portal

**Live demo:** https://smritee04.github.io/Student-registration-system/

A student registration and management system built with HTML, CSS, and JavaScript. The project provides separate dashboards for administrators and students, enabling registration, profile management, and student record administration through a responsive web interface.

---

## Project Structure

```
studentreg/
├── index.html                    # Login page (Admin + Student)
├── backend/
│   └── Code.gs                   # Google Apps Script API (paste into your own project)
├── css/
│   └── style.css                 # Full design system
├── js/
│   ├── store.js                  # Data layer — Google Apps Script API + session
│   ├── auth.js                   # Login page logic
│   ├── app.js                    # Shared utilities (toast, badges, etc.)
│   └── sidebar.js                # Sidebar + topbar injection
└── pages/
    ├── admin/
    │   ├── dashboard.html         # Admin overview with stats
    │   ├── students.html          # Full student list (search, edit, delete)
    │   └── register.html          # Admin adds a new student
    └── student/
        ├── signup.html            # Public registration (no login needed)
        ├── dashboard.html         # Student's personal dashboard
        ├── profile.html           # Full profile view
        └── register.html          # View own registration record
```

---

## How to Run

No build step, no server required. Just open the files in a browser.

**Option 1 — Direct open:**
Double-click `index.html` to open it in your browser.

> ⚠ Some browsers restrict `localStorage` and network requests on `file://` URLs. If login doesn't work, use Option 2.

**Option 2 — Local server (recommended):**

Using Python:
```bash
cd studentreg
python -m http.server 3000
```
Then open `http://localhost:3000` in your browser.

Using Node.js (npx):
```bash
cd studentreg
npx serve .
```

---

## Credentials

### Admin
Admin login is verified by the Google Apps Script backend against an `Admin` sheet (email in column A, password in column B). No credentials are stored in this repository.

### Students
Students must register first via the **"Register here"** link on the login page. After registering, they log in with their **Student ID** and the **password they set**.

If a student is added by the admin (via Register Student), their default password is their **Student ID**. They should change it through the admin if needed.

---

## User Flows

### Student Registration Flow
1. Go to `index.html`
2. Click the **Student** tab
3. Click **"Register here"** → fills out `signup.html`
4. After successful registration, click **"Sign in"**
5. Log in with Student ID + chosen password

### Admin Flow
1. Go to `index.html`, log in as Admin
2. **Dashboard** — see total students, recent registrations
3. **All Students** — search, edit, or delete any student
4. **Register Student** — add a student directly (default password = their Student ID)

---

## Features

- **Role-based access** — Admin and Student roles with separate dashboards and page guards
- **Persistent data** — Student records are stored centrally in Google Sheets
- **Student self-registration** — Public signup page, no login required
- **Admin student management** — Add, edit, delete with modal confirmations
- **Live search** — Filter students instantly on the All Students page
- **Form validation** — All forms validate required fields, email format, password length, and password match
- **Duplicate prevention** — Registering the same Student ID twice is blocked
- **Password reset** — Admin can set a new password when editing a student record
- **Responsive sidebar** — Hamburger menu for mobile screens
- **Toast notifications** — Success and error feedback on all actions

---

## Architecture & Data Storage

```text
GitHub Pages (HTML / CSS / JavaScript)
      ↓  fetch()
Google Apps Script web app (API)
      ↓
Google Sheets (database)
```

Student records are stored in Google Sheets and accessed through a Google Apps Script web app (`API_URL` in `js/store.js`). The browser's `localStorage` is used only to keep the logged-in session (`sreg_user`).

Each student record contains:
```json
{
  "id": "stu_1719650000000",
  "studentId": "CS2024001",
  "fullName": "Priya Sharma",
  "email": "priya@college.edu",
  "phone": "9876543210",
  "department": "Computer Science",
  "year": "2",
  "gender": "Female",
  "password": "...",
  "createdAt": "2025-06-29T07:00:00.000Z"
}
```

### Security

- Passwords are salted and hashed in the Apps Script backend and are never returned to the browser.
- Student and admin login are verified server-side and return a session token (valid 6 hours).
- Listing, editing and deleting students require an admin token; students can only read their own record.
- Failed logins are throttled (5 attempts per 15 minutes).

> **Note:** This is a learning project. Passwords use salted SHA-256; a production system should use a slow hash such as bcrypt or argon2 on a dedicated backend.

### Backend setup

1. Create two Google Sheets: a `Students` sheet with columns `id, studentId, fullName, email, phone, department, year, gender, password, createdAt`, and an `Admin` sheet with `email, password` columns.
2. Open **Extensions → Apps Script**, paste `backend/Code.gs`, and set the spreadsheet IDs at the top.
3. Run `migratePasswords()` once to hash any existing passwords.
4. **Deploy → New deployment → Web app** (execute as you, access: anyone) and put the URL in `API_URL` in `js/store.js`.

---

## Departments Available

- Computer Science
- Information Technology
- Electronics
- Mechanical
- Civil
- Electrical
- MBA
- MCA

---

## Possible Improvements

- Move to a slow password hash (bcrypt/argon2) on a dedicated backend
- Add pagination for large student lists

## Browser Support

Works in all modern browsers — Chrome, Firefox, Edge, Safari. Internet Explorer is not supported.

---

## License

Free to use for educational and personal projects.
