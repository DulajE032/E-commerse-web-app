"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../services/AuthContext';

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
    Checking your session...
  </div>
);

const Redirect = ({ to }) => {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
};

export const ProtectedRoute = ({ children, loginPath = '/login' }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect to={loginPath} />;
  }

  return children;
};

export const AdminRoute = ({ children, loginPath = '/admin/login' }) => {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect to={loginPath} />;
  }

  if (user.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }

  return children;
};
