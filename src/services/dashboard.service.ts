import { supabase } from './supabase';

export const dashboardService = {
  async getStats() {
    const { data: provas } = await supabase.from('provas').select('id');
    const { count: totalAlunos } = await supabase.from('alunos').select('*', { count: 'exact', head: true });
    const { data: resultados } = await supabase
      .from('resultados')
      .select('*, alunos(nome), provas(titulo)')
      .order('created_at', { ascending: false });

    const results = resultados || [];
    const avg = results.length > 0
      ? results.reduce((s: number, r: any) => s + (r.pontuacao || 0), 0) / results.length
      : 0;

    return {
      metrics: {
        totalProvas: provas?.length || 0,
        totalAlunos: totalAlunos || 0,
        provasRealizadas: results.length,
        mediaGeral: Math.round(avg),
      },
      recentResults: results.slice(0, 5).map((r: any) => ({
        prova_id: r.prova_id,
        prova_titulo: r.provas?.titulo || 'Prova',
        nome_aluno: r.alunos?.nome || 'Aluno',
        data: r.created_at,
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
        nome: a.nome || 'Aluno',
        email: a.email || '',
        cpf: a.cpf || '',
        telefone: a.telefone || '',
        status: a.status || 'ativo',
        provas_contagem: myResults.length,
        media_pontuacao: myResults.length > 0 ? totalScore / myResults.length : 0,
        ultimo_acesso: a.created_at,
      };
    });
  },

  async getStudentDetails(id: string) {
    // Try to find by ID first, then by email
    let aluno: any = null;
    
    // Check if it's a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUuid) {
      const { data } = await supabase.from('alunos').select('*').eq('id', id).single();
      aluno = data;
    }
    
    if (!aluno) {
      const { data } = await supabase.from('alunos').select('*').eq('email', id).single();
      aluno = data;
    }

    if (!aluno) throw new Error('Aluno não encontrado');

    const { data: resultados } = await supabase
      .from('resultados')
      .select('*, provas(titulo, descricao, perguntas(id, pergunta, respostas(id, texto, correta)))')
      .eq('aluno_id', aluno.id)
      .order('created_at', { ascending: false });

    const myResults = resultados || [];
    const media = myResults.length > 0
      ? myResults.reduce((s: number, r: any) => s + (r.pontuacao || 0), 0) / myResults.length
      : 0;

    const student = {
      id: aluno.id,
      nome: aluno.nome || 'Aluno',
      email: aluno.email || '',
      cpf: aluno.cpf || '',
      telefone: aluno.telefone || '',
      status: aluno.status || 'ativo',
      provas_contagem: myResults.length,
      media_pontuacao: Math.round(media),
      primeiro_acesso: aluno.created_at,
      ultimo_acesso: aluno.updated_at || aluno.created_at,
    };

    const detailedResults = myResults.map((r: any) => ({
      id: r.id,
      prova_id: r.prova_id,
      prova_titulo: r.provas?.titulo || 'Prova',
      prova_descricao: r.provas?.descricao || '',
      pontuacao: r.pontuacao,
      acertos: r.acertos || 0,
      total: r.total || 0,
      data: r.created_at,
    }));

    return { student, results: detailedResults };
  },
};
