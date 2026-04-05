import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  is_master: boolean;
}

export interface StudentUser {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
}

export const authService = {
  async loginAdmin(email: string, password: string): Promise<{ user: AdminUser }> {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, nome, email, senha, is_master')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !admin) throw new Error('Email ou senha inválidos');
    if (admin.senha.toLowerCase() !== password.toLowerCase()) {
      throw new Error('Email ou senha inválidos');
    }

    return {
      user: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        is_master: !!admin.is_master,
      },
    };
  },

  async loginStudent(email: string, senha: string): Promise<{ student: StudentUser }> {
    const { data, error } = await supabase.rpc('login_aluno', {
      p_email: email.trim().toLowerCase(),
      p_senha: senha,
    });

    if (error) throw new Error(error.message);

    const aluno = data as any;
    return {
      student: {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        telefone: aluno.telefone || '',
        cpf: aluno.cpf || '',
      },
    };
  },

  async registerStudent(data: {
    nome: string;
    email: string;
    telefone?: string;
    senha: string;
    cpf?: string;
  }) {
    const emailLower = data.email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from('alunos')
      .select('id')
      .eq('email', emailLower)
      .single();

    if (existing) throw new Error('Este e-mail já está cadastrado.');

    const { error } = await supabase.from('alunos').insert({
      nome: data.nome.trim(),
      email: emailLower,
      telefone: data.telefone?.trim() || '',
      senha: data.senha,
      cpf: data.cpf?.trim() || null,
      status: 'Ativo',
    });

    if (error) throw new Error(error.message);
    return { message: 'Cadastro realizado com sucesso!' };
  },

  async forgotPassword(email: string, userType: 'admin' | 'student') {
    const { data, error } = await supabase.functions.invoke('send-reset-email', {
      body: {
        email: email.trim().toLowerCase(),
        user_type: userType,
        origin: window.location.origin,
      },
    });

    if (error) throw new Error('Erro ao processar solicitação. Tente novamente.');
    return data;
  },

  async resetPassword(email: string, token: string, newPassword: string, userType: 'admin' | 'student') {
    const table = userType === 'admin' ? 'admins' : 'alunos';

    // Validate token
    const { data: user, error: fetchError } = await supabase
      .from(table)
      .select('id, reset_token, reset_expires')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (fetchError || !user) throw new Error('Usuário não encontrado.');

    if (!user.reset_token || user.reset_token !== token) {
      throw new Error('Token inválido ou já utilizado.');
    }

    if (user.reset_expires && new Date(user.reset_expires) < new Date()) {
      throw new Error('Token expirado. Solicite um novo link de redefinição.');
    }

    // Update password and clear token
    const { error: updateError } = await supabase
      .from(table)
      .update({
        senha: newPassword,
        reset_token: null,
        reset_expires: null,
      })
      .eq('id', user.id);

    if (updateError) throw new Error('Erro ao redefinir senha. Tente novamente.');

    return { message: 'Senha redefinida com sucesso!' };
  },

  async forgotAdminPassword(email: string) {
    return this.forgotPassword(email, 'admin');
  },

  async forgotStudentPassword(email: string) {
    return this.forgotPassword(email, 'student');
  },

  async resetAdminPassword(email: string, token: string, newPassword: string) {
    return this.resetPassword(email, token, newPassword, 'admin');
  },

  async resetStudentPassword(email: string, token: string, newPassword: string) {
    return this.resetPassword(email, token, newPassword, 'student');
  },

  async changeAdminPassword(adminId: string, currentPassword: string, newPassword: string) {
    const { data: admin } = await supabase
      .from('admins')
      .select('senha')
      .eq('id', adminId)
      .single();

    if (!admin || admin.senha.toLowerCase() !== currentPassword.toLowerCase()) {
      throw new Error('Senha atual incorreta');
    }

    await supabase.from('admins').update({ senha: newPassword }).eq('id', adminId);
    return { message: 'Senha alterada com sucesso' };
  },
};
