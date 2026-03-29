import { create } from 'zustand';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  checkSession: () => {
    // Check admin session
    const adminToken = localStorage.getItem('saas_token');
    const adminUser = localStorage.getItem('saas_user');
    if (adminToken && adminUser) {
      try {
        const parsed = JSON.parse(adminUser);
        set({
          user: {
            id: parsed.id,
            nome: parsed.nome,
            email: parsed.email,
            role: 'admin',
            is_master: parsed.is_master,
          },
          isLoading: false,
        });
        return;
      } catch {}
    }

    // Check student session
    const studentInfo = localStorage.getItem('student_info');
    if (studentInfo) {
      try {
        const parsed = JSON.parse(studentInfo);
        set({
          user: {
            id: parsed.email, // use email as id for students
            nome: parsed.nome,
            email: parsed.email,
            role: 'aluno',
          },
          isLoading: false,
        });
        return;
      } catch {}
    }

    set({ user: null, isLoading: false });
  },

  loginAdmin: (token: string, adminUser: any) => {
    localStorage.setItem('saas_token', token);
    localStorage.setItem('saas_user', JSON.stringify(adminUser));
    set({
      user: {
        id: adminUser.id,
        nome: adminUser.nome,
        email: adminUser.email,
        role: 'admin',
        is_master: adminUser.is_master,
      },
    });
  },

  loginStudent: (studentInfo: any) => {
    localStorage.setItem('student_info', JSON.stringify({
      nome: studentInfo.nome,
      email: studentInfo.email,
      telefone: studentInfo.telefone || '',
    }));
    set({
      user: {
        id: studentInfo.email,
        nome: studentInfo.nome,
        email: studentInfo.email,
        role: 'aluno',
      },
    });
  },

  logout: () => {
    // Clear all auth data
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    localStorage.removeItem('student_info');
    localStorage.removeItem('student_remembered');
    set({ user: null });
  },
}));
