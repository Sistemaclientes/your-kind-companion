import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../lib/authStore';

interface PrivateRouteProps {
  role: UserRole;
  children: React.ReactNode;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Verificando acesso...</p>
      </div>
    </div>
  );
}

export function PrivateRoute({ role, children }: PrivateRouteProps) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Not logged in
  if (!user) {
    if (role === 'aluno') {
      return <Navigate to="/aluno/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Role mismatch
  if (user.role !== role) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/aluno/dashboard" replace />;
  }

  return <>{children}</>;
}
