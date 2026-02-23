# 📊 TaskPulse

**Internal Business Automation for Daily Work Reporting**

[![Watch the Demo](https://img.youtube.com/vi/IodnY95xayE/0.jpg)](https://www.youtube.com/watch?v=IodnY95xayE)

TaskPulse is a web-based internal tool that automates daily work reporting for teams and managers. It centralizes daily reports into a single system, reducing manual follow-ups and providing real-time visibility into team progress.

![TaskPulse Banner](https://img.shields.io/badge/TaskPulse-v1.0.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 🎯 Problem Statement

Managers currently collect daily work updates manually through WhatsApp, email, or verbal communication. This causes:
- 📍 Scattered information
- 🔍 No centralized tracking
- 📞 Manual follow-ups
- 📜 No structured history

**TaskPulse solves this by centralizing daily reports into a single system.**

---

## ✨ Features

### Employee Features
- 🔐 Simple login/authentication
- 📝 Submit daily work report (form-based)
- 📋 View previously submitted reports
- ✏️ Edit same-day reports

### Manager/Admin Features
- 📊 Dashboard with real-time statistics
- 🔍 View all employee reports
- 🗓️ Filter reports by date and employee
- 🔔 Real-time updates when reports are submitted
- ✅ Update report status (Mark as Reviewed)
- 🗑️ Delete/manage reports from admin panel

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML, CSS, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Authentication** | JWT (JSON Web Tokens) |

---

## 📁 Project Structure

```
daily-pulse/
├── backend/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   └── reportController.js # CRUD operations for reports
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   └── errorHandler.js     # Error handling
│   ├── models/
│   │   ├── User.js             # User schema
│   │   └── DailyReport.js      # Report schema
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   └── reportRoutes.js     # Report endpoints
│   ├── server.js               # Express server entry
│   ├── package.json
│   ├── .env                    # Environment variables
│   └── .env.example
│
├── frontend/
│   ├── css/
│   │   └── styles.css          # Complete styling
│   ├── js/
│   │   ├── api.js              # API service
│   │   ├── auth.js             # Auth utilities
│   │   └── utils.js            # Helper functions
│   ├── index.html              # Redirect page
│   ├── login.html              # Login/Register page
│   ├── dashboard.html          # Manager dashboard
│   ├── submit-report.html      # Report submission form
│   ├── reports.html            # Reports list
│   └── admin.html              # Admin panel
│
└── README.md
```

---

## 🗃️ Database Schema

### User Model
| Field | Type | Description |
|-------|------|-------------|
| name | String | User's full name |
| email | String | Unique email address |
| password | String | Hashed password |
| role | Enum | employee, manager, admin |
| department | String | Department name |
| isActive | Boolean | Account status |
| lastLogin | Date | Last login timestamp |

### DailyReport Model
| Field | Type | Description |
|-------|------|-------------|
| reportId | String | Unique report identifier |
| employeeName | String | Submitter's name |
| employeeEmail | String | Submitter's email |
| employeeId | ObjectId | Reference to User |
| date | Date | Report date |
| tasksCompleted | Array | List of completed tasks |
| workSummary | String | Detailed work summary |
| hoursWorked | Number | Hours worked (0-24) |
| status | Enum | Submitted, Reviewed, Pending |
| blockers | String | Any blockers encountered |
| plannedTomorrow | String | Tomorrow's plan |
| reviewedBy | ObjectId | Manager who reviewed |
| reviewedAt | Date | Review timestamp |
| managerNotes | String | Manager's feedback |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v6.0 or higher (local or MongoDB Atlas)
- **npm** or **yarn**

### Installation

#### 1. Clone/Navigate to the project

```bash
cd /Users/shejal/Desktop/daily-pulse
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Configure Environment Variables

Edit the `.env` file in the `backend` folder:

```env
# MongoDB Connection (update if using MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/taskpulse

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

#### 4. Start MongoDB

If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas and update the connection string.

#### 5. Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

The backend will run on `http://localhost:5000`

#### 6. Serve the Frontend

You can serve the frontend using any static file server:

**Option 1: Using Python (if installed)**
```bash
cd frontend
python -m http.server 3000
```

**Option 2: Using Node.js http-server (recommended)**
```bash
npm install -g http-server
cd frontend
http-server -p 3000
```

**Option 3: Using VS Code Live Server extension**
- Install the "Live Server" extension
- Right-click on `frontend/login.html` and select "Open with Live Server"

The frontend will be available at `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/password` | Change password | Private |
| GET | `/api/auth/users` | Get all users | Manager/Admin |

### Reports

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/reports` | Create report | Private |
| GET | `/api/reports` | Get reports (filtered) | Private |
| GET | `/api/reports/today` | Get today's report | Private |
| GET | `/api/reports/stats` | Get report statistics | Manager/Admin |
| GET | `/api/reports/:id` | Get single report | Private |
| PUT | `/api/reports/:id` | Update report | Private |
| DELETE | `/api/reports/:id` | Delete report (30+ days) | Admin |
| DELETE | `/api/reports/:id/force` | Force delete report | Admin |

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Employee** | Submit reports, View own reports, Edit same-day reports |
| **Manager** | All employee permissions + View all reports, Review reports, Dashboard access |
| **Admin** | All manager permissions + Admin panel, User management, Delete reports |

---

## 🎨 Pages Overview

### 1. Login Page (`login.html`)
- Tabbed interface for Login/Register
- Form validation
- Role selection during registration

### 2. Dashboard (`dashboard.html`)
- Real-time statistics (total reports, pending reviews, avg hours)
- Today's submissions table
- Quick actions
- Recent activity feed
- Report review modal

### 3. Submit Report (`submit-report.html`)
- Dynamic task list (add/remove tasks)
- Task categories (Development, Meeting, Review, etc.)
- Work summary with validation
- Hours worked tracking
- Blockers and tomorrow's plan
- Auto-detection of existing same-day report for editing

### 4. Reports List (`reports.html`)
- Filterable table (date range, status, employee)
- Pagination
- Detailed report view modal
- Role-based actions (Review for managers)

### 5. Admin Panel (`admin.html`)
- User management table
- Role-based filtering
- Report cleanup tools
- Future enhancements preview

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds of 12
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Middleware protection
- **Input Validation**: Mongoose schema validation
- **XSS Prevention**: HTML escaping in frontend
- **CORS Configuration**: Restricted origins

---

## 🛠️ Business Rules

1. **Report Submission**: One report per employee per day
2. **Report Editing**: Employees can only edit same-day reports
3. **Report Deletion**: Only admins can delete reports older than 30 days
4. **Status Flow**: Submitted → Reviewed
5. **Hours Validation**: 0-24 hours allowed

---

## 🚧 Future Enhancements (Not Implemented)

- 📧 **Email Reminders**: Automated daily reminders for missing reports
- 📊 **Google Sheets Export**: Export reports for external analysis
- 🗂️ **Data Retention Control**: Configurable cleanup policies
- 📱 **Mobile App**: React Native application

---

## 🧪 Testing the Application

1. **Create an Admin User**:
   - Register with role "manager" (or modify the database directly to set role as "admin")
   
2. **Create Employee Users**:
   - Register multiple employees
   
3. **Submit Reports**:
   - Login as employees and submit daily reports
   
4. **Review Reports**:
   - Login as manager and review pending reports
   
5. **Admin Functions**:
   - Login as admin to manage users and cleanup old reports

---

## 📝 Sample Test Data

You can use these credentials after registering:

**Manager Account**:
- Email: `manager@taskpulse.com`
- Password: `manager123`
- Role: Manager

**Employee Account**:
- Email: `employee@taskpulse.com`
- Password: `employee123`
- Role: Employee

---

## 🤝 Contributing

This is an internal tool. For modifications:

1. Follow existing code patterns
2. Test thoroughly before deployment
3. Update documentation as needed

---

## 📄 License

MIT License - For internal use only.

---

## 📞 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for streamlining daily work reporting**
