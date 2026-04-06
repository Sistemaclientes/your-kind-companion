import { supabase } from './supabase';

export interface VisualIdentity {
  logo_url: string;
  primary_color: string;
  success_color: string;
}

export const settingsService = {
  async getVisualIdentity(): Promise<VisualIdentity> {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'visual_identity')
        .maybeSingle();

      if (error || !data) {
        return {
          logo_url: '',
          primary_color: '#0F8B8D',
          success_color: '#10B981',
        };
      }

      const valor = data.valor as any;
      return {
        logo_url: valor.logo_url || '',
        primary_color: valor.primary_color || '#0F8B8D',
        success_color: valor.success_color || '#10B981',
      };
    } catch (err) {
      console.error('Error in getVisualIdentity:', err);
      return {
        logo_url: '',
        primary_color: '#0F8B8D',
        success_color: '#10B981',
      };
    }
  },

  async updateVisualIdentity(identity: Partial<VisualIdentity>) {
    const current = await this.getVisualIdentity();
    const newValue = { ...current, ...identity };

    const { error } = await supabase
      .from('configuracoes')
      .upsert({ 
        chave: 'visual_identity', 
        valor: newValue 
      }, { onConflict: 'chave' });

    if (error) throw error;
    return newValue;
  }
};