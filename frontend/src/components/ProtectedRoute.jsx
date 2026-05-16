import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
    Checking your session...
  </div>
);

export const ProtectedRoute = ({ children, loginPath = '/login' }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  return children;
};

export const AdminRoute = ({ children, loginPath = '/admin/login' }) => {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
