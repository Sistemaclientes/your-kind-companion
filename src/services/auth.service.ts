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
      .select('id, nome, avatar_url, status')
      .eq('id', data.user.id)
      .single();

    if (!aluno) {
      await supabase.auth.signOut();
      throw new Error('Conta de aluno não encontrada.');
    }

    return { user: data.user, aluno };
  },

  async registerStudent(data: { nome: string; email: string; password: string }) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error('Erro ao criar conta.');

    // Create student record
    const { error: insertError } = await supabase.from('alunos').insert({
      id: authData.user.id,
      nome: data.nome.trim(),
    });

    if (insertError) throw new Error(insertError.message);

    return { message: 'Cadastro realizado! Verifique seu e-mail para confirmar.' };
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/redefinir-senha` }
    );
    if (error) throw new Error('Erro ao processar solicitação.');
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
