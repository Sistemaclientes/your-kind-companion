import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  checkSession: () => Promise<void>;
  loginAdmin: (authUser: User, admin: any) => void;
  loginStudent: (authUser: User, aluno: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);
  // Track if login was done explicitly (skip onAuthStateChange resolution)
  const explicitLoginRef = useRef(false);

  const resolveUser = useCallback(async (authUser: User) => {
    try {
      // Run both queries in parallel to cut latency in half
      const [adminResult, alunoResult] = await Promise.all([
        supabase.from('admins').select('id, email, role').eq('id', authUser.id).maybeSingle(),
        supabase.from('alunos').select('id, nome, avatar_url, status').eq('id', authUser.id).maybeSingle(),
      ]);

      if (adminResult.data) {
        setUser({
          id: adminResult.data.id,
          nome: adminResult.data.email?.split('@')[0] || 'Admin',
          email: adminResult.data.email || authUser.email || '',
          role: 'admin',
        });
      } else if (alunoResult.data) {
        setUser({
          id: alunoResult.data.id,
          nome: alunoResult.data.nome || 'Aluno',
          email: authUser.email || '',
          role: 'aluno',
        });
      } else {
        console.warn('User found in Auth but not in admins/alunos tables');
        setUser(null);
      }
    } catch (error) {
      console.error('Error resolving user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
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
        setIsLoading(false);
      }
    } catch {
      setUser(null);
      setIsLoading(false);
    }
  }, [resolveUser]);

  const loginAdmin = useCallback((authUser: User, admin: any) => {
    explicitLoginRef.current = true;
    setUser({
      id: admin.id,
      nome: admin.email?.split('@')[0] || 'Admin',
      email: admin.email || authUser.email || '',
      role: 'admin',
    });
    setIsLoading(false);
  }, []);

  const loginStudent = useCallback((authUser: User, aluno: any) => {
    explicitLoginRef.current = true;
    setUser({
      id: aluno.id,
      nome: aluno.nome || 'Aluno',
      email: authUser.email || '',
      role: 'aluno',
    });
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    explicitLoginRef.current = false;
    setUser(null);
    setIsLoading(false);
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Safety timeout
    const timeoutId = setTimeout(() => setIsLoading(false), 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If login was handled explicitly by loginAdmin/loginStudent, skip re-resolution
      if (explicitLoginRef.current && event === 'SIGNED_IN') {
        explicitLoginRef.current = false;
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial session - this replaces the separate checkSession call
        if (session?.user) {
          resolveUser(session.user);
        } else {
          setIsLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user && !user) {
        // Only resolve on token refresh if we don't have a user yet
        resolveUser(session.user);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
