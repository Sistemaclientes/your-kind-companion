import { supabase } from './supabase';

export const adminService = {
  async getAll() {
    const { data: admins } = await supabase.from('admins').select('id, email, role, nome, is_master');
    return admins || [];
  },

  async create(data: { nome: string; email: string; senha: string }) {
    // 1. Create user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.senha,
    });

    if (signUpError) throw new Error(signUpError.message);
    if (!authData.user) throw new Error('Erro ao criar usuário');

    // 2. Insert into admins table
    const { error: insertError } = await supabase.from('admins').insert({
      id: authData.user.id,
      email: data.email.trim().toLowerCase(),
      nome: data.nome.trim(),
      role: 'admin',
    });

    if (insertError) throw new Error(insertError.message);

    return { id: authData.user.id, email: data.email, nome: data.nome };
  },

  async remove(id: string) {
    await supabase.from('admins').delete().eq('id', id);
    return { message: 'Administrador removido' };
  },
};
