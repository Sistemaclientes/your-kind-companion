import { supabase } from './supabase';

export const adminService = {
  async getAll() {
    const { data: admins } = await supabase.from('admins').select('id, email, role');
    return admins || [];
  },

  async create(data: { email: string }) {
    const { data: newAdmin, error } = await supabase
      .from('admins')
      .insert({
        id: crypto.randomUUID(),
        email: data.email,
        role: 'admin',
      })
      .select('id, email, role')
      .single();

    if (error) throw new Error(error.message);
    return newAdmin;
  },

  async remove(id: string) {
    await supabase.from('admins').delete().eq('id', id);
    return { message: 'Administrador removido' };
  },
};
