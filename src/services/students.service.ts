import { supabase } from './supabase';

export const studentsService = {
  async getResults(email: string) {
    const { data: aluno } = await supabase
      .from('alunos')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (!aluno) return [];

    const { data: results, error } = await supabase
      .from('resultados')
      .select('*, provas(titulo, slug)')
      .eq('aluno_id', aluno.id)
      .order('data', { ascending: false });

    if (error) throw new Error(error.message);
    return (results || []).map((r) => ({
      ...r,
      prova_titulo: (r as any).provas?.titulo,
      prova_slug: (r as any).provas?.slug,
    }));
  },

  async getResultBySlug(slug: string) {
    const { data: result, error } = await supabase
      .from('resultados')
      .select('*, provas(*, perguntas(*, alternativas(*)))')
      .eq('slug', slug)
      .single();

    if (error || !result) throw new Error('Resultado não encontrado');

    const correctAlts: Record<string, string> = {};
    if ((result as any).provas?.perguntas) {
      (result as any).provas.perguntas.forEach((q: any) => {
        const correct = q.alternativas?.find((a: any) => a.is_correta);
        if (correct) correctAlts[q.id] = correct.id;
      });
    }

    return {
      ...result,
      prova_titulo: (result as any).provas?.titulo,
      prova_slug: (result as any).provas?.slug,
      exam: { ...(result as any).provas, correctAlts },
    };
  },

  async updateStatus(email: string, status: string) {
    const { error } = await supabase
      .from('alunos')
      .update({ status })
      .eq('email', email);

    if (error) throw new Error(error.message);
    return { message: 'Status atualizado com sucesso' };
  },

  async deleteStudent(email: string) {
    const { data: aluno } = await supabase
      .from('alunos')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (!aluno) throw new Error('Aluno não encontrado');

    // Delete related results first
    const { error: errRespostas } = await supabase.from('respostas_aluno').delete().eq('aluno_id', aluno.id);
    if (errRespostas) throw new Error('Erro ao excluir respostas: ' + errRespostas.message);

    const { error: errResultados } = await supabase.from('resultados').delete().eq('aluno_id', aluno.id);
    if (errResultados) throw new Error('Erro ao excluir resultados: ' + errResultados.message);

    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', aluno.id);

    if (error) throw new Error('Erro ao excluir aluno: ' + error.message);
    return { message: 'Aluno excluído com sucesso' };
  },

  async updateStudent(email: string, data: { nome?: string; cpf?: string; telefone?: string; status?: string }) {
    const { error } = await supabase
      .from('alunos')
      .update(data)
      .eq('email', email.toLowerCase());

    if (error) throw new Error(error.message);
    return { message: 'Aluno atualizado com sucesso' };
  },

  async logoutAll() {
    const { error } = await supabase
      .from('alunos')
      .update({ must_reconfirm: true });

    if (error) throw new Error(error.message);
    return { message: 'Todos os alunos foram deslogados' };
  },
};
