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
  const resolvingRef = useRef(false);
  const initializationRef = useRef(false);

  const resolveUser = useCallback(async (authUser: User) => {
    if (resolvingRef.current) return;
    resolvingRef.current = true;
    
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

      console.warn('User found in Auth but not in admins/alunos tables');
      setUser(null);
    } catch (error) {
      console.error('Error resolving user profile:', error);
      setUser(null);
    } finally {
      resolvingRef.current = false;
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
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
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
    setIsLoading(false);
  }, []);

  const loginStudent = useCallback((authUser: User, aluno: any) => {
    setUser({
      id: aluno.id,
      nome: aluno.nome || 'Aluno',
      email: authUser.email || '',
      role: 'aluno',
    });
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    // Safety timeout: if loading takes more than 10s, force stop
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    // Instead of checkSession AND onAuthStateChange immediately,
    // we set up the listener first.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthStore] Auth event: ${event}`);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      } else if (session?.user) {
        await resolveUser(session.user);
      } else if (event === 'INITIAL_SESSION' && !session) {
        setIsLoading(false);
      }
    });

    // Check session once manually just in case INITIAL_SESSION event doesn't fire as expected
    // but with a small delay or check if it's already loading
    checkSession();

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