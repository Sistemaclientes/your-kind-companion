import { supabase } from './supabase';

export interface VisualIdentity {
  logo_url: string;
  primary_color: string;
  success_color: string;
}

export const settingsService = {
  async getVisualIdentity(): Promise<VisualIdentity> {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'visual_identity')
      .single();

    if (error || !data) {
      return {
        logo_url: '',
        primary_color: '#0F8B8D',
        success_color: '#10B981',
      };
    }

    return data.valor as VisualIdentity;
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