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
    const { data: aluno, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !aluno) throw new Error('Email não encontrado. Cadastre-se primeiro.');
    if (senha && aluno.senha !== senha) throw new Error('Senha incorreta.');
    if (aluno.status === 'Aguardando Confirmação') {
      throw new Error('Confirme seu cadastro no e-mail enviado antes de realizar o login.');
    }

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

  async forgotAdminPassword(email: string) {
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (!admin) throw new Error('E-mail não encontrado no sistema');
    return { message: 'Conta verificada' };
  },

  async resetAdminPassword(email: string, newPassword: string) {
    const { error } = await supabase
      .from('admins')
      .update({ senha: newPassword })
      .eq('email', email.trim().toLowerCase());

    if (error) throw new Error(error.message);
    return { message: 'Senha redefinida com sucesso' };
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
