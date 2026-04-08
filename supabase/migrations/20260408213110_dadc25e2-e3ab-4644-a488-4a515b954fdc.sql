
DO $$
DECLARE
  v_prova_id uuid;
  v_perg_id uuid;
BEGIN
  INSERT INTO public.provas (titulo, descricao, status, duracao, embaralhar_questoes, mostrar_resultado, permitir_revisao)
  VALUES ('Prova – Mecânica Industrial (Nível Básico/Intermediário)', 'Assinale apenas uma alternativa correta em cada questão.', 'Ativa', 60, false, true, false)
  RETURNING id INTO v_prova_id;

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'Qual é a principal função de um mancal em sistemas mecânicos?', 'multiple-choice', 1, 1) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Transmitir torque entre eixos', false, 0), (v_perg_id, 'Apoiar e permitir a rotação de eixos', true, 1), (v_perg_id, 'Reduzir a temperatura do sistema', false, 2);

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'Em um sistema de transmissão por correias, o desalinhamento pode causar:', 'multiple-choice', 1, 2) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Aumento da eficiência', false, 0), (v_perg_id, 'Desgaste prematuro e vibração', true, 1), (v_perg_id, 'Redução do ruído', false, 2);

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'Qual instrumento é mais adequado para medir folgas internas com precisão?', 'multiple-choice', 1, 3) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Micrômetro', false, 0), (v_perg_id, 'Relógio comparador', true, 1), (v_perg_id, 'Régua metálica', false, 2);

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'O tratamento térmico de têmpera tem como principal objetivo:', 'multiple-choice', 1, 4) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Aumentar a ductilidade', false, 0), (v_perg_id, 'Reduzir a dureza', false, 1), (v_perg_id, 'Aumentar a dureza do material', true, 2);

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'Em sistemas hidráulicos, qual é a função principal da bomba?', 'multiple-choice', 1, 5) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Armazenar fluido', false, 0), (v_perg_id, 'Converter energia mecânica em energia hidráulica', true, 1), (v_perg_id, 'Controlar a pressão do sistema', false, 2);

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'A chaveta em um conjunto eixo-engrenagem tem a função de:', 'multiple-choice', 1, 6) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Fixar axialmente o eixo', false, 0), (v_perg_id, 'Transmitir torque entre eixo e componente', true, 1), (v_perg_id, 'Reduzir vibrações', false, 2);

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'O que ocorre quando há falta de lubrificação adequada em rolamentos?', 'multiple-choice', 1, 7) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Redução do desgaste', false, 0), (v_perg_id, 'Aumento da vida útil', false, 1), (v_perg_id, 'Superaquecimento e falha prematura', true, 2);

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'Qual é a principal característica de um aço carbono médio?', 'multiple-choice', 1, 8) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Alta resistência mecânica e moderada usinabilidade', true, 0), (v_perg_id, 'Baixa resistência e alta ductilidade', false, 1), (v_perg_id, 'Uso exclusivo em plásticos industriais', false, 2);

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'Em metrologia, o que significa "erro sistemático"?', 'multiple-choice', 1, 9) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Erro aleatório sem padrão', false, 0), (v_perg_id, 'Erro constante que se repete nas medições', true, 1), (v_perg_id, 'Erro causado pelo operador apenas', false, 2);

  INSERT INTO public.perguntas (prova_id, pergunta, tipo, pontos, ordem) VALUES (v_prova_id, 'Qual é a função do selo mecânico em bombas industriais?', 'multiple-choice', 1, 10) RETURNING id INTO v_perg_id;
  INSERT INTO public.respostas (pergunta_id, texto, correta, ordem) VALUES (v_perg_id, 'Aumentar a pressão do fluido', false, 0), (v_perg_id, 'Evitar vazamentos entre partes rotativas e fixas', true, 1), (v_perg_id, 'Reduzir a velocidade do eixo', false, 2);
END;
$$;
