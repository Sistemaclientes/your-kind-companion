DO $$
DECLARE
    v_categoria_id UUID;
    v_prova_id UUID;
    v_pergunta_id UUID;
    v_admin_id UUID;
BEGIN
    -- Busca o ID do primeiro admin master ou qualquer admin
    SELECT id INTO v_admin_id FROM public.admins ORDER BY is_master DESC LIMIT 1;
    
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum administrador encontrado para associar à prova.';
    END IF;

    -- 1. Categoria
    INSERT INTO public.categorias (nome, slug, descricao, cor, icon)
    VALUES ('Publicidade e Marketing', 'publicidade-e-marketing', 'Questões relacionadas a marketing, publicidade e análise de dados no setor.', '#3b82f6', 'megaphone')
    ON CONFLICT (slug) DO UPDATE SET nome = EXCLUDED.nome
    RETURNING id INTO v_categoria_id;

    -- 2. Prova
    INSERT INTO public.provas (titulo, slug, categoria_id, created_by, duracao, status, categoria, descricao)
    VALUES ('Prova de Conhecimentos em Power BI', 'prova-de-conhecimentos-em-power-bi', v_categoria_id, v_admin_id, 60, 'publicada', 'Publicidade e Marketing', 'Avaliação de conhecimentos fundamentais em Power BI para profissionais de marketing.')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_prova_id;

    -- Se a prova já existia (v_prova_id é nulo), não fazemos nada para evitar duplicidade de questões se rodar de novo
    IF v_prova_id IS NOT NULL THEN
        -- 3. Perguntas e Alternativas
        -- Questão 1
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'O que é o Power BI?', 1, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Uma ferramenta de edição de imagens', false),
        (v_pergunta_id, 'Uma ferramenta de Business Intelligence para análise de dados', true),
        (v_pergunta_id, 'Um software de programação web', false),
        (v_pergunta_id, 'Um banco de dados relacional', false);

        -- Questão 2
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'Qual é a principal função do Power BI?', 2, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Criar sites', false),
        (v_pergunta_id, 'Editar vídeos', false),
        (v_pergunta_id, 'Transformar dados em informações visuais', true),
        (v_pergunta_id, 'Desenvolver jogos', false);

        -- Questão 3
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'Qual etapa envolve carregar dados para o Power BI?', 3, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Visualização', false),
        (v_pergunta_id, 'Importação de dados', true),
        (v_pergunta_id, 'Publicação', false),
        (v_pergunta_id, 'Compartilhamento', false);

        -- Questão 4
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'O que são medidas no Power BI?', 4, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Colunas de texto', false),
        (v_pergunta_id, 'Cálculos criados com DAX', true),
        (v_pergunta_id, 'Tipos de gráficos', false),
        (v_pergunta_id, 'Filtros automáticos', false);

        -- Questão 5
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'Qual recurso permite combinar dados de diferentes tabelas?', 5, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Filtros', false),
        (v_pergunta_id, 'Mesclagem de dados', true),
        (v_pergunta_id, 'Gráficos', false),
        (v_pergunta_id, 'Layouts', false);

        -- Questão 6
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'O que é DAX no Power BI?', 6, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Uma linguagem de design', false),
        (v_pergunta_id, 'Uma linguagem de fórmulas para análise de dados', true),
        (v_pergunta_id, 'Um tipo de gráfico', false),
        (v_pergunta_id, 'Um banco de dados', false);

        -- Questão 7
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'Qual elemento é usado para exibir dados visualmente?', 7, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Tabelas apenas', false),
        (v_pergunta_id, 'Gráficos e dashboards', true),
        (v_pergunta_id, 'Código fonte', false),
        (v_pergunta_id, 'Planilhas externas', false);

        -- Questão 8
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'Qual funcionalidade permite aplicar condições aos dados?', 8, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Coluna condicional', true),
        (v_pergunta_id, 'Botões', false),
        (v_pergunta_id, 'Mapas', false),
        (v_pergunta_id, 'Workspace', false);

        -- Questão 9
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'Onde os relatórios podem ser publicados no Power BI?', 9, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Apenas localmente', false),
        (v_pergunta_id, 'Na nuvem (Power BI Service)', true),
        (v_pergunta_id, 'Somente em PDF', false),
        (v_pergunta_id, 'Apenas em Excel', false);

        -- Questão 10
        INSERT INTO public.perguntas (prova_id, enunciado, ordem, tipo, pontos)
        VALUES (v_prova_id, 'Qual é a finalidade dos filtros no Power BI?', 10, 'multiple', 1)
        RETURNING id INTO v_pergunta_id;
        
        INSERT INTO public.alternativas (pergunta_id, texto, is_correta) VALUES
        (v_pergunta_id, 'Excluir dados permanentemente', false),
        (v_pergunta_id, 'Alterar cores dos gráficos', false),
        (v_pergunta_id, 'Refinar a visualização dos dados', true),
        (v_pergunta_id, 'Criar tabelas automaticamente', false);
    END IF;

END $$;