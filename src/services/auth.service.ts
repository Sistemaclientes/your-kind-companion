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
    // Use the secure RPC function that validates password with bcrypt
    const { data, error } = await supabase.rpc('login_admin', {
      p_email: email.trim().toLowerCase(),
      p_password: password,
    });

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      throw new Error('Email ou senha inválidos');
    }

    const admin = Array.isArray(data) ? data[0] : data;

    // Check email_confirmed on the admins table
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('email_confirmed')
      .eq('id', admin.id)
      .single();

    if (adminRecord && adminRecord.email_confirmed === false) {
      throw new Error('Confirme seu e-mail antes de acessar o sistema.');
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

    if (error) {
      if (error.message.includes('Confirme seu cadastro')) {
        const customError: any = new Error(error.message);
        customError.unconfirmed = true;
        customError.email = email.trim().toLowerCase();
        throw customError;
      }
      throw new Error(error.message);
    }

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

    const confirmationToken = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    const { error } = await supabase.from('alunos').insert({
      nome: data.nome.trim(),
      email: emailLower,
      telefone: data.telefone?.trim() || '',
      senha: data.senha,
      cpf: data.cpf?.trim() || null,
      status: 'Aguardando Confirmação',
      email_confirmed: false,
      confirmation_token: confirmationToken,
      token_expires_at: tokenExpiresAt,
    });

    if (error) {
      if (error.message.includes('alunos_cpf_key')) {
        throw new Error('Este CPF já está cadastrado. Por favor, insira um CPF válido.');
      }
      throw new Error(error.message);
    }

    // Call edge function to send confirmation email
    try {
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: emailLower,
          nome: data.nome.trim(),
          token: confirmationToken,
          origin: window.location.origin,
        },
      });
    } catch (err) {
      console.error('Error calling send-confirmation-email:', err);
      // Don't throw here, the account was created successfully
    }

    return { 
      message: 'Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta.' 
    };
  },

  async confirmEmail(token: string) {
    const { data, error } = await supabase.rpc('confirmar_aluno', {
      p_token: token,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async resendConfirmation(email: string) {
    const emailLower = email.trim().toLowerCase();
    
    // Check if user exists and is not confirmed
    const { data: user, error: fetchError } = await supabase
      .from('alunos')
      .select('id, nome, email_confirmed')
      .eq('email', emailLower)
      .single();

    if (fetchError || !user) {
      // Return success anyway to avoid enumeration
      return { message: 'Se o e-mail estiver cadastrado, um novo link será enviado.' };
    }

    if (user.email_confirmed) {
      return { message: 'E-mail já confirmado.' };
    }

    const confirmationToken = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    const { error: updateError } = await supabase
      .from('alunos')
      .update({
        confirmation_token: confirmationToken,
        token_expires_at: tokenExpiresAt,
      })
      .eq('id', user.id);

    if (updateError) throw new Error('Erro ao processar solicitação.');

    // Call edge function to send confirmation email
    try {
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: emailLower,
          nome: user.nome,
          token: confirmationToken,
          origin: window.location.origin,
        },
      });
    } catch (err) {
      console.error('Error calling send-confirmation-email:', err);
    }

    return { message: 'Se o e-mail estiver cadastrado, um novo link será enviado.' };
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
