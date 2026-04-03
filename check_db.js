const Database = require('better-sqlite3');
const db = new Database('database.sqlite');
const count = db.prepare('SELECT COUNT(*) as count FROM alunos').get().count;
console.log('Alunos:', count);
const results = db.prepare('SELECT COUNT(*) as count FROM resultados').get().count;
console.log('Resultados:', results);
const provas = db.prepare('SELECT COUNT(*) as count FROM provas').get().count;
console.log('Provas:', provas);
