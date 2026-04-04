
-- Ensure admin profile
INSERT INTO public.profiles (id, role, display_name)
VALUES ('34a76ca3-0d66-4b83-b45c-a008590411b4', 'master', 'Admin Master')
ON CONFLICT (id) DO UPDATE SET role = 'master';


-- Fix search_path for functions
ALTER FUNCTION public.get_my_role() SET search_path = public;
ALTER FUNCTION public.update_prova_stats() SET search_path = public;
ALTER FUNCTION public.set_provas_created_by() SET search_path = public;
ALTER FUNCTION public.set_respostas_aluno_pontos() SET search_path = public;
ALTER FUNCTION public.ensure_resultados_aluno_id() SET search_path = public;


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


DO $$
DECLARE
    v_prova_id UUID;
    v_pergunta_id UUID;
BEGIN
    -- Import Prova: qual é melhor
    INSERT INTO public.provas (titulo, descricao, created_by, status, slug)
    VALUES ('qual é melhor', '', '34a76ca3-0d66-4b83-b45c-a008590411b4', 'Ativa', 'qual-e-melhor')
    ON CONFLICT (slug) DO UPDATE SET titulo = EXCLUDED.titulo
    RETURNING id INTO v_prova_id;


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'qual cor seria a melhor', 1, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Vermelho', true),
        (v_pergunta_id, 'Amarelo', false),
        (v_pergunta_id, 'Verde', false),
        (v_pergunta_id, '', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual tamanho é melhor', 2, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, '10M', true),
        (v_pergunta_id, '15', false),
        (v_pergunta_id, '25', false),
        (v_pergunta_id, '', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual é mehor', 3, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Laranja', true),
        (v_pergunta_id, 'goiaba', false),
        (v_pergunta_id, 'pera', false),
        (v_pergunta_id, '', false);


END $$;


DO $$
DECLARE
    v_prova_id UUID;
    v_pergunta_id UUID;
BEGIN
    -- Import Prova: PROVA – MS PROJECT (PRÁTICA)
    INSERT INTO public.provas (titulo, descricao, created_by, status, slug)
    VALUES ('PROVA – MS PROJECT (PRÁTICA)', 'Avaliação prática sobre Microsoft Project - Gerenciamento de Projetos', '34a76ca3-0d66-4b83-b45c-a008590411b4', 'Ativa', 'prova-ms-project-pratica')
    ON CONFLICT (slug) DO UPDATE SET titulo = EXCLUDED.titulo
    RETURNING id INTO v_prova_id;


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que é o Microsoft Project?', 1, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Um software para edição de vídeos', false),
        (v_pergunta_id, 'Um software para gerenciamento e planejamento de projetos', true),
        (v_pergunta_id, 'Um programa para criar planilhas financeiras', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'No MS Project, o que são tarefas?', 2, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Pessoas responsáveis pelo projeto', false),
        (v_pergunta_id, 'Atividades que precisam ser realizadas dentro do projeto', true),
        (v_pergunta_id, 'Custos do projeto', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Para que serve o calendário no MS Project?', 3, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Apenas para marcar reuniões', false),
        (v_pergunta_id, 'Definir datas de trabalho, períodos ativos e inativos', true),
        (v_pergunta_id, 'Criar relatórios financeiros', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que são recursos no MS Project?', 4, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Apenas equipamentos utilizados', false),
        (v_pergunta_id, 'Pessoas, materiais ou custos usados nas tarefas', true),
        (v_pergunta_id, 'Apenas o dinheiro do projeto', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual é a função dos relatórios no MS Project?', 5, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Apenas imprimir documentos', false),
        (v_pergunta_id, 'Analisar o desempenho, custos e andamento do projeto', true),
        (v_pergunta_id, 'Criar tarefas automaticamente', false);


END $$;


DO $$
DECLARE
    v_prova_id UUID;
    v_pergunta_id UUID;
BEGIN
    -- Import Prova: Gestão da Produção Industrial
    INSERT INTO public.provas (titulo, descricao, created_by, status, slug)
    VALUES ('Gestão da Produção Industrial', '', '34a76ca3-0d66-4b83-b45c-a008590411b4', 'Ativa', 'gestao-da-producao-industrial')
    ON CONFLICT (slug) DO UPDATE SET titulo = EXCLUDED.titulo
    RETURNING id INTO v_prova_id;


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que é PPCP na gestão da produção?', 1, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Planejamento, Programação e Controle da Produção', true),
        (v_pergunta_id, 'Processo de Controle de Pessoas', false),
        (v_pergunta_id, 'Plano de Produção Contábil', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual o principal objetivo do sistema Just in Time?', 2, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Produzir apenas o necessário no momento certo', true),
        (v_pergunta_id, 'Aumentar o estoque ao máximo', false),
        (v_pergunta_id, 'Reduzir a qualidade dos produtos', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que significa produtividade?', 3, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Quantidade produzida em relação aos recursos utilizados', true),
        (v_pergunta_id, 'Quantidade de funcionários em uma empresa', false),
        (v_pergunta_id, 'Número de máquinas utilizadas', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual ferramenta é usada para identificar causas principais de problemas?', 4, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Diagrama de Pareto', true),
        (v_pergunta_id, 'Organograma', false),
        (v_pergunta_id, 'Fluxograma básico', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que é manutenção preventiva?', 5, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Realizada antes da falha para evitar problemas', true),
        (v_pergunta_id, 'Feita somente após quebra', false),
        (v_pergunta_id, 'Sem planejamento', false);


END $$;


DO $$
DECLARE
    v_prova_id UUID;
    v_pergunta_id UUID;
BEGIN
    -- Import Prova: Mestre de Obras
    INSERT INTO public.provas (titulo, descricao, created_by, status, slug)
    VALUES ('Mestre de Obras', '', '34a76ca3-0d66-4b83-b45c-a008590411b4', 'Ativa', 'mestre-de-obras')
    ON CONFLICT (slug) DO UPDATE SET titulo = EXCLUDED.titulo
    RETURNING id INTO v_prova_id;


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual a função principal do mestre de obras?', 1, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Supervisionar e coordenar a obra', true),
        (v_pergunta_id, 'Fazer apenas cálculos estruturais', false),
        (v_pergunta_id, 'Cuidar apenas da parte administrativa', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que envolve a leitura de projetos?', 2, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Interpretar plantas e escalas', true),
        (v_pergunta_id, 'Somente leitura textual', false),
        (v_pergunta_id, 'Apenas cálculos financeiros', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que é canteiro de obras?', 3, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Local onde a obra é executada', true),
        (v_pergunta_id, 'Somente o escritório', false),
        (v_pergunta_id, 'Área de descanso', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual é uma etapa da construção?', 4, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Fundação', true),
        (v_pergunta_id, 'Somente pintura', false),
        (v_pergunta_id, 'Entrega direta', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual projeto define a estrutura?', 5, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Projeto estrutural', true),
        (v_pergunta_id, 'Projeto decorativo', false),
        (v_pergunta_id, 'Projeto de marketing', false);


END $$;


DO $$
DECLARE
    v_prova_id UUID;
    v_pergunta_id UUID;
BEGIN
    -- Import Prova: Power BI
    INSERT INTO public.provas (titulo, descricao, created_by, status, slug)
    VALUES ('Power BI', '', '34a76ca3-0d66-4b83-b45c-a008590411b4', 'Ativa', 'power-bi')
    ON CONFLICT (slug) DO UPDATE SET titulo = EXCLUDED.titulo
    RETURNING id INTO v_prova_id;


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual é a principal função do Power BI?', 1, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Analisar dados e criar dashboards', true),
        (v_pergunta_id, 'Criar sites', false),
        (v_pergunta_id, 'Editar imagens', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que é DAX no Power BI?', 2, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Linguagem de fórmulas para análise de dados', true),
        (v_pergunta_id, 'Tipo de gráfico', false),
        (v_pergunta_id, 'Banco de dados externo', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual etapa envolve importar dados no Power BI?', 3, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Carregamento de dados', true),
        (v_pergunta_id, 'Publicação', false),
        (v_pergunta_id, 'Compartilhamento', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Para que servem os dashboards?', 4, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Visualizar informações de forma clara', true),
        (v_pergunta_id, 'Programar sistemas', false),
        (v_pergunta_id, 'Armazenar arquivos', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que são filtros no Power BI?', 5, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Recursos para refinar dados exibidos', true),
        (v_pergunta_id, 'Ferramentas de edição de imagem', false),
        (v_pergunta_id, 'Tipos de gráficos', false);


END $$;


DO $$
DECLARE
    v_prova_id UUID;
    v_pergunta_id UUID;
BEGIN
    -- Import Prova: Mecatrônica
    INSERT INTO public.provas (titulo, descricao, created_by, status, slug)
    VALUES ('Mecatrônica', '', '34a76ca3-0d66-4b83-b45c-a008590411b4', 'Ativa', 'mecatronica')
    ON CONFLICT (slug) DO UPDATE SET titulo = EXCLUDED.titulo
    RETURNING id INTO v_prova_id;


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que é mecatrônica?', 1, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Integração entre mecânica, eletrônica e automação', true),
        (v_pergunta_id, 'Apenas eletrônica', false),
        (v_pergunta_id, 'Somente programação', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual é a função do CLP?', 2, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Controlar processos automatizados', true),
        (v_pergunta_id, 'Gerar energia elétrica', false),
        (v_pergunta_id, 'Fazer cálculos estruturais', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que são sensores?', 3, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Dispositivos que captam informações do ambiente', true),
        (v_pergunta_id, 'Motores elétricos', false),
        (v_pergunta_id, 'Programas de computador', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'Qual é a função dos atuadores?', 4, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Executar ações no sistema', true),
        (v_pergunta_id, 'Armazenar dados', false),
        (v_pergunta_id, 'Controlar usuários', false);


    INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
    VALUES (v_prova_id, 'O que é manutenção preventiva?', 5, 'multiple', 1)
    RETURNING id INTO v_pergunta_id;


    INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Evitar falhas antes que aconteçam', true),
        (v_pergunta_id, 'Corrigir falhas após ocorrerem', false),
        (v_pergunta_id, 'Ignorar manutenção', false);


END $$;


DO $$
DECLARE
    v_aluno_id UUID;
    v_prova_id UUID;
BEGIN
    -- Ensure Aluno
    INSERT INTO public.alunos (nome, email, status)
    VALUES ('jonas oliveira ', 'jonas.ok@hotmail.com', 'Ativo')
    ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
    RETURNING id INTO v_aluno_id;

    -- Get Prova ID by slug
    SELECT id INTO v_prova_id FROM public.provas WHERE slug = 'qual-e-melhor';

    IF v_prova_id IS NOT NULL THEN
        -- Import Resultado
        INSERT INTO public.resultados (prova_id, aluno_id, email_aluno, pontuacao, total_questoes, acertos, data_conclusao)
        VALUES (v_prova_id, v_aluno_id, 'jonas.ok@hotmail.com', 0, 3, 0, '2026-03-27 17:47:55');
    END IF;
END $$;


DO $$
DECLARE
    v_aluno_id UUID;
    v_prova_id UUID;
BEGIN
    -- Ensure Aluno
    INSERT INTO public.alunos (nome, email, status)
    VALUES ('jonas oliveira da silva ', 'teste@teste.com', 'Ativo')
    ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
    RETURNING id INTO v_aluno_id;

    -- Get Prova ID by slug
    SELECT id INTO v_prova_id FROM public.provas WHERE slug = 'qual-e-melhor';

    IF v_prova_id IS NOT NULL THEN
        -- Import Resultado
        INSERT INTO public.resultados (prova_id, aluno_id, email_aluno, pontuacao, total_questoes, acertos, data_conclusao)
        VALUES (v_prova_id, v_aluno_id, 'teste@teste.com', 33, 3, 1, '2026-03-27 17:49:15');
    END IF;
END $$;


DO $$
DECLARE
    v_aluno_id UUID;
    v_prova_id UUID;
BEGIN
    -- Ensure Aluno
    INSERT INTO public.alunos (nome, email, status)
    VALUES ('jonas oliveira da silva ', 'teste@teste.com', 'Ativo')
    ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
    RETURNING id INTO v_aluno_id;

    -- Get Prova ID by slug
    SELECT id INTO v_prova_id FROM public.provas WHERE slug = 'qual-e-melhor';

    IF v_prova_id IS NOT NULL THEN
        -- Import Resultado
        INSERT INTO public.resultados (prova_id, aluno_id, email_aluno, pontuacao, total_questoes, acertos, data_conclusao)
        VALUES (v_prova_id, v_aluno_id, 'teste@teste.com', 33, 3, 1, '2026-03-27 17:50:02');
    END IF;
END $$;
