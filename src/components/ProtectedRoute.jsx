// src/components/ProtectedRoute.jsx
// Wraps any /admin/* route (except /admin/login).
// Redirects unauthenticated users to /admin/login.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve where they were trying to go, so we can redirect after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
