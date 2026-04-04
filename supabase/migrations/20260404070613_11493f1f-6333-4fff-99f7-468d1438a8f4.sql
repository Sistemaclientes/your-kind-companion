-- 1. Atualizar função get_my_role para ser mais robusta e segura
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Se não estiver autenticado, retornar 'guest'
    IF auth.uid() IS NULL THEN
        RETURN 'guest';
    END IF;

    -- Tentar obter o papel da tabela profiles
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    
    -- Fallback: Verificar na tabela admins
    IF user_role IS NULL THEN
        SELECT CASE WHEN is_master THEN 'master' ELSE 'admin' END INTO user_role 
        FROM public.admins WHERE id = auth.uid();
    END IF;
    
    -- Se ainda for nulo, verificar se é um aluno
    IF user_role IS NULL THEN
        IF EXISTS (SELECT 1 FROM public.alunos WHERE id = auth.uid()) THEN
            user_role := 'aluno';
        END IF;
    END IF;
    
    RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Corrigir políticas de RESPOSTAS_ALUNO
DROP POLICY IF EXISTS "Aluno vê suas respostas" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Aluno cria respostas" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Admins veem todas as respostas" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Users can view their own answers" ON public.respostas_aluno;
DROP POLICY IF EXISTS "Users can insert their own answers" ON public.respostas_aluno;

CREATE POLICY "Aluno vê suas respostas"
ON public.respostas_aluno
FOR SELECT
USING (auth.uid() = aluno_id OR get_my_role() IN ('admin', 'master'));

CREATE POLICY "Aluno cria respostas"
ON public.respostas_aluno
FOR INSERT
WITH CHECK (auth.uid() = aluno_id);

-- 3. Corrigir políticas de NOTIFICACOES
DROP POLICY IF EXISTS "User self-manage notifications" ON public.notificacoes;
DROP POLICY IF EXISTS "Admin send notifications" ON public.notificacoes;

CREATE POLICY "Usuários gerenciam suas notificações"
ON public.notificacoes
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins enviam notificações"
ON public.notificacoes
FOR INSERT
WITH CHECK (get_my_role() IN ('admin', 'master'));

-- 4. Corrigir políticas de CONFIGURACOES
DROP POLICY IF EXISTS "Admin manage config" ON public.configuracoes;
DROP POLICY IF EXISTS "Public read config" ON public.configuracoes;

CREATE POLICY "Leitura pública de configurações"
ON public.configuracoes
FOR SELECT
USING (true);

CREATE POLICY "Admins gerenciam configurações"
ON public.configuracoes
FOR ALL
USING (get_my_role() IN ('admin', 'master'));

-- 5. Corrigir políticas de ALUNOS
DROP POLICY IF EXISTS "Admin manage all students" ON public.alunos;
DROP POLICY IF EXISTS "Allow public select by confirmation token" ON public.alunos;

CREATE POLICY "Alunos veem seu próprio perfil"
ON public.alunos
FOR SELECT
USING (auth.uid() = id OR get_my_role() IN ('admin', 'master') OR (confirmation_token IS NOT NULL));

CREATE POLICY "Admins gerenciam alunos"
ON public.alunos
FOR ALL
USING (get_my_role() IN ('admin', 'master'));

-- 6. Corrigir políticas de ADMINS
DROP POLICY IF EXISTS "Master admin manage all admins" ON public.admins;
DROP POLICY IF EXISTS "Allow public select for login" ON public.admins;
DROP POLICY IF EXISTS "Admins podem ver admins" ON public.admins;
DROP POLICY IF EXISTS "Somente master cria admin" ON public.admins;
DROP POLICY IF EXISTS "Admins atualizam admins" ON public.admins;
DROP POLICY IF EXISTS "Somente master remove admin" ON public.admins;

CREATE POLICY "Admins podem visualizar outros admins"
ON public.admins
FOR SELECT
USING (get_my_role() IN ('admin', 'master'));

CREATE POLICY "Master gerencia administradores"
ON public.admins
FOR ALL
USING (get_my_role() = 'master');

CREATE POLICY "Login público de admins"
ON public.admins
FOR SELECT
USING (email IS NOT NULL AND auth.uid() IS NULL); -- Permitir verificação durante o login se necessário, mas restrito
