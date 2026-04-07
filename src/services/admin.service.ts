import { supabase } from './supabase';

export const adminService = {
  async getAll() {
    const { data: admins } = await supabase.from('admins').select('id, email, role, nome, is_master');
    return admins || [];
  },

  async create(data: { nome: string; email: string; senha: string }) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error('Sessão expirada. Faça login novamente.');

    const res = await supabase.functions.invoke('create-admin', {
      body: { nome: data.nome, email: data.email, senha: data.senha },
    });

    if (res.error) throw new Error(res.error.message || 'Erro ao criar administrador');
    if (res.data?.error) throw new Error(res.data.error);

    return res.data;
  },

  async remove(id: string) {
    await supabase.from('admins').delete().eq('id', id);
    return { message: 'Administrador removido' };
  },
};
