import { supabase } from './supabase';

export const examsService = {
  async getAll() {
    const { data: provas, error } = await supabase
      .from('provas')
      .select(`*, perguntas(id, pergunta, respostas(id, texto, correta))`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (provas || []).map((p: any) => ({
      ...p,
      qCount: p.perguntas?.length || 0,
    }));
  },

  async getById(id: string) {
    const { data: prova, error } = await supabase
      .from('provas')
      .select(`*, perguntas(id, pergunta, respostas(id, texto, correta))`)
      .eq('id', id)
      .single();

    if (error || !prova) throw new Error('Prova não encontrada');
    return prova;
  },

  async create(data: any) {
    const { data: newProva, error } = await supabase
      .from('provas')
      .insert({
        titulo: data.titulo,
        descricao: data.descricao || '',
        categoria_id: data.categoria_id || null,
        duracao: data.duracao || null,
        embaralhar_questoes: data.embaralhar_questoes ?? null,
        mostrar_resultado: data.mostrar_resultado ?? null,
        permitir_revisao: data.permitir_revisao ?? null,
      })
      .select()
      .single();

    if (error || !newProva) throw new Error(error?.message || 'Erro ao criar prova');

    for (const q of data.perguntas || []) {
      const { data: pergunta } = await supabase
        .from('perguntas')
        .insert({
          prova_id: newProva.id,
          pergunta: q.pergunta || q.enunciado,
          tipo: q.tipo || 'multiple',
          pontos: q.pontos || 1,
          explicacao: q.explicacao || null,
          imagem_url: q.imagem_url || null,
        })
        .select()
        .single();

      if (!pergunta) continue;

      const respostas = (q.respostas || q.alternativas || []).map((a: any) => ({
        pergunta_id: pergunta.id,
        texto: a.texto,
        correta: !!a.correta || !!a.is_correta,
      }));

      if (respostas.length > 0) await supabase.from('respostas').insert(respostas);
    }

    return { id: newProva.id, message: 'Prova criada com sucesso' };
  },

  async update(id: string, data: any) {
    const { error } = await supabase
      .from('provas')
      .update({
        titulo: data.titulo,
        descricao: data.descricao || '',
        categoria_id: data.categoria_id || null,
        duracao: data.duracao || null,
        embaralhar_questoes: data.embaralhar_questoes ?? null,
        mostrar_resultado: data.mostrar_resultado ?? null,
        permitir_revisao: data.permitir_revisao ?? null,
      })
      .eq('id', id);

    if (error) throw new Error(error.message);

    // Delete old questions (cascade deletes respostas)
    await supabase.from('perguntas').delete().eq('prova_id', id);

    for (const q of data.perguntas || []) {
      const { data: pergunta } = await supabase
        .from('perguntas')
        .insert({
          prova_id: id,
          pergunta: q.pergunta || q.enunciado,
          tipo: q.tipo || 'multiple',
          pontos: q.pontos || 1,
          explicacao: q.explicacao || null,
          imagem_url: q.imagem_url || null,
        })
        .select()
        .single();

      if (!pergunta) continue;

      const respostas = (q.respostas || q.alternativas || []).map((a: any) => ({
        pergunta_id: pergunta.id,
        texto: a.texto,
        correta: !!a.correta || !!a.is_correta,
      }));

      if (respostas.length > 0) await supabase.from('respostas').insert(respostas);
    }

    return { message: 'Prova atualizada com sucesso' };
  },

  async remove(id: string) {
    await supabase.from('provas').delete().eq('id', id);
    return { message: 'Prova excluída' };
  },

  async removeAll() {
    await supabase.from('provas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    return { message: 'Todas as provas excluídas' };
  },

  async submitAnswers(data: any) {
    const { data: prova } = await supabase
      .from('provas')
      .select(`id, titulo, perguntas(id, pergunta, respostas(id, texto, correta))`)
      .eq('id', data.prova_id)
      .single();

    if (!prova) throw new Error('Prova não encontrada');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    // Ensure student record exists
    const { data: aluno } = await supabase.from('alunos').select('id').eq('id', user.id).single();
    if (!aluno) {
      await supabase.from('alunos').insert({ id: user.id, nome: 'Aluno' });
    }

    let acertos = 0;
    const total = (prova as any).perguntas?.length || 0;
    for (const p of (prova as any).perguntas || []) {
      const selectedId = data.respostas?.[p.id];
      const correct = p.respostas?.find((r: any) => r.correta);
      if (correct && selectedId === correct.id) acertos++;
    }
    const pontuacao = total > 0 ? Math.round((acertos / total) * 100) : 0;

    const { data: resultData } = await supabase
      .from('resultados')
      .insert({
        prova_id: data.prova_id,
        aluno_id: user.id,
        pontuacao,
      })
      .select()
      .single();

    return { acertos, total, pontuacao, resultId: resultData?.id };
  },
};
