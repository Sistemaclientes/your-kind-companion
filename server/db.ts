import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

export function initDB() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      is_master BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS provas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
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
  `);

  // Seed Master Admin if not exists
  const masterExists = db.prepare('SELECT id FROM admins WHERE is_master = 1').get();
  if (!masterExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admins (nome, email, senha, is_master) VALUES (?, ?, ?, ?)')
      .run('Master Admin', 'admin@saasprovas.com', hashedPassword, 1);
    console.log('✅ Master Admin seeded: admin@saasprovas.com / admin123');
  }
}

export default db;
