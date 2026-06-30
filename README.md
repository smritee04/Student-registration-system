# StudentReg — University Student Registration Portal

A student registration and management system built with HTML, CSS, and JavaScript. The project provides separate dashboards for administrators and students, enabling registration, profile management, and student record administration through a responsive web interface.

---

## Project Structure

```
studentreg/
├── index.html                    # Login page (Admin + Student)
├── css/
│   └── style.css                 # Full design system
├── js/
│   ├── store.js                  # Data layer — localStorage CRUD
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

> ⚠ Some browsers block `localStorage` on `file://` URLs. If login doesn't work, use Option 2.

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

## Default Credentials

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
- **Persistent data** — Student records are maintained across user sessions
- **Student self-registration** — Public signup page, no login required
- **Admin student management** — Add, edit, delete with modal confirmations
- **Live search** — Filter students instantly on the All Students page
- **Form validation** — All forms validate required fields, email format, password length, and password match
- **Duplicate prevention** — Registering the same Student ID twice is blocked
- **Password reset** — Admin can set a new password when editing a student record
- **Responsive sidebar** — Hamburger menu for mobile screens
- **Toast notifications** — Success and error feedback on all actions

---

## Data Storage

All data is stored in the browser's `localStorage` under two keys:

| Key              | Contents                                   |
|------------------|--------------------------------------------|
| `sreg_students`  | JSON array of all student records          |
| `sreg_user`      | Currently logged-in user's session object  |
| `sreg_admin`     | Admin email + password                     |

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
  "password": "hashed_or_plain",
  "createdAt": "2025-06-29T07:00:00.000Z"
}
```

> **Note:** The current version uses browser Local Storage for demonstration purposes. Future versions may integrate Google Sheets and Google Apps Script for centralized data management.

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

## Future Backend Integration

The project can be upgraded to use Google Sheets as a database and Google Apps Script as an API layer for centralized data storage and public deployment.
---

## Planned Deployment

```text
GitHub Pages
      ↓
Google Apps Script API
      ↓
Google Sheets Database
```

This architecture will allow the application to be publicly accessible while storing student records in a centralized database.

## Browser Support

Works in all modern browsers — Chrome, Firefox, Edge, Safari. Internet Explorer is not supported.

---

## License

Free to use for educational and personal projects.
