const API_URL = 'http://localhost:3001/api';

// ---- Fallback local data (when backend is unavailable) ----
const FALLBACK_ADMIN = {
  id: 1,
  nome: 'Admin Master',
  email: 'suprememidias.ok@gmail.com',
  password: 'Baudasorte',
  is_master: true
};

const LOCAL_EXAMS_KEY = 'local_provas';
const LOCAL_RESULTS_KEY = 'local_resultados';

function getLocalExams(): any[] {
  const stored = localStorage.getItem(LOCAL_EXAMS_KEY);
  if (!stored) {
    // Seed with MS Project exam
    const seed = [{
      id: 1, titulo: 'PROVA – MS PROJECT (PRÁTICA)', 
      descricao: 'Avaliação prática sobre Microsoft Project - Gerenciamento de Projetos',
      created_by: 1, created_at: new Date().toISOString(), creator_name: 'Admin Master',
      qCount: 5, studentCount: 0,
      perguntas: [
        { id: 1, enunciado: 'O que é o Microsoft Project?', alternativas: [
          { id: 1, texto: 'Um software para edição de vídeos' },
          { id: 2, texto: 'Um software para gerenciamento e planejamento de projetos' },
          { id: 3, texto: 'Um programa para criar planilhas financeiras' }
        ]},
        { id: 2, enunciado: 'No MS Project, o que são tarefas?', alternativas: [
          { id: 4, texto: 'Pessoas responsáveis pelo projeto' },
          { id: 5, texto: 'Atividades que precisam ser realizadas dentro do projeto' },
          { id: 6, texto: 'Custos do projeto' }
        ]},
        { id: 3, enunciado: 'Para que serve o calendário no MS Project?', alternativas: [
          { id: 7, texto: 'Apenas para marcar reuniões' },
          { id: 8, texto: 'Definir datas de trabalho, períodos ativos e inativos' },
          { id: 9, texto: 'Criar relatórios financeiros' }
        ]},
        { id: 4, enunciado: 'O que são recursos no MS Project?', alternativas: [
          { id: 10, texto: 'Apenas equipamentos utilizados' },
          { id: 11, texto: 'Pessoas, materiais ou custos usados nas tarefas' },
          { id: 12, texto: 'Apenas o dinheiro do projeto' }
        ]},
        { id: 5, enunciado: 'Qual é a função dos relatórios no MS Project?', alternativas: [
          { id: 13, texto: 'Apenas imprimir documentos' },
          { id: 14, texto: 'Analisar o desempenho, custos e andamento do projeto' },
          { id: 15, texto: 'Criar tarefas automaticamente' }
        ]}
      ],
      // Correct alternative IDs: 2, 5, 8, 11, 14
      correctAlts: { 1: 2, 2: 5, 3: 8, 4: 11, 5: 14 }
    }];
    localStorage.setItem(LOCAL_EXAMS_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
}

function getLocalResults(): any[] {
  const stored = localStorage.getItem(LOCAL_RESULTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalResults(results: any[]) {
  localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(results));
}

function saveLocalExams(exams: any[]) {
  localStorage.setItem(LOCAL_EXAMS_KEY, JSON.stringify(exams));
}

// Fallback route handlers
function handleFallback(method: string, endpoint: string, data?: any): any {
  // LOGIN
  if (method === 'POST' && endpoint === '/login') {
    // Check stored password (if changed) or default
    const storedPassword = localStorage.getItem('admin_master_password') || FALLBACK_ADMIN.password;
    if (data.email === FALLBACK_ADMIN.email && data.password.toLowerCase() === storedPassword.toLowerCase()) {
      return {
        token: 'local-fallback-token-' + Date.now(),
        user: { id: FALLBACK_ADMIN.id, nome: FALLBACK_ADMIN.nome, email: FALLBACK_ADMIN.email, is_master: true }
      };
    }
    throw new Error('Email ou senha inválidos');
  }

  // GET PROVAS
  if (method === 'GET' && endpoint === '/provas') {
    return getLocalExams().map(e => ({ ...e }));
  }

  // GET PROVA BY ID
  const provaMatch = endpoint.match(/^\/provas\/(\d+)$/);
  if (method === 'GET' && provaMatch) {
    const id = parseInt(provaMatch[1]);
    const exam = getLocalExams().find(e => e.id === id);
    if (!exam) throw new Error('Prova não encontrada');
    return exam;
  }

  // CREATE PROVA
  if (method === 'POST' && endpoint === '/provas') {
    const exams = getLocalExams();
    const newId = Math.max(0, ...exams.map(e => e.id)) + 1;
    let nextAltId = 1;
    exams.forEach(e => e.perguntas?.forEach((p: any) => p.alternativas?.forEach((a: any) => { if (a.id >= nextAltId) nextAltId = a.id + 1; })));
    
    const correctAlts: Record<number, number> = {};
    let nextPergId = 1;
    exams.forEach(e => e.perguntas?.forEach((p: any) => { if (p.id >= nextPergId) nextPergId = p.id + 1; }));

    const perguntas = (data.perguntas || []).map((q: any) => {
      const pId = nextPergId++;
      const alts = (q.alternativas || []).map((a: any) => {
        const aId = nextAltId++;
        if (a.is_correta) correctAlts[pId] = aId;
        return { id: aId, texto: a.texto };
      });
      return { id: pId, enunciado: q.enunciado, alternativas: alts };
    });

    const newExam = {
      id: newId, titulo: data.titulo, descricao: data.descricao || '',
      created_by: 1, created_at: new Date().toISOString(), creator_name: 'Admin Master',
      qCount: perguntas.length, studentCount: 0, perguntas, correctAlts
    };
    exams.unshift(newExam);
    saveLocalExams(exams);
    return { id: newId, message: 'Prova criada com sucesso' };
  }

  // DELETE PROVA
  if (method === 'DELETE' && provaMatch) {
    const id = parseInt(provaMatch[1]);
    const exams = getLocalExams().filter(e => e.id !== id);
    saveLocalExams(exams);
    return { message: 'Prova excluída' };
  }

  // DELETE ALL PROVAS
  if (method === 'DELETE' && endpoint === '/provas') {
    saveLocalExams([]);
    return { message: 'Todas as provas excluídas' };
  }

  // SUBMIT ANSWERS
  if (method === 'POST' && endpoint === '/responder-prova') {
    const exam = getLocalExams().find(e => e.id === data.prova_id);
    if (!exam) throw new Error('Prova não encontrada');
    
    let acertos = 0;
    const total = exam.perguntas.length;
    for (const p of exam.perguntas) {
      const selected = data.respostas[p.id];
      if (exam.correctAlts && exam.correctAlts[p.id] === selected) acertos++;
    }
    const pontuacao = Math.round((acertos / total) * 100);
    
    const results = getLocalResults();
    results.push({
      prova_id: data.prova_id, prova_titulo: exam.titulo,
      nome_aluno: data.nome_aluno, email_aluno: data.email_aluno,
      pontuacao, acertos, total, data: new Date().toISOString()
    });
    saveLocalResults(results);
    return { acertos, total, pontuacao };
  }

  // DASHBOARD STATS
  if (method === 'GET' && endpoint === '/dashboard/stats') {
    const exams = getLocalExams();
    const results = getLocalResults();
    const uniqueEmails = new Set(results.map(r => r.email_aluno));
    const avg = results.length > 0 ? results.reduce((s, r) => s + r.pontuacao, 0) / results.length : 0;
    return {
      metrics: {
        totalProvas: exams.length,
        totalAlunos: uniqueEmails.size,
        provasRealizadas: results.length,
        mediaGeral: Math.round(avg)
      },
      recentResults: results.slice(-5).reverse()
    };
  }

  // DASHBOARD STUDENTS
  if (method === 'GET' && endpoint === '/dashboard/students') {
    const results = getLocalResults();
    const grouped: Record<string, any> = {};
    for (const r of results) {
      if (!grouped[r.email_aluno]) {
        grouped[r.email_aluno] = { email: r.email_aluno, nome: r.nome_aluno, provas_contagem: 0, total_pontuacao: 0, ultimo_acesso: r.data };
      }
      grouped[r.email_aluno].provas_contagem++;
      grouped[r.email_aluno].total_pontuacao += r.pontuacao;
      if (r.data > grouped[r.email_aluno].ultimo_acesso) grouped[r.email_aluno].ultimo_acesso = r.data;
    }
    return Object.values(grouped).map((s: any) => ({
      ...s, media_pontuacao: s.total_pontuacao / s.provas_contagem
    }));
  }

  // CHANGE PASSWORD
  if (method === 'PUT' && endpoint === '/admins/change-password') {
    const storedPassword = localStorage.getItem('admin_master_password') || FALLBACK_ADMIN.password;
    if (data.current_password.toLowerCase() !== storedPassword.toLowerCase()) {
      throw new Error('Senha atual incorreta');
    }
    localStorage.setItem('admin_master_password', data.new_password);
    return { message: 'Senha alterada com sucesso' };
  }

  // ADMINS
  if (method === 'GET' && endpoint === '/admins') {
    const storedAdmins = JSON.parse(localStorage.getItem('local_admins') || '[]');
    return [
      { id: 1, nome: FALLBACK_ADMIN.nome, email: FALLBACK_ADMIN.email, is_master: true, is_protected: true },
      ...storedAdmins
    ];
  }

  if (method === 'POST' && endpoint === '/admins') {
    const storedAdmins = JSON.parse(localStorage.getItem('local_admins') || '[]');
    const newAdmin = { id: Date.now(), nome: data.nome, email: data.email, is_master: false, is_protected: false };
    storedAdmins.push(newAdmin);
    localStorage.setItem('local_admins', JSON.stringify(storedAdmins));
    return newAdmin;
  }

  // DELETE ADMIN
  const adminDeleteMatch = endpoint.match(/^\/admins\/(\d+)$/);
  if (method === 'DELETE' && adminDeleteMatch) {
    const id = parseInt(adminDeleteMatch[1]);
    if (id === 1) throw new Error('Este administrador não pode ser removido');
    const storedAdmins = JSON.parse(localStorage.getItem('local_admins') || '[]');
    localStorage.setItem('local_admins', JSON.stringify(storedAdmins.filter((a: any) => a.id !== id)));
    return { message: 'Administrador removido' };
  }

  return {};
}

// ---- Main API ----
let useLocalFallback = false;

async function tryFetch(method: string, endpoint: string, data?: any): Promise<any> {
  if (useLocalFallback) {
    return handleFallback(method, endpoint, data);
  }

  try {
    const options: RequestInit = {
      method,
      headers: getHeaders(endpoint !== '/login'),
    };
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return handleResponse(response);
  } catch (err: any) {
    // If fetch fails (network error), switch to local fallback
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      console.log('⚡ Backend indisponível, usando modo local');
      useLocalFallback = true;
      return handleFallback(method, endpoint, data);
    }
    throw err;
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Erro de conexão' }));
    if (response.status === 401) {
      localStorage.removeItem('saas_token');
      localStorage.removeItem('saas_user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    throw new Error(err.error || 'Erro na requisição');
  }
  return response.json();
}

function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = localStorage.getItem('saas_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  get: (endpoint: string) => tryFetch('GET', endpoint),
  post: (endpoint: string, data: any) => tryFetch('POST', endpoint, data),
  put: (endpoint: string, data: any) => tryFetch('PUT', endpoint, data),
  delete: (endpoint: string) => tryFetch('DELETE', endpoint),

  login: async (credentials: { email: string; password: string }) => {
    const data = await tryFetch('POST', '/login', credentials);
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