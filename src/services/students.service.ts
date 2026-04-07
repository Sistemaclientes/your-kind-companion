import { supabase } from './supabase';

export const studentsService = {
  async getResults(userId: string) {
    const { data: results, error } = await supabase
      .from('resultados')
      .select('*, provas(titulo)')
      .eq('aluno_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (results || []).map((r: any) => ({
      ...r,
      prova_titulo: r.provas?.titulo,
    }));
  },

  async getResultById(id: string) {
    const { data: result, error } = await supabase
      .from('resultados')
      .select('*, provas(*, perguntas(*, respostas(*)))')
      .eq('id', id)
      .single();

    if (error || !result) throw new Error('Resultado não encontrado');

    return {
      ...result,
      prova_titulo: (result as any).provas?.titulo,
      exam: (result as any).provas,
    };
  },

  async updateStatus(userId: string, status: string) {
    const { error } = await supabase
      .from('alunos')
      .update({ status })
      .eq('id', userId);

    if (error) throw new Error(error.message);
    return { message: 'Status atualizado com sucesso' };
  },

  async deleteStudent(userId: string) {
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', userId);

    if (error) throw new Error('Erro ao excluir aluno: ' + error.message);
    return { message: 'Aluno excluído com sucesso' };
  },
};
