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

    const prova = (result as any).provas;

    // Build correctAlts map and normalize field names for the UI
    const correctAlts: Record<string, string> = {};
    const perguntas = (prova?.perguntas || []).map((p: any) => {
      const alternativas = (p.respostas || []).map((r: any) => ({
        ...r,
        is_correta: !!r.correta,
      }));
      const correctAlt = alternativas.find((a: any) => a.correta);
      if (correctAlt) {
        correctAlts[p.id] = correctAlt.id;
      }
      return {
        ...p,
        enunciado: p.pergunta,
        alternativas,
      };
    });

    // If result.respostas is empty, try to rebuild from respostas_aluno
    let respostas = (result as any).respostas;
    if (!respostas || Object.keys(respostas).length === 0) {
      const { data: alunoAnswers } = await supabase
        .from('respostas_aluno')
        .select('pergunta_id, resposta_id')
        .eq('resultado_id', id);
      
      if (alunoAnswers && alunoAnswers.length > 0) {
        respostas = {};
        for (const a of alunoAnswers) {
          if (a.pergunta_id && a.resposta_id) {
            respostas[a.pergunta_id] = a.resposta_id;
          }
        }
      }
    }

    console.log('[getResultById] respostas:', JSON.stringify(respostas));
    console.log('[getResultById] correctAlts:', JSON.stringify(correctAlts));

    return {
      ...result,
      respostas,
      prova_titulo: prova?.titulo,
      data: (result as any).created_at,
      exam: {
        ...prova,
        perguntas,
        correctAlts,
      },
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

  async updateStudent(id: string, data: { nome?: string; cpf?: string; telefone?: string }) {
    const updateData: any = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.cpf !== undefined) updateData.cpf = data.cpf;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;

    const { error } = await supabase
      .from('alunos')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error('Erro ao atualizar aluno: ' + error.message);
    return { message: 'Aluno atualizado com sucesso' };
  },

  async deleteStudent(userId: string) {
    // First delete related results
    await supabase.from('resultados').delete().eq('aluno_id', userId);
    
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', userId);

    if (error) throw new Error('Erro ao excluir aluno: ' + error.message);
    return { message: 'Aluno excluído com sucesso' };
  },
};
