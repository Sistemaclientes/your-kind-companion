import { supabase } from './supabase';

export const adminService = {
  async getAll() {
    const { data: admins } = await supabase.from('admins').select('id, email, role');
    return admins || [];
  },

  async create(data: { email: string; role?: string }) {
    // Usar convite admin ao invés de inserção direta para novo fluxo
    const { data: invite, error } = await supabase.rpc('gerar_convite_admin', {
      p_email: data.email,
      p_role: data.role || 'admin'
    });

    if (error) throw new Error(error.message);
    
    const token = (invite as any).token;
    const origin = window.location.origin;
    // Garantir que não há duplicidade na construção da URL
    const inviteUrl = `${origin}/convite-admin?token=${token}`;

    return { ...invite as any, inviteUrl };
  },

  async remove(id: string) {
    await supabase.from('admins').delete().eq('id', id);
    return { message: 'Administrador removido' };
  },
};
