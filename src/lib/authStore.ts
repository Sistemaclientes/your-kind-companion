import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type UserRole = 'admin' | 'aluno';

export interface AuthUser {
  id: number | string;
  nome: string;
  email: string;
  role: UserRole;
  is_master?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  checkSession: () => void;
  loginAdmin: (token: string, adminUser: any) => void;
  loginStudent: (studentInfo: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(() => {
    // Check admin session
    const adminToken = localStorage.getItem('saas_token');
    const adminUser = localStorage.getItem('saas_user');
    if (adminToken && adminUser) {
      try {
        const parsed = JSON.parse(adminUser);
        setUser({
          id: parsed.id,
          nome: parsed.nome,
          email: parsed.email,
          role: 'admin',
          is_master: parsed.is_master,
        });
        setIsLoading(false);
        return;
      } catch {}
    }

    // Check student session
    const studentInfo = localStorage.getItem('student_info');
    if (studentInfo) {
      try {
        const parsed = JSON.parse(studentInfo);
        setUser({
          id: parsed.email,
          nome: parsed.nome,
          email: parsed.email,
          role: 'aluno',
        });
        setIsLoading(false);
        return;
      } catch {}
    }

    setUser(null);
    setIsLoading(false);
  }, []);

  const loginAdmin = useCallback((token: string, adminUser: any) => {
    localStorage.setItem('saas_token', token);
    localStorage.setItem('saas_user', JSON.stringify(adminUser));
    setUser({
      id: adminUser.id,
      nome: adminUser.nome,
      email: adminUser.email,
      role: 'admin',
      is_master: adminUser.is_master,
    });
  }, []);

  const loginStudent = useCallback((studentInfo: any) => {
    localStorage.setItem('student_info', JSON.stringify({
      nome: studentInfo.nome,
      email: studentInfo.email,
      telefone: studentInfo.telefone || '',
    }));
    setUser({
      id: studentInfo.email,
      nome: studentInfo.nome,
      email: studentInfo.email,
      role: 'aluno',
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    localStorage.removeItem('student_info');
    localStorage.removeItem('student_remembered');
    setUser(null);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value = React.useMemo(() => ({
    user,
    isLoading,
    checkSession,
    loginAdmin,
    loginStudent,
    logout,
  }), [user, isLoading, checkSession, loginAdmin, loginStudent, logout]);

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuthStore(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthStore must be used within AuthProvider');
  return ctx;
}
