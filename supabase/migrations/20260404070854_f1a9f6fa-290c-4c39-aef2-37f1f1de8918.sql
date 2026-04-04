-- 1. Melhorar get_my_role() para ser mais robusto
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Se não estiver autenticado, retornar 'guest'
    IF auth.uid() IS NULL THEN
        RETURN 'guest';
    END IF;

    -- Tentar obter o papel da tabela profiles primeiro (fonte primária)
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    
    -- Fallback: Verificar na tabela admins se for o caso (migração legada ou admins não em profiles)
    IF user_role IS NULL THEN
        SELECT CASE WHEN is_master THEN 'master' ELSE 'admin' END INTO user_role 
        FROM public.admins WHERE id = auth.uid();
    END IF;
    
    -- Fallback: Se for aluno cadastrado na tabela alunos
    IF user_role IS NULL THEN
        IF EXISTS (SELECT 1 FROM public.alunos WHERE id = auth.uid()) THEN
            user_role := 'aluno';
        END IF;
    END IF;
    
    -- Se estiver autenticado mas nada foi encontrado, retornar 'student' por padrão
    RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Sincronizar check_is_admin() com get_my_role()
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_my_role() IN ('admin', 'master');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Limpar políticas redundantes de PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;

CREATE POLICY "Perfis são visíveis publicamente"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Usuários atualizam seus próprios perfis"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins gerenciam todos os perfis"
ON public.profiles FOR ALL
USING (public.get_my_role() IN ('admin', 'master'));

-- 4. Corrigir tabela ALUNOS (Remover política qual:true crítica)
DROP POLICY IF EXISTS "Admins and students can manage all alunos" ON public.alunos;
DROP POLICY IF EXISTS "Alunos veem seu próprio perfil" ON public.alunos;
DROP POLICY IF EXISTS "Admins gerenciam alunos" ON public.alunos;
DROP POLICY IF EXISTS "Public registration" ON public.alunos;
DROP POLICY IF EXISTS "Allow public student reset token lookup" ON public.alunos;
DROP POLICY IF EXISTS "Allow public student reset password update" ON public.alunos;
DROP POLICY IF EXISTS "Allow public update by confirmation token" ON public.alunos;

-- Re-implementar políticas seguras para ALUNOS
CREATE POLICY "Alunos veem seu próprio perfil"
ON public.alunos FOR SELECT
USING (auth.uid() = id OR public.get_my_role() IN ('admin', 'master') OR (confirmation_token IS NOT NULL) OR (reset_token IS NOT NULL));

CREATE POLICY "Auto-registro público de alunos"
ON public.alunos FOR INSERT
WITH CHECK (auth.uid() IS NULL OR public.get_my_role() IN ('admin', 'master'));

CREATE POLICY "Alunos atualizam seus dados ou por tokens"
ON public.alunos FOR UPDATE
USING (auth.uid() = id OR public.get_my_role() IN ('admin', 'master') OR confirmation_token IS NOT NULL OR reset_token IS NOT NULL);

CREATE POLICY "Admins gerenciam alunos plenamente"
ON public.alunos FOR ALL
USING (public.get_my_role() IN ('admin', 'master'));

-- 5. Consolidar políticas de ADMINS
DROP POLICY IF EXISTS "Admins podem visualizar outros admins" ON public.admins;
DROP POLICY IF EXISTS "Master gerencia administradores" ON public.admins;
DROP POLICY IF EXISTS "Login público de admins" ON public.admins;
DROP POLICY IF EXISTS "Allow public reset token lookup" ON public.admins;
DROP POLICY IF EXISTS "Allow public reset password update" ON public.admins;
DROP POLICY IF EXISTS "Admin self-view/update" ON public.admins;

CREATE POLICY "Visualização de admins"
ON public.admins FOR SELECT
USING (public.get_my_role() IN ('admin', 'master') OR (auth.uid() IS NULL) OR reset_token IS NOT NULL);

CREATE POLICY "Master gerencia administradores"
ON public.admins FOR ALL
USING (public.get_my_role() = 'master');

CREATE POLICY "Admin atualiza seus próprios dados"
ON public.admins FOR UPDATE
USING (auth.uid() = id OR reset_token IS NOT NULL);
