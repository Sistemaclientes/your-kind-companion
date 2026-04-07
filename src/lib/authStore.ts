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
  const initializationRef = React.useRef(false);

  const resolveUser = useCallback(async (authUser: User) => {
    try {
      // Check admin
      const { data: admin } = await supabase
        .from('admins')
        .select('id, email, role')
        .eq('id', authUser.id)
        .maybeSingle();

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
        .maybeSingle();

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
      console.warn('User found in Auth but not in admins/alunos tables');
      setUser(null);
    } catch (error) {
      console.error('Error resolving user profile:', error);
      setUser(null);
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session?.user) {
        await resolveUser(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
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
      nome: nome || 'Aluno',
      email: authUser.email || '',
      role: 'aluno',
    });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    // Safety timeout: if loading takes more than 10s, force stop
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await resolveUser(session.user);
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        setIsLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
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