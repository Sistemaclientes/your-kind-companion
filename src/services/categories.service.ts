import { supabase } from './supabase';
import { slugify } from '@/lib/utils';

export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    if (error) throw new Error(error.message);
    return data || [];
  },

  async create(data: { nome: string; cor?: string; icon?: string }) {
    const slug = slugify(data.nome);
    const { data: cat, error } = await supabase
      .from('categorias')
      .insert({ nome: data.nome, slug, cor: data.cor || '#3b82f6', icon: data.icon || 'Tag' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return cat;
  },

  async update(id: string, data: any) {
    const slug = slugify(data.nome);
    const { data: cat, error } = await supabase
      .from('categorias')
      .update({ nome: data.nome, slug, cor: data.cor, icon: data.icon, descricao: data.descricao })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return cat;
  },

  async remove(id: string) {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Categoria excluída com sucesso' };
  },
};
