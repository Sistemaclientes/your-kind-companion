import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Redirects authenticated users away from public pages (login, register).
 */
export function PublicRoute({ children, redirectTo }: PublicRouteProps) {
  const { user, isLoading } = useAuthStore();

  // Don't block rendering — let the login page show immediately
  // PublicRoute only redirects if user is already authenticated

  if (user) {
    const target = redirectTo || (user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
