# Production-Grade HR Management System (HRMS)

A full-stack MERN application for managing employees, attendance, leaves, payroll, and more.

## 🚀 Features
- **JWT Auth**: Secure login with access & refresh tokens.
- **Role-Based Access**: Admin, HR, and Employee roles.
- **Smart Dashboard**: Real-time stats and interactive charts (Recharts).
- **Attendance**: Check-in/out with location tracking.
- **Leaves**: Multi-level approval workflow with email notifications.
- **Payroll**: Automated salary calculation and history.
- **Responsive**: Beautifully designed for mobile and desktop.
- Real-time in-app notifications for key actions (leave updates, task assignments, issue resolution).
- Smart alerts for pending approvals, missed attendance, and upcoming deadlines.
- Role-based notifications for HR and employees.
- Notification history panel for tracking all system activities.

## 🛠️ Setup Instructions

### 1. Backend Setup
1. Open a terminal in `backend/`.
2. Create a `.env` file based on `.env.example` and fill in your MongoDB URI and email credentials.
3. Run `npm install` (if not already done).
4. **Seed Initial Data**: Run `npm run seed` to create test users.
   - Admin: `admin@hrms.com` / `password123`
   - HR: `hr@hrms.com` / `password123`
   - Employee: `john@hrms.com` / `password123`
5. Start development server: `npm run dev`.

### 2. Frontend Setup
1. Open a terminal in `frontend/`.
2. Run `npm install`.
3. Start development server: `npm run dev`.

## 📂 Project Structure
- `backend/`: Node.js/Express API with MongoDB/Mongoose.
- `frontend/`: React/Vite SPA with Tailwind CSS and Framer Motion.

## 🧠 Technologies Used
- **Frontend**: React, Tailwind CSS, Lucide React, Recharts, Framer Motion, Axios.
- **Backend**: Node.js, Express, MongoDB, JWT, Nodemailer, Socket.io, Multer, PDFKit.
