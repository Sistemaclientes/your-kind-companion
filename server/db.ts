import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

export function initDB() {
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      is_master BOOLEAN DEFAULT 0,
      is_protected BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS provas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      slug TEXT UNIQUE,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS perguntas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prova_id INTEGER NOT NULL,
      enunciado TEXT NOT NULL,
      FOREIGN KEY (prova_id) REFERENCES provas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alternativas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pergunta_id INTEGER NOT NULL,
      texto TEXT NOT NULL,
      is_correta BOOLEAN DEFAULT 0,
      FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS respostas_aluno (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prova_id INTEGER NOT NULL,
      pergunta_id INTEGER NOT NULL,
      alternativa_id INTEGER NOT NULL,
      correto BOOLEAN NOT NULL,
      FOREIGN KEY (prova_id) REFERENCES provas(id) ON DELETE CASCADE,
      FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE CASCADE,
      FOREIGN KEY (alternativa_id) REFERENCES alternativas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resultados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prova_id INTEGER NOT NULL,
      nome_aluno TEXT NOT NULL,
      email_aluno TEXT NOT NULL,
      pontuacao INTEGER NOT NULL,
      acertos INTEGER NOT NULL,
      total INTEGER NOT NULL,
      data DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prova_id) REFERENCES provas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefone TEXT,
      senha TEXT NOT NULL,
      email_confirmed BOOLEAN DEFAULT 0,
      confirmation_token TEXT,
      token_expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

  `);

  // Ensure is_protected column exists (migration)
  try {
    db.exec(`ALTER TABLE admins ADD COLUMN is_protected BOOLEAN DEFAULT 0`);
  } catch (e) {
    // Column already exists
  }

  // Ensure slug column exists (migration)
  try {
    db.exec(`ALTER TABLE provas ADD COLUMN slug TEXT UNIQUE`);
  } catch (e) {
    // Column already exists
  }

  // Seed or update Admin Master with specified credentials
  const masterEmail = 'suprememidias.ok@gmail.com';
  const masterExists = db.prepare('SELECT id FROM admins WHERE email = ?').get(masterEmail) as any;
  
  if (!masterExists) {
    const hashedPassword = bcrypt.hashSync('Baudasorte', 10);
    db.prepare('INSERT INTO admins (nome, email, senha, is_master, is_protected) VALUES (?, ?, ?, ?, ?)')
      .run('Admin Master', masterEmail, hashedPassword, 1, 1);
    console.log('✅ Admin Master seeded: suprememidias.ok@gmail.com');
  } else {
    // Update password and ensure master + protected flags
    const hashedPassword = bcrypt.hashSync('Baudasorte', 10);
    db.prepare('UPDATE admins SET senha = ?, is_master = 1, is_protected = 1 WHERE email = ?')
      .run(hashedPassword, masterEmail);
  }
}

export default db;