import { supabase } from './supabase';

export const adminService = {
  async getAll() {
    const { data: admins } = await supabase.from('admins').select('id, nome, email, is_master');
    return (admins || []).map((a: any) => ({ ...a, is_protected: a.is_master }));
  },

  async create(data: { nome: string; email: string; senha?: string }) {
    const { data: newAdmin, error } = await supabase
      .from('admins')
      .insert({
        nome: data.nome,
        email: data.email,
        senha: data.senha || 'senha123',
        is_master: false,
      })
      .select('id, nome, email, is_master')
      .single();

    if (error) throw new Error(error.message);
    return newAdmin;
  },

  async remove(id: string) {
    const { data: admin } = await supabase.from('admins').select('is_master').eq('id', id).single();
    if (admin?.is_master) throw new Error('Este administrador não pode ser removido');

    await supabase.from('admins').delete().eq('id', id);
    return { message: 'Administrador removido' };
  },
};
