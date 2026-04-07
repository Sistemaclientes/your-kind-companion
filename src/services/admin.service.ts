import { supabase } from './supabase';

export const adminService = {
  async getAll() {
    const { data: admins } = await supabase.from('admins').select('id, email, role, nome, is_master');
    return admins || [];
  },

  async create(data: { nome: string; email: string; senha: string }) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const { data: existingAdmin, error: existingAdminError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingAdminError) throw new Error(existingAdminError.message);
    if (existingAdmin) throw new Error('Este email já está cadastrado como administrador');

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.access_token) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const { data: responseData, error } = await supabase.functions.invoke('create-admin', {
      body: { nome: data.nome.trim(), email: normalizedEmail, senha: data.senha },
    });

    const functionMessage =
      responseData && typeof responseData === 'object' && 'error' in responseData
        ? String(responseData.error)
        : null;

    if (error || functionMessage) {
      throw new Error(functionMessage || error?.message || 'Erro ao criar administrador');
    }

    return responseData;
  },

  async remove(id: string) {
    await supabase.from('admins').delete().eq('id', id);
    return { message: 'Administrador removido' };
  },
};
