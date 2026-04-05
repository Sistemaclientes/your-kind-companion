-- 1. Add missing columns to provas for more control
ALTER TABLE public.provas 
ADD COLUMN IF NOT EXISTS timer_per_question BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_pause BOOLEAN DEFAULT false;

-- 2. Add turma_id to resultados to freeze the class at the time of the exam
ALTER TABLE public.resultados
ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id);

-- 3. Update the student stats view to be more robust
CREATE OR REPLACE VIEW public.vw_alunos_stats AS
SELECT 
    a.id AS aluno_id,
    a.nome,
    a.email,
    a.cpf,
    a.telefone,
    a.status,
    a.slug,
    a.turma_id,
    t.nome AS turma_nome,
    COUNT(DISTINCT r.id) AS provas_contagem,
    COALESCE(AVG(r.pontuacao), 0) AS media_pontuacao,
    MAX(r.data) AS ultimo_acesso,
    MIN(r.data) AS primeiro_acesso,
    a.created_at
FROM public.alunos a
LEFT JOIN public.turmas t ON a.turma_id = t.id
LEFT JOIN public.resultados r ON a.id = r.aluno_id AND r.status = 'Finalizado'
GROUP BY a.id, a.nome, a.email, a.cpf, a.telefone, a.status, a.slug, a.turma_id, t.nome;

-- 4. Fix get_my_role function to be more reliable
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- 1. Check profiles (Supabase Auth users)
    IF auth.uid() IS NOT NULL THEN
        SELECT p.role INTO v_role FROM public.profiles p WHERE p.id = auth.uid();
        IF v_role IS NOT NULL THEN
            RETURN v_role;
        END IF;
    END IF;

    -- 2. Check admins table (Legacy/Custom Auth)
    SELECT 
        CASE 
            WHEN adm.is_master THEN 'master'
            ELSE 'admin'
        END INTO v_role 
    FROM public.admins adm
    WHERE (auth.uid() IS NOT NULL AND adm.id = auth.uid()) 
       OR (auth.jwt() IS NOT NULL AND adm.email = (auth.jwt() ->> 'email'));
    
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- 3. Check alunos table
    IF EXISTS (
        SELECT 1 FROM public.alunos al 
        WHERE (auth.uid() IS NOT NULL AND al.id = auth.uid()) 
           OR (auth.jwt() IS NOT NULL AND al.email = (auth.jwt() ->> 'email'))
    ) THEN
        RETURN 'aluno';
    END IF;

    RETURN 'guest';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure all views have security_invoker = true (re-applying just in case)
ALTER VIEW public.vw_alunos_stats SET (security_invoker = true);
ALTER VIEW public.vw_dashboard_stats SET (security_invoker = true);
ALTER VIEW public.vw_provas_stats SET (security_invoker = true);
ALTER VIEW public.vw_ranking_alunos SET (security_invoker = true);
ALTER VIEW public.vw_turmas_performance SET (security_invoker = true);
