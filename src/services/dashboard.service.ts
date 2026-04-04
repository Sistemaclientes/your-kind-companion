import { supabase } from './supabase';

export const dashboardService = {
  async getStats() {
    const { data: provas } = await supabase.from('provas').select('id');
    const { data: resultados } = await supabase
      .from('resultados')
      .select('*, alunos(nome, email), provas(titulo, slug)')
      .order('data', { ascending: false });

    const results = resultados || [];
    const uniqueEmails = new Set(results.map((r: any) => r.alunos?.email));
    const avg = results.length > 0
      ? results.reduce((s: number, r: any) => s + (r.pontuacao || 0), 0) / results.length
      : 0;

    return {
      metrics: {
        totalProvas: provas?.length || 0,
        totalAlunos: uniqueEmails.size,
        provasRealizadas: results.length,
        mediaGeral: Math.round(avg),
      },
      recentResults: results.slice(0, 5).map((r: any) => ({
        prova_id: r.prova_id,
        prova_titulo: r.provas?.titulo || 'Prova',
        prova_slug: r.provas?.slug,
        nome_aluno: r.alunos?.nome || 'Aluno',
        data: r.data,
      })),
    };
  },

  async getStudents() {
    const { data: alunos } = await supabase.from('alunos').select('*');
    const { data: resultados } = await supabase.from('resultados').select('*');

    const resultsMap: Record<string, any[]> = {};
    for (const r of resultados || []) {
      if (!resultsMap[r.aluno_id]) resultsMap[r.aluno_id] = [];
      resultsMap[r.aluno_id].push(r);
    }

    return (alunos || []).map((a: any) => {
      const myResults = resultsMap[a.id] || [];
      const totalScore = myResults.reduce((s: number, r: any) => s + (r.pontuacao || 0), 0);
      return {
        id: a.id,
        email: a.email,
        nome: a.nome,
        telefone: a.telefone || '',
        slug: a.slug,
        status: a.status || (myResults.length > 0 ? 'Ativo' : 'Cadastrado'),
        provas_contagem: myResults.length,
        media_pontuacao: myResults.length > 0 ? totalScore / myResults.length : 0,
        ultimo_acesso: myResults.length > 0
          ? myResults.reduce((max: string, r: any) => (r.data > max ? r.data : max), myResults[0].data)
          : a.created_at,
        primeiro_acesso: myResults.length > 0
          ? myResults.reduce((min: string, r: any) => (r.data < min ? r.data : min), myResults[0].data)
          : a.created_at,
      };
    });
  },

  async getStudentDetails(email: string) {
    const { data: aluno } = await supabase
      .from('alunos')
      .select('*')
      .eq('email', email)
      .single();

    if (!aluno) throw new Error('Aluno não encontrado');

    const { data: resultados } = await supabase
      .from('resultados')
      .select('*, provas(titulo, descricao, slug, perguntas(id, enunciado, alternativas(id, texto, is_correta)))')
      .eq('aluno_id', aluno.id)
      .order('data', { ascending: false });

    const myResults = resultados || [];
    const media = myResults.length > 0
      ? myResults.reduce((s: number, r: any) => s + (r.pontuacao || 0), 0) / myResults.length
      : 0;

    const student = {
      email: aluno.email,
      nome: aluno.nome,
      telefone: aluno.telefone || '',
      provas_contagem: myResults.length,
      media_pontuacao: Math.round(media),
      primeiro_acesso: myResults.length > 0 ? myResults[myResults.length - 1].data : aluno.created_at,
      ultimo_acesso: myResults.length > 0 ? myResults[0].data : aluno.created_at,
    };

    const detailedResults = myResults.map((r: any) => ({
      id: r.prova_id,
      prova_id: r.prova_id,
      prova_titulo: r.provas?.titulo || 'Prova',
      prova_descricao: r.provas?.descricao || '',
      pontuacao: r.pontuacao,
      acertos: r.acertos,
      total: r.total,
      data: r.data,
      perguntas: (r.provas?.perguntas || []).map((q: any) => ({
        id: q.id,
        enunciado: q.enunciado,
        resposta_aluno_id: r.respostas?.[q.id],
        correto: q.alternativas?.find((a: any) => a.is_correta)?.id === r.respostas?.[q.id],
        alternativas: (q.alternativas || []).map((a: any) => ({
          id: a.id,
          texto: a.texto,
          is_correta: a.is_correta,
        })),
      })),
    }));

    return { student, results: detailedResults };
  },
};
