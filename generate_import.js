import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

const adminId = '34a76ca3-0d66-4b83-b45c-a008590411b4'; // From Supabase public.admins
const categoriaId = 'c8cbfc47-d46a-4282-aab3-ac4f366a0f6c'; // I should check if this exists or just use a placeholder.

function escape(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

const sql = [];

// 1. Ensure Profile for Admin
sql.push(`
-- Ensure admin profile
INSERT INTO public.profiles (id, role, display_name)
VALUES ('${adminId}', 'master', 'Admin Master')
ON CONFLICT (id) DO UPDATE SET role = 'master';
`);

// 2. Fix search_path for functions
sql.push(`
-- Fix search_path for functions
ALTER FUNCTION public.get_my_role() SET search_path = public;
ALTER FUNCTION public.update_prova_stats() SET search_path = public;
ALTER FUNCTION public.set_provas_created_by() SET search_path = public;
ALTER FUNCTION public.set_respostas_aluno_pontos() SET search_path = public;
ALTER FUNCTION public.ensure_resultados_aluno_id() SET search_path = public;
`);

// 3. Fix vw_provas_stats
sql.push(`
-- Recreate vw_provas_stats as security invoker
DROP VIEW IF EXISTS public.vw_provas_stats;
CREATE VIEW public.vw_provas_stats AS
 SELECT p.id,
    p.titulo,
    p.descricao,
    p.slug,
    p.categoria_id,
    p.created_at,
    p.status,
    p.total_questoes,
    p.total_pontos,
    p.dificuldade,
    p.tags,
    c.nome AS categoria_nome,
    c.cor AS categoria_cor,
    c.icon AS categoria_icon,
    (SELECT count(DISTINCT r.aluno_id) FROM public.resultados r WHERE r.prova_id = p.id) AS studentcount,
    (SELECT count(*) FROM public.resultados r WHERE r.prova_id = p.id) AS total_submissions,
    (SELECT COALESCE(AVG(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS avg_score,
    (SELECT COALESCE(MAX(r.pontuacao), 0) FROM public.resultados r WHERE r.prova_id = p.id) AS max_score
   FROM public.provas p
     LEFT JOIN public.categorias c ON p.categoria_id = c.id;
`);

// 4. Import Data
const provas = db.prepare("SELECT * FROM provas").all();

for (const prova of provas) {
    const provaId = `gen_random_uuid()`;
    const slug = prova.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    sql.push(`
DO $$
DECLARE
    v_prova_id UUID;
    v_pergunta_id UUID;
BEGIN
    -- Import Prova: ${prova.titulo}
    INSERT INTO public.provas (titulo, descricao, created_by, status, slug)
    VALUES (${escape(prova.titulo)}, ${escape(prova.descricao)}, '${adminId}', 'Ativa', '${slug}')
    ON CONFLICT (slug) DO UPDATE SET titulo = EXCLUDED.titulo
    RETURNING id INTO v_prova_id;
`);

    const perguntas = db.prepare("SELECT * FROM perguntas WHERE prova_id = ?").all(prova.id);
    for (const [pIdx, pergunta] of perguntas.entries()) {
        sql.push(`
    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, ${escape(pergunta.enunciado)}, ${pIdx + 1}, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;
`);

        const alternativas = db.prepare("SELECT * FROM alternativas WHERE pergunta_id = ?").all(pergunta.id);
        if (alternativas.length > 0) {
            const altValues = alternativas.map(a => `(v_pergunta_id, ${escape(a.texto)}, ${a.is_correta ? 'true' : 'false'})`).join(',\n        ');
            sql.push(`
    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        ${altValues};
`);
        }
    }

    sql.push(`
END $$;
`);
}

// 5. Import Students and Results
const resultados = db.prepare("SELECT * FROM resultados").all();
for (const res of resultados) {
    const alunoEmail = res.email_aluno;
    const alunoNome = res.nome_aluno;
    const slug_prova = db.prepare("SELECT titulo FROM provas WHERE id = ?").get(res.prova_id).titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    sql.push(`
DO $$
DECLARE
    v_aluno_id UUID;
    v_prova_id UUID;
BEGIN
    -- Ensure Aluno
    INSERT INTO public.alunos (nome, email, status)
    VALUES (${escape(alunoNome)}, ${escape(alunoEmail)}, 'Ativo')
    ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
    RETURNING id INTO v_aluno_id;

    -- Get Prova ID by slug
    SELECT id INTO v_prova_id FROM public.provas WHERE slug = '${slug_prova}';

    IF v_prova_id IS NOT NULL THEN
        -- Import Resultado
        INSERT INTO public.resultados (prova_id, aluno_id, email_aluno, pontuacao, total_questoes, acertos, data_conclusao)
        VALUES (v_prova_id, v_aluno_id, ${escape(alunoEmail)}, ${res.pontuacao}, ${res.total}, ${res.acertos}, ${escape(res.data)});
    END IF;
END $$;
`);
}

process.stdout.write(sql.join('\n'));
