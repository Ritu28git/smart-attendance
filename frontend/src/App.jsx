
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./login.jsx";
import Dashboard from "./Dashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import ResetPassword from "./ResetPassword.jsx";

function ProtectedRoute() {
  let user = null;
  const token = localStorage.getItem("token");

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
  }

  if (!token || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (user.role.toLowerCase() === "admin") {
    return <AdminDashboard />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
