import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import Employees from './pages/hrm/Employees';
import Attendance from './pages/hrm/Attendance';
import Payroll from './pages/hrm/Payroll';
import Branches from './pages/branches/Branches';
import Accounting from './pages/accounting/Accounting';
import Sales from './pages/sales/Sales';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="branches" element={<Branches />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="sales" element={<Sales />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;



