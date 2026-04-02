import express from 'express';
import cors from 'cors';
import { initDB } from './db';
import db from './db';
import { authService, adminMiddleware, masterMiddleware } from './auth';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function ensureUniqueSlug(baseSlug: string): string {
  let slug = baseSlug;
  let counter = 1;
  while (db.prepare('SELECT id FROM provas WHERE slug = ?').get(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Initialize database
initDB();

// --- Auth Routes ---

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email) as any;

  if (!admin || !authService.comparePassword(password, admin.senha)) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }

  const token = authService.generateToken({
    id: admin.id,
    email: admin.email,
    is_master: !!admin.is_master
  });

  res.json({ 
    token, 
    user: { 
      id: admin.id, 
      nome: admin.nome, 
      email: admin.email, 
      is_master: !!admin.is_master 
    } 
  });
});

// --- Admin Management (Master Only) ---

app.post('/api/admins', adminMiddleware, masterMiddleware, (req, res) => {
  const { nome, email, senha } = req.body;
  
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  }

  try {
    const hashedPassword = authService.hashPassword(senha);
    const result = db.prepare('INSERT INTO admins (nome, email, senha, is_master) VALUES (?, ?, ?, 0)')
      .run(nome, email, hashedPassword);
    
    res.json({ id: result.lastInsertRowid, nome, email });
  } catch (err: any) {
    res.status(400).json({ error: 'Erro ao criar admin. Verifique se o email já existe.' });
  }
});

app.get('/api/admins', adminMiddleware, masterMiddleware, (req, res) => {
  const admins = db.prepare('SELECT id, nome, email, is_master, is_protected FROM admins').all();
  res.json(admins);
});

app.delete('/api/admins/:id', adminMiddleware, masterMiddleware, (req: any, res) => {
  const adminId = parseInt(req.params.id);
  
  // Check if admin is protected
  const admin = db.prepare('SELECT is_protected FROM admins WHERE id = ?').get(adminId) as any;
  if (!admin) {
    return res.status(404).json({ error: 'Administrador não encontrado' });
  }
  if (admin.is_protected) {
    return res.status(403).json({ error: 'Este administrador não pode ser removido' });
  }
  
  db.prepare('DELETE FROM admins WHERE id = ?').run(adminId);
  res.json({ message: 'Administrador removido' });
});

// --- Admin Forgot/Reset Password ---

app.post('/api/admin/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Informe o e-mail' });
  const admin = db.prepare('SELECT id FROM admins WHERE email = ?').get(String(email).trim().toLowerCase()) as any;
  if (!admin) return res.status(404).json({ error: 'E-mail não encontrado no sistema' });
  res.json({ message: 'Conta verificada' });
});

app.post('/api/admin/reset-password', (req, res) => {
  const { email, new_password } = req.body;
  if (!email || !new_password) return res.status(400).json({ error: 'Dados incompletos' });
  if (new_password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  
  const admin = db.prepare('SELECT id FROM admins WHERE email = ?').get(String(email).trim().toLowerCase()) as any;
  if (!admin) return res.status(404).json({ error: 'E-mail não encontrado' });
  
  const hashed = authService.hashPassword(new_password);
  db.prepare('UPDATE admins SET senha = ? WHERE id = ?').run(hashed, admin.id);
  res.json({ message: 'Senha redefinida com sucesso' });
});

// --- Student Auth ---

app.post('/api/student/register', (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  if (senha.length < 4) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 4 caracteres' });
  }

  try {
    const hashedPassword = authService.hashPassword(String(senha));
    db.prepare('INSERT INTO alunos (nome, email, telefone, senha) VALUES (?, ?, ?, ?)')
      .run(String(nome).trim(), String(email).trim().toLowerCase(), String(telefone || '').trim(), hashedPassword);
    res.json({ message: 'Cadastro realizado com sucesso' });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar aluno' });
  }
});

app.post('/api/student/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const student = db.prepare('SELECT * FROM alunos WHERE email = ?').get(String(email).trim().toLowerCase()) as any;

  if (!student || !authService.comparePassword(String(senha), student.senha)) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }

  res.json({
    student: {
      id: student.id,
      nome: student.nome,
      email: student.email,
      telefone: student.telefone
    }
  });
});

// --- Exam Management ---

app.post('/api/provas', adminMiddleware, (req: any, res) => {
  const { titulo, descricao, perguntas } = req.body;
  
  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ error: 'Título é obrigatório' });
  }

  const admin_id = req.user.id;

  const transaction = db.transaction(() => {
    const slug = ensureUniqueSlug(generateSlug(titulo.trim()));

    const info = db.prepare('INSERT INTO provas (titulo, descricao, slug, created_by) VALUES (?, ?, ?, ?)')
      .run(titulo.trim(), descricao?.trim() || '', slug, admin_id);
    const provaId = info.lastInsertRowid;

    if (perguntas && Array.isArray(perguntas)) {
      for (const q of perguntas) {
        if (!q.enunciado?.trim()) continue;
        const qInfo = db.prepare('INSERT INTO perguntas (prova_id, enunciado) VALUES (?, ?)')
          .run(provaId, q.enunciado.trim());
        const perguntaId = qInfo.lastInsertRowid;

        if (q.alternativas && Array.isArray(q.alternativas)) {
          for (const alt of q.alternativas) {
            if (!alt.texto?.trim()) continue;
            db.prepare('INSERT INTO alternativas (pergunta_id, texto, is_correta) VALUES (?, ?, ?)')
              .run(perguntaId, alt.texto.trim(), alt.is_correta ? 1 : 0);
          }
        }
      }
    }
    return provaId;
  });

  try {
    const id = transaction();
    const exam = db.prepare('SELECT slug FROM provas WHERE id = ?').get(id) as any;
    res.json({ id, slug: exam?.slug, message: 'Prova criada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar prova' });
  }
});

app.get('/api/provas', (req, res) => {
  const provas = db.prepare(`
    SELECT p.*, a.nome as creator_name,
    (SELECT COUNT(*) FROM perguntas WHERE prova_id = p.id) as qCount,
    (SELECT COUNT(DISTINCT email_aluno) FROM resultados WHERE prova_id = p.id) as studentCount
    FROM provas p 
    LEFT JOIN admins a ON p.created_by = a.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(provas);
});

app.put('/api/provas/:id', adminMiddleware, (req, res) => {
  const { titulo, descricao } = req.body;
  try {
    db.prepare('UPDATE provas SET titulo = ?, descricao = ? WHERE id = ?')
      .run(titulo, descricao, req.params.id);
    res.json({ message: 'Prova atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar prova' });
  }
});

app.delete('/api/provas/:id', adminMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM provas WHERE id = ?').run(req.params.id);
    res.json({ message: 'Prova excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir prova' });
  }
});

app.delete('/api/provas', adminMiddleware, masterMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM provas').run();
    res.json({ message: 'Todas as provas foram excluídas' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir todas as provas' });
  }
});

app.get('/api/provas/slug/:slug', (req, res) => {
  const exam = db.prepare('SELECT * FROM provas WHERE slug = ?').get(req.params.slug) as any;
  if (!exam) return res.status(404).json({ error: 'Prova não encontrada' });

  const questions = db.prepare('SELECT * FROM perguntas WHERE prova_id = ?').all(exam.id) as any[];
  for (const q of questions) {
    q.alternativas = db.prepare('SELECT id, texto FROM alternativas WHERE pergunta_id = ?').all(q.id);
  }

  res.json({ ...exam, perguntas: questions });
});

app.get('/api/provas/:id', (req, res) => {
  const exam = db.prepare('SELECT * FROM provas WHERE id = ?').get(req.params.id) as any;
  if (!exam) return res.status(404).json({ error: 'Prova não encontrada' });

  const questions = db.prepare('SELECT * FROM perguntas WHERE prova_id = ?').all(exam.id) as any[];
  for (const q of questions) {
    q.alternativas = db.prepare('SELECT id, texto FROM alternativas WHERE pergunta_id = ?').all(q.id);
  }

  res.json({ ...exam, perguntas: questions });
});

// --- Student Submission & correction ---

app.post('/api/responder-prova', (req, res) => {
  const { prova_id, respostas, nome_aluno, email_aluno } = req.body; 

  if (!prova_id || !respostas || !nome_aluno || !email_aluno) {
    return res.status(400).json({ error: 'Dados incompletos (nome e e-mail são obrigatórios)' });
  }

  // Sanitize inputs
  const cleanName = String(nome_aluno).trim().slice(0, 200);
  const cleanEmail = String(email_aluno).trim().slice(0, 200);

  const questions = db.prepare('SELECT id FROM perguntas WHERE prova_id = ?').all(prova_id) as any[];
  let acertosCount = 0;
  const total = questions.length;

  if (total === 0) {
    return res.status(400).json({ error: 'Prova sem questões' });
  }

  try {
    const transaction = db.transaction(() => {
      for (const q of questions) {
        const selectedAltId = respostas[q.id];
        const correctAlt = db.prepare('SELECT id FROM alternativas WHERE pergunta_id = ? AND is_correta = 1').get(q.id) as any;
        
        const isCorrect = correctAlt && selectedAltId == correctAlt.id;
        if (isCorrect) acertosCount++;

        if (selectedAltId) {
          db.prepare('INSERT INTO respostas_aluno (prova_id, pergunta_id, alternativa_id, correto) VALUES (?, ?, ?, ?)')
            .run(prova_id, q.id, selectedAltId, isCorrect ? 1 : 0);
        }
      }

      const pontuacao = Math.round((acertosCount / total) * 100);
      db.prepare('INSERT INTO resultados (prova_id, nome_aluno, email_aluno, pontuacao, acertos, total) VALUES (?, ?, ?, ?, ?, ?)')
        .run(prova_id, cleanName, cleanEmail, pontuacao, acertosCount, total);

      return { acertos: acertosCount, total, pontuacao };
    });

    const result = transaction();
    res.json(result);
  } catch (err) {
    console.error('Error saving result:', err);
    res.status(500).json({ error: 'Erro ao processar respostas' });
  }
});

// --- Dashboard & Analytics (Admin Only) ---

app.get('/api/dashboard/stats', adminMiddleware, (req, res) => {
  try {
    const totalProvas = db.prepare('SELECT COUNT(*) as count FROM provas').get() as any;
    const totalAlunos = db.prepare('SELECT COUNT(*) as count FROM alunos').get() as any;
    const provasRealizadas = db.prepare('SELECT COUNT(*) as count FROM resultados').get() as any;
    const mediaGeral = db.prepare('SELECT AVG(pontuacao) as avg FROM resultados').get() as any;

    const recentResults = db.prepare(`
      SELECT r.*, p.titulo as prova_titulo 
      FROM resultados r 
      JOIN provas p ON r.prova_id = p.id 
      ORDER BY r.data DESC LIMIT 5
    `).all();

    res.json({
      metrics: {
        totalProvas: totalProvas.count || 0,
        totalAlunos: totalAlunos.count || 0,
        provasRealizadas: provasRealizadas.count || 0,
        mediaGeral: Math.round(mediaGeral.avg || 0)
      },
      recentResults
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

app.get('/api/dashboard/students', adminMiddleware, (req, res) => {
  try {
    // Get all registered students + their exam stats (if any)
    const students = db.prepare(`
      SELECT 
        a.email,
        a.nome,
        a.telefone,
        a.created_at as data_cadastro,
        COALESCE(r.provas_contagem, 0) as provas_contagem,
        COALESCE(r.media_pontuacao, 0) as media_pontuacao,
        COALESCE(r.ultimo_acesso, a.created_at) as ultimo_acesso,
        CASE WHEN r.provas_contagem > 0 THEN 'Ativo' ELSE 'Cadastrado' END as status
      FROM alunos a
      LEFT JOIN (
        SELECT email_aluno as email,
               COUNT(*) as provas_contagem,
               AVG(pontuacao) as media_pontuacao,
               MAX(data) as ultimo_acesso
        FROM resultados
        GROUP BY email_aluno
      ) r ON r.email = a.email
      ORDER BY a.created_at DESC
    `).all();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar lista de alunos' });
  }
});

// Get student details & exam history by email
app.get('/api/dashboard/students/:email', adminMiddleware, (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    
    // Get student info
    const studentInfo = db.prepare(`
      SELECT email_aluno as email, nome_aluno as nome,
             COUNT(*) as provas_contagem,
             AVG(pontuacao) as media_pontuacao,
             MAX(data) as ultimo_acesso,
             MIN(data) as primeiro_acesso
      FROM resultados
      WHERE email_aluno = ?
      GROUP BY email_aluno
    `).get(email) as any;

    if (!studentInfo) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Get all exam results for this student
    const results = db.prepare(`
      SELECT r.id, r.prova_id, r.pontuacao, r.acertos, r.total, r.data,
             p.titulo as prova_titulo, p.descricao as prova_descricao
      FROM resultados r
      JOIN provas p ON r.prova_id = p.id
      WHERE r.email_aluno = ?
      ORDER BY r.data DESC
    `).all(email) as any[];

    // For each result, get the questions with student answers
    for (const result of results) {
      const questions = db.prepare(`
        SELECT per.id, per.enunciado,
               ra.alternativa_id as resposta_aluno_id,
               ra.correto
        FROM perguntas per
        LEFT JOIN respostas_aluno ra ON ra.pergunta_id = per.id AND ra.prova_id = ?
        WHERE per.prova_id = ?
      `).all(result.prova_id, result.prova_id) as any[];

      for (const q of questions) {
        q.alternativas = db.prepare(`
          SELECT id, texto, is_correta FROM alternativas WHERE pergunta_id = ?
        `).all(q.id);
      }

      result.perguntas = questions;
    }

    res.json({
      student: studentInfo,
      results
    });
  } catch (err) {
    console.error('Error fetching student details:', err);
    res.status(500).json({ error: 'Erro ao buscar detalhes do aluno' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});