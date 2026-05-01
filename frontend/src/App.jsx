import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Issues from './pages/Issues';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Tasks from './pages/Tasks';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/"                        element={<Landing />} />
          <Route path="/login"                   element={<Login />} />
          <Route path="/register"                element={<Register />} />
          <Route path="/forgot-password"         element={<ForgotPassword />} />
          <Route path="/reset-password/:token"   element={<ResetPassword />} />

          {/* Protected app pages */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/employees"   element={<Employees />} />
              <Route path="/attendance"  element={<Attendance />} />
              <Route path="/leaves"      element={<Leaves />} />
              <Route path="/payroll"     element={<Payroll />} />
              <Route path="/issues"      element={<Issues />} />
              <Route path="/tasks"       element={<Tasks />} />
            </Route>
          </Route>

          <Route path="/unauthorized" element={<div className="flex items-center justify-center h-screen text-slate-500">Unauthorized Access</div>} />
          <Route path="*"             element={<div className="flex items-center justify-center h-screen text-slate-500">404 — Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
