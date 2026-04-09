import { supabase } from './supabase';

export const authService = {
  async loginAdmin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error('Email ou senha inválidos');

    // Check if user is admin
    const { data: admin } = await supabase
      .from('admins')
      .select('id, email, role')
      .eq('id', data.user.id)
      .single();

    if (!admin) {
      await supabase.auth.signOut();
      throw new Error('Acesso negado. Você não é administrador.');
    }

    return { user: data.user, admin };
  },

  async loginStudent(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error('Email ou senha inválidos');

    // Check if user is student
    const { data: aluno } = await supabase
      .from('alunos')
      .select('id, nome, avatar_url, status, curso')
      .eq('id', data.user.id)
      .single();

    if (!aluno) {
      await supabase.auth.signOut();
      throw new Error('Conta de aluno não encontrada.');
    }

    return { user: data.user, aluno };
  },

  async registerStudent(data: { nome: string; email: string; password: string; curso?: string }) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedCurso = data.curso ? data.curso.trim().toLowerCase() : null;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        data: { nome: data.nome.trim() },
      },
    });

    if (error) {
      console.error('[Auth] SignUp error:', error);
      if (error.message.includes('already registered')) {
        throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
      }
      throw new Error(error.message);
    }
    if (!authData.user) throw new Error('Erro ao criar conta.');

    // Create student record with email and curso
    const insertData: any = {
      id: authData.user.id,
      nome: data.nome.trim(),
      email: normalizedEmail,
    };
    if (normalizedCurso) insertData.curso = normalizedCurso;

    const { error: insertError } = await supabase.from('alunos').insert(insertData);

    if (insertError) {
      console.error('[Auth] Insert aluno error:', insertError);
      throw new Error('Conta criada, mas houve erro ao salvar perfil. Tente fazer login.');
    }

    // Auto-login after signup
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: data.password,
    });

    if (loginError) {
      console.error('[Auth] Auto-login after signup error:', loginError);
      // Account was created successfully, just couldn't auto-login
      return { autoLogin: false, user: null, aluno: null };
    }

    // Fetch the student record for the auth store
    const { data: aluno } = await supabase
      .from('alunos')
      .select('id, nome, avatar_url, status, curso')
      .eq('id', authData.user.id)
      .single();

    return { autoLogin: true, user: loginData.user, aluno };
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async forgotPassword(email: string) {
    // Use current pathname so the reset link returns to the correct login page
    const currentPath = window.location.pathname;
    const redirectTo = `${window.location.origin}${currentPath}`;
    console.log('[Auth] Sending reset email, redirectTo:', redirectTo);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo }
    );
    if (error) {
      console.error('[Auth] Reset password error:', error);
      throw new Error('Erro ao processar solicitação. Verifique o e-mail informado.');
    }
    return { message: 'Link de redefinição enviado para seu e-mail.' };
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error('Erro ao redefinir senha.');
    return { message: 'Senha redefinida com sucesso!' };
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};
