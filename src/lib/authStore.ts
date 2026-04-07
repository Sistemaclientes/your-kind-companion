import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'aluno';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  checkSession: () => void;
  loginAdmin: (authUser: User, admin: any) => void;
  loginStudent: (authUser: User, aluno: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveUser = useCallback(async (authUser: User) => {
    // Check admin
    const { data: admin } = await supabase
      .from('admins')
      .select('id, email, role')
      .eq('id', authUser.id)
      .single();

    if (admin) {
      setUser({
        id: admin.id,
        nome: admin.email?.split('@')[0] || 'Admin',
        email: admin.email || authUser.email || '',
        role: 'admin',
      });
      return;
    }

    // Check student
    const { data: aluno } = await supabase
      .from('alunos')
      .select('id, nome, avatar_url, status')
      .eq('id', authUser.id)
      .single();

    if (aluno) {
      setUser({
        id: aluno.id,
        nome: aluno.nome || 'Aluno',
        email: authUser.email || '',
        role: 'aluno',
      });
      return;
    }

    // User exists in auth but not in any table
    setUser(null);
  }, []);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await resolveUser(session.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [resolveUser]);

  const loginAdmin = useCallback((authUser: User, admin: any) => {
    setUser({
      id: admin.id,
      nome: admin.email?.split('@')[0] || 'Admin',
      email: admin.email || authUser.email || '',
      role: 'admin',
    });
  }, []);

  const loginStudent = useCallback((authUser: User, aluno: any) => {
    setUser({
      id: aluno.id,
      nome: aluno.nome || 'Aluno',
      email: authUser.email || '',
      role: 'aluno',
    });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await resolveUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSession, resolveUser]);

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
