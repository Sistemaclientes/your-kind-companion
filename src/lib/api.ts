import { supabase } from '@/integrations/supabase/client';

function generateSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function handleRoute(method: string, endpoint: string, data?: any): Promise<any> {
  // LOGIN
  if (method === 'POST' && endpoint === '/login') {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', data.email)
      .single();
    
    if (error || !admins) throw new Error('Email ou senha inválidos');
    if (admins.senha.toLowerCase() !== data.password.toLowerCase()) throw new Error('Email ou senha inválidos');
    
    return {
      token: 'supabase-token-' + Date.now(),
      user: { id: admins.id, nome: admins.nome, email: admins.email, is_master: admins.is_master }
    };
  }

  // GET CATEGORIAS
  if (method === 'GET' && endpoint === '/categorias') {
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome');
    
    if (error) throw new Error(error.message);
    return categorias || [];
  }
  
  // CREATE CATEGORIA
  if (method === 'POST' && endpoint === '/categorias') {
    const slug = generateSlug(data.nome);
    const { data: newCategoria, error } = await supabase
      .from('categorias')
      .insert({ 
        nome: data.nome, 
        slug,
        cor: data.cor || '#3b82f6',
        icon: data.icon || 'Tag'
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return newCategoria;
  }

  // UPDATE CATEGORIA
  const categoriaUpdateMatch = endpoint.match(/^\/categorias\/([a-f0-9-]+)$/);
  if (method === 'PUT' && categoriaUpdateMatch) {
    const id = categoriaUpdateMatch[1];
    const slug = generateSlug(data.nome);
    const { data: updatedCategoria, error } = await supabase
      .from('categorias')
      .update({ 
        nome: data.nome, 
        slug,
        cor: data.cor,
        icon: data.icon,
        descricao: data.descricao
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return updatedCategoria;
  }

  // DELETE CATEGORIA
  const categoriaDeleteMatch = endpoint.match(/^\/categorias\/([a-f0-9-]+)$/);
  if (method === 'DELETE' && categoriaDeleteMatch) {
    const id = categoriaDeleteMatch[1];
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return { message: 'Categoria excluída com sucesso' };
  }


  // GET PROVAS
  if (method === 'GET' && endpoint === '/provas') {
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
      categoria: p.categorias?.nome || p.categoria || 'Sem Categoria',
      qCount: p.perguntas?.length || 0,
      studentCount: 0,
    }));
  }

  // GET PROVA BY ID
  const provaIdMatch = endpoint.match(/^\/provas\/([a-f0-9-]+)$/);
  if (method === 'GET' && provaIdMatch) {
    const id = provaIdMatch[1];
    const { data: prova, error } = await supabase
      .from('provas')
      .select(`
        *,
        perguntas (
          id, enunciado, ordem,
          alternativas ( id, texto, is_correta )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !prova) throw new Error('Prova não encontrada');
    return prova;
  }

  // GET PROVA BY SLUG
  const slugMatch = endpoint.match(/^\/provas\/slug\/(.+)$/);
  if (method === 'GET' && slugMatch) {
    const slug = slugMatch[1];
    const { data: prova, error } = await supabase
      .from('provas')
      .select(`
        *,
        perguntas (
          id, enunciado, ordem,
          alternativas ( id, texto, is_correta )
        )
      `)
      .eq('slug', slug)
      .single();
    
    if (error || !prova) throw new Error('Prova não encontrada');
    return prova;
  }

  // CREATE PROVA
  if (method === 'POST' && endpoint === '/provas') {
    // Generate unique slug
    let slug = generateSlug(data.titulo);
    const { data: existing } = await supabase.from('provas').select('slug').eq('slug', slug);
    if (existing && existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const { data: newProva, error: provaError } = await supabase
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
        banner_url: data.banner_url
      })
      .select()
      .single();
    
    if (provaError || !newProva) throw new Error(provaError?.message || 'Erro ao criar prova');

    // Insert perguntas and alternativas
    for (const [i, q] of (data.perguntas || []).entries()) {
      const { data: pergunta, error: pErr } = await supabase
        .from('perguntas')
        .insert({ 
          prova_id: newProva.id, 
          enunciado: q.enunciado, 
          ordem: i,
          tipo: q.tipo || 'multiple',
          pontos: q.pontos || 1,
          explicacao: q.explicacao,
          imagem_url: q.imagem_url
        })
        .select()
        .single();
      
      if (pErr || !pergunta) continue;

      const alts = (q.alternativas || []).map((a: any) => ({
        pergunta_id: pergunta.id,
        texto: a.texto,
        is_correta: !!a.is_correta,
      }));

      if (alts.length > 0) {
        await supabase.from('alternativas').insert(alts);
      }
    }

    return { id: newProva.id, message: 'Prova criada com sucesso' };
  }

  // UPDATE PROVA
  const provaUpdateMatch = endpoint.match(/^\/provas\/([a-f0-9-]+)$/);
  if (method === 'PUT' && provaUpdateMatch) {
    const id = provaUpdateMatch[1];
    
    const { error: updateError } = await supabase
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
        banner_url: data.banner_url
      })
      .eq('id', id);
    
    if (updateError) throw new Error(updateError.message);

    // Delete old perguntas (cascade deletes alternativas)
    await supabase.from('perguntas').delete().eq('prova_id', id);

    // Re-insert perguntas and alternativas
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
          imagem_url: q.imagem_url
        })
        .select()
        .single();
      
      if (!pergunta) continue;

      const alts = (q.alternativas || []).map((a: any) => ({
        pergunta_id: pergunta.id,
        texto: a.texto,
        is_correta: !!a.is_correta,
      }));

      if (alts.length > 0) {
        await supabase.from('alternativas').insert(alts);
      }
    }

    return { message: 'Prova atualizada com sucesso' };
  }

  // DELETE PROVA
  const provaDeleteMatch = endpoint.match(/^\/provas\/([a-f0-9-]+)$/);
  if (method === 'DELETE' && provaDeleteMatch) {
    const id = provaDeleteMatch[1];
    await supabase.from('provas').delete().eq('id', id);
    return { message: 'Prova excluída' };
  }

  // DELETE ALL PROVAS
  if (method === 'DELETE' && endpoint === '/provas') {
    await supabase.from('provas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    return { message: 'Todas as provas excluídas' };
  }

  // SUBMIT ANSWERS (responder-prova)
  if (method === 'POST' && endpoint === '/responder-prova') {
    // Get exam with questions and correct answers
    const { data: prova } = await supabase
      .from('provas')
      .select(`
        id, titulo,
        perguntas (
          id, enunciado, pontos, explicacao, imagem_url,
          alternativas ( id, texto, is_correta )
        )
      `)
      .eq('id', data.prova_id)
      .single();
    
    if (!prova) throw new Error('Prova não encontrada');

    // Ensure student exists
    let { data: aluno } = await supabase
      .from('alunos')
      .select('id')
      .eq('email', data.email_aluno)
      .single();
    
    if (!aluno) {
      const { data: newAluno } = await supabase
        .from('alunos')
        .insert({ nome: data.nome_aluno, email: data.email_aluno })
        .select('id')
        .single();
      aluno = newAluno;
    }

    if (!aluno) throw new Error('Erro ao registrar aluno');

    // Calculate score
    let acertos = 0;
    const total = prova.perguntas?.length || 0;
    for (const p of (prova.perguntas || [])) {
      const selectedAltId = data.respostas?.[p.id];
      const correctAlt = p.alternativas?.find((a: any) => a.is_correta);
      if (correctAlt && selectedAltId === correctAlt.id) acertos++;
    }
    const pontuacao = total > 0 ? Math.round((acertos / total) * 100) : 0;

    // Save result
    const { data: resultData } = await supabase.from('resultados').insert({
      prova_id: data.prova_id,
      aluno_id: aluno.id,
      pontuacao,
      acertos,
      total,
      respostas: data.respostas || {},
      status: 'Finalizado',
      data: new Date().toISOString()
    }).select().single();

    if (resultData) {
      const respostasAluno = (prova.perguntas || []).map((p: any) => ({
        resultado_id: resultData.id,
        prova_id: data.prova_id,
        aluno_id: aluno.id,
        pergunta_id: p.id,
        alternativa_id: data.respostas?.[p.id],
        correto: p.alternativas?.find((a: any) => a.is_correta)?.id === data.respostas?.[p.id]
      }));

      if (respostasAluno.length > 0) {
        await supabase.from('respostas_aluno').insert(respostasAluno);
      }
    }

    return { acertos, total, pontuacao };
  }

  // DASHBOARD STATS
  if (method === 'GET' && endpoint === '/dashboard/stats') {
    const { data: provas } = await supabase.from('provas').select('id');
    const { data: resultados } = await supabase
      .from('resultados')
      .select('*, alunos(nome, email), provas(titulo, slug)')
      .order('data', { ascending: false });
    
    const results = resultados || [];
    const uniqueEmails = new Set(results.map((r: any) => r.alunos?.email));
    const avg = results.length > 0 ? results.reduce((s: number, r: any) => s + r.pontuacao, 0) / results.length : 0;

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
  }

  // DASHBOARD STUDENTS
  if (method === 'GET' && endpoint === '/dashboard/students') {
    const { data: alunos } = await supabase.from('alunos').select('*');
    const { data: resultados } = await supabase.from('resultados').select('*');
    
    const resultsMap: Record<string, any[]> = {};
    for (const r of (resultados || [])) {
      if (!resultsMap[r.aluno_id]) resultsMap[r.aluno_id] = [];
      resultsMap[r.aluno_id].push(r);
    }

    return (alunos || []).map((a: any) => {
      const myResults = resultsMap[a.id] || [];
      const totalScore = myResults.reduce((s: number, r: any) => s + r.pontuacao, 0);
      return {
        email: a.email,
        nome: a.nome,
        telefone: a.telefone || '',
        provas_contagem: myResults.length,
        media_pontuacao: myResults.length > 0 ? totalScore / myResults.length : 0,
        ultimo_acesso: myResults.length > 0 
          ? myResults.reduce((max: string, r: any) => r.data > max ? r.data : max, myResults[0].data)
          : a.created_at,
        primeiro_acesso: myResults.length > 0
          ? myResults.reduce((min: string, r: any) => r.data < min ? r.data : min, myResults[0].data)
          : a.created_at,
        status: myResults.length > 0 ? 'Ativo' : 'Cadastrado',
      };
    });
  }

  // DASHBOARD STUDENT DETAILS
  const studentDetailMatch = endpoint.match(/^\/dashboard\/students\/(.+)$/);
  if (method === 'GET' && studentDetailMatch) {
    const email = decodeURIComponent(studentDetailMatch[1]);
    
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
      ? myResults.reduce((s: number, r: any) => s + r.pontuacao, 0) / myResults.length 
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
  }

  // STUDENT REGISTER
  if (method === 'POST' && endpoint === '/student/register') {
    const emailLower = data.email?.toLowerCase();
    
    // Check if already exists
    const { data: existing } = await supabase
      .from('alunos')
      .select('id')
      .eq('email', emailLower)
      .single();
    
    if (existing) throw new Error('Este e-mail já está cadastrado.');

    const { error } = await supabase.from('alunos').insert({
      nome: data.nome,
      email: emailLower,
      telefone: data.telefone || '',
      senha: data.senha || '',
      status: 'Aguardando Confirmação'
    });

    if (error) throw new Error(error.message);
    return { message: 'Cadastro realizado com sucesso' };
  }

  // STUDENT LOGIN
  if (method === 'POST' && endpoint === '/student/login') {
    const { data: aluno, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('email', data.email?.toLowerCase())
      .single();
    
    if (error || !aluno) throw new Error('Email não encontrado. Cadastre-se primeiro.');
    
    // Check if password matches (this app seems to store plain text or simple hashes?)
    if (data.senha && aluno.senha !== data.senha) {
      throw new Error('Senha incorreta.');
    }

    if (aluno.status === 'Aguardando Confirmação') {
      throw new Error('Confirme seu cadastro no e-mail enviado antes de realizar o login.');
    }
    
    return { id: aluno.id, nome: aluno.nome, email: aluno.email, telefone: aluno.telefone };
  }

  // UPDATE STUDENT STATUS (ADMIN)
  if (method === 'PATCH' && endpoint.startsWith('/admin/students/status/')) {
    const email = decodeURIComponent(endpoint.split('/').pop() || '');
    const { status } = data;
    
    const { error } = await supabase
      .from('alunos')
      .update({ status })
      .eq('email', email);
      
    if (error) throw new Error(error.message);
    return { message: 'Status atualizado com sucesso' };
  }

  // ADMIN FORGOT PASSWORD
  if (method === 'POST' && endpoint === '/admin/forgot-password') {
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', data.email?.toLowerCase())
      .single();
    
    if (!admin) throw new Error('E-mail não encontrado no sistema');
    return { message: 'Conta verificada' };
  }

  // ADMIN RESET PASSWORD
  if (method === 'POST' && endpoint === '/admin/reset-password') {
    const { error } = await supabase
      .from('admins')
      .update({ senha: data.new_password })
      .eq('email', data.email?.toLowerCase());
    
    if (error) throw new Error(error.message);
    return { message: 'Senha redefinida com sucesso' };
  }

  // CHANGE PASSWORD
  if (method === 'PUT' && endpoint === '/admins/change-password') {
    const user = api.getUser();
    if (!user) throw new Error('Não autenticado');
    
    const { data: admin } = await supabase
      .from('admins')
      .select('senha')
      .eq('id', user.id)
      .single();
    
    if (!admin || admin.senha.toLowerCase() !== data.current_password.toLowerCase()) {
      throw new Error('Senha atual incorreta');
    }

    await supabase.from('admins').update({ senha: data.new_password }).eq('id', user.id);
    return { message: 'Senha alterada com sucesso' };
  }

  // GET ADMINS
  if (method === 'GET' && endpoint === '/admins') {
    const { data: admins } = await supabase.from('admins').select('id, nome, email, is_master');
    return (admins || []).map((a: any) => ({
      ...a,
      is_protected: a.is_master,
    }));
  }

  // CREATE ADMIN
  if (method === 'POST' && endpoint === '/admins') {
    const { data: newAdmin, error } = await supabase
      .from('admins')
      .insert({ nome: data.nome, email: data.email, senha: data.senha || 'senha123', is_master: false })
      .select('id, nome, email, is_master')
      .single();
    
    if (error) throw new Error(error.message);
    return newAdmin;
  }

  // DELETE ADMIN
  const adminDeleteMatch = endpoint.match(/^\/admins\/([a-f0-9-]+)$/);
  if (method === 'DELETE' && adminDeleteMatch) {
    const id = adminDeleteMatch[1];
    
    const { data: admin } = await supabase.from('admins').select('is_master').eq('id', id).single();
    if (admin?.is_master) throw new Error('Este administrador não pode ser removido');
    
    await supabase.from('admins').delete().eq('id', id);
    return { message: 'Administrador removido' };
  }

  // LOGOUT ALL STUDENTS
  if (method === 'POST' && endpoint === '/admin/students/logout-all') {
    const { error } = await supabase
      .from('alunos')
      .update({ must_reconfirm: true });
    
    if (error) throw new Error(error.message);
    return { message: 'Todos os alunos foram deslogados' };
  }

  return {};
}

export const api = {
  get: (endpoint: string) => handleRoute('GET', endpoint),
  post: (endpoint: string, data: any) => handleRoute('POST', endpoint, data),
  put: (endpoint: string, data: any) => handleRoute('PUT', endpoint, data),
  patch: (endpoint: string, data: any) => handleRoute('PATCH', endpoint, data),
  delete: (endpoint: string) => handleRoute('DELETE', endpoint),

  login: async (credentials: { email: string; password: string }) => {
    const data = await handleRoute('POST', '/login', credentials);
    localStorage.setItem('saas_token', data.token);
    localStorage.setItem('saas_user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
  },

  getUser: () => {
    const user = localStorage.getItem('saas_user');
    return user ? JSON.parse(user) : null;
  }
};

export default api;
