import { supabase } from './supabase';

function generateSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export const examsService = {
  async getAll() {
    const { data: provas, error } = await supabase
      .from('provas')
      .select(`
        *,
        categorias ( id, nome, slug, cor, icon ),
        perguntas (
          id, enunciado, ordem, imagem_url,
          alternativas ( id, texto, is_correta )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (provas || []).map((p: any) => ({
      ...p,
      categoria: p.categorias?.nome || 'Sem Categoria',
      qCount: p.perguntas?.length || 0,
      studentCount: 0,
    }));
  },

  async getById(id: string) {
    const { data: prova, error } = await supabase
      .from('provas')
      .select(`*, perguntas ( id, enunciado, ordem, alternativas ( id, texto, is_correta ) )`)
      .eq('id', id)
      .single();

    if (error || !prova) throw new Error('Prova não encontrada');
    return prova;
  },

  async getBySlug(slug: string) {
    const { data: prova, error } = await supabase
      .from('provas')
      .select(`*, perguntas ( id, enunciado, ordem, alternativas ( id, texto, is_correta ) )`)
      .eq('slug', slug)
      .single();

    if (error || !prova) throw new Error('Prova não encontrada');
    return prova;
  },

  async create(data: any) {
    let slug = generateSlug(data.titulo);
    const { data: existing } = await supabase.from('provas').select('slug').eq('slug', slug);
    if (existing && existing.length > 0) slug = `${slug}-${Date.now()}`;

    const { data: newProva, error } = await supabase
      .from('provas')
      .insert({
        titulo: data.titulo,
        descricao: data.descricao || '',
        slug,
        categoria_id: data.categoria_id,
        duracao: data.duracao || 60,
        embaralhar_questoes: data.embaralhar_questoes ?? true,
        mostrar_resultado: data.mostrar_resultado ?? true,
        permitir_revisao: data.permitir_revisao ?? true,
        bloquear_navegacao: data.bloquear_navegacao ?? false,
        nota_corte: data.nota_corte || 7.0,
        tentativas_maximas: data.tentativas_maximas || 1,
        feedback_aprovacao: data.feedback_aprovacao,
        feedback_reprovacao: data.feedback_reprovacao,
        banner_url: data.banner_url,
      })
      .select()
      .single();

    if (error || !newProva) throw new Error(error?.message || 'Erro ao criar prova');

    for (const [i, q] of (data.perguntas || []).entries()) {
      const { data: pergunta } = await supabase
        .from('perguntas')
        .insert({
          prova_id: newProva.id,
          enunciado: q.enunciado,
          ordem: i,
          tipo: q.tipo || 'multiple',
          pontos: q.pontos || 1,
          explicacao: q.explicacao,
          imagem_url: q.imagem_url,
        })
        .select()
        .single();

      if (!pergunta) continue;

      const alts = (q.alternativas || []).map((a: any) => ({
        pergunta_id: pergunta.id,
        texto: a.texto,
        is_correta: !!a.is_correta,
      }));

      if (alts.length > 0) await supabase.from('alternativas').insert(alts);
    }

    return { id: newProva.id, message: 'Prova criada com sucesso' };
  },

  async update(id: string, data: any) {
    const { error } = await supabase
      .from('provas')
      .update({
        titulo: data.titulo,
        descricao: data.descricao || '',
        categoria_id: data.categoria_id,
        duracao: data.duracao || 60,
        embaralhar_questoes: data.embaralhar_questoes ?? true,
        mostrar_resultado: data.mostrar_resultado ?? true,
        permitir_revisao: data.permitir_revisao ?? true,
        bloquear_navegacao: data.bloquear_navegacao ?? false,
        nota_corte: data.nota_corte || 7.0,
        tentativas_maximas: data.tentativas_maximas || 1,
        feedback_aprovacao: data.feedback_aprovacao,
        feedback_reprovacao: data.feedback_reprovacao,
        banner_url: data.banner_url,
      })
      .eq('id', id);

    if (error) throw new Error(error.message);

    await supabase.from('perguntas').delete().eq('prova_id', id);

    for (const [i, q] of (data.perguntas || []).entries()) {
      const { data: pergunta } = await supabase
        .from('perguntas')
        .insert({
          prova_id: id,
          enunciado: q.enunciado,
          ordem: i,
          tipo: q.tipo || 'multiple',
          pontos: q.pontos || 1,
          explicacao: q.explicacao,
          imagem_url: q.imagem_url,
        })
        .select()
        .single();

      if (!pergunta) continue;

      const alts = (q.alternativas || []).map((a: any) => ({
        pergunta_id: pergunta.id,
        texto: a.texto,
        is_correta: !!a.is_correta,
      }));

      if (alts.length > 0) await supabase.from('alternativas').insert(alts);
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
      .select(`id, titulo, perguntas ( id, enunciado, pontos, explicacao, imagem_url, alternativas ( id, texto, is_correta ) )`)
      .eq('id', data.prova_id)
      .single();

    if (!prova) throw new Error('Prova não encontrada');

    let { data: aluno } = await supabase.from('alunos').select('id').eq('email', data.email_aluno).single();
    if (!aluno) {
      const { data: newAluno } = await supabase
        .from('alunos')
        .insert({ nome: data.nome_aluno, email: data.email_aluno })
        .select('id')
        .single();
      aluno = newAluno;
    }
    if (!aluno) throw new Error('Erro ao registrar aluno');

    let acertos = 0;
    const total = prova.perguntas?.length || 0;
    for (const p of prova.perguntas || []) {
      const selectedAltId = data.respostas?.[p.id];
      const correctAlt = (p as any).alternativas?.find((a: any) => a.is_correta);
      if (correctAlt && selectedAltId === correctAlt.id) acertos++;
    }
    const pontuacao = total > 0 ? Math.round((acertos / total) * 100) : 0;

    const { data: resultData } = await supabase
      .from('resultados')
      .insert({
        prova_id: data.prova_id,
        aluno_id: aluno.id,
        pontuacao,
        acertos,
        total,
        respostas: data.respostas || {},
        status: 'Finalizado',
        data: new Date().toISOString(),
      })
      .select()
      .single();

    if (resultData) {
      const respostasAluno = (prova.perguntas || []).map((p: any) => ({
        resultado_id: resultData.id,
        prova_id: data.prova_id,
        aluno_id: aluno!.id,
        pergunta_id: p.id,
        alternativa_id: data.respostas?.[p.id],
        correto: p.alternativas?.find((a: any) => a.is_correta)?.id === data.respostas?.[p.id],
      }));
      if (respostasAluno.length > 0) await supabase.from('respostas_aluno').insert(respostasAluno);
    }

    return { acertos, total, pontuacao, slug: resultData?.slug };
  },
};
