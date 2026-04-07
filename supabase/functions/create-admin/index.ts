import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { z } from 'https://esm.sh/zod@3.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CreateAdminSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(120, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(72, 'Senha muito longa'),
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const publishableKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
      return jsonResponse({ error: 'Configuração do Supabase incompleta' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Não autorizado' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const authClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    const callerId = claimsData?.claims?.sub;

    if (claimsError || !callerId) {
      return jsonResponse({ error: 'Não autorizado' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerAdmin, error: callerAdminError } = await adminClient
      .from('admins')
      .select('id, role')
      .eq('id', callerId)
      .maybeSingle();

    if (callerAdminError) {
      return jsonResponse({ error: callerAdminError.message }, 500);
    }

    if (!callerAdmin) {
      return jsonResponse({ error: 'Acesso negado' }, 403);
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return jsonResponse({ error: 'Corpo da requisição inválido' }, 400);
    }

    const parsedBody = CreateAdminSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return jsonResponse(
        {
          error: 'Dados inválidos',
          details: parsedBody.error.flatten().fieldErrors,
        },
        400,
      );
    }

    const nome = parsedBody.data.nome.trim();
    const email = parsedBody.data.email.trim().toLowerCase();
    const senha = parsedBody.data.senha;

    const { data: existingAdmin, error: existingAdminError } = await adminClient
      .from('admins')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingAdminError) {
      return jsonResponse({ error: existingAdminError.message }, 500);
    }

    if (existingAdmin) {
      return jsonResponse({ error: 'Este email já está cadastrado como administrador' }, 400);
    }

    const { data: listedUsers, error: listUsersError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listUsersError) {
      return jsonResponse({ error: listUsersError.message }, 500);
    }

    const existingAuthUser = (listedUsers?.users ?? []).find(
      (user) => user.email?.trim().toLowerCase() === email,
    );

    let userId = existingAuthUser?.id;
    let createdAuthUser = false;

    if (existingAuthUser) {
      // Use REST API directly to update user — avoids SDK version inconsistencies
      const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${existingAuthUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey!,
        },
        body: JSON.stringify({ password: senha, email_confirm: true }),
      });

      if (!updateRes.ok) {
        const errBody = await updateRes.text();
        return jsonResponse({ error: `Erro ao atualizar usuário: ${errBody}` }, 400);
      }
      }
    } else {
      const { data: createdUserData, error: createUserError } = await adminClient.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      });

      if (createUserError || !createdUserData.user) {
        return jsonResponse({ error: createUserError?.message ?? 'Erro ao criar usuário' }, 400);
      }

      userId = createdUserData.user.id;
      createdAuthUser = true;
    }

    if (!userId) {
      return jsonResponse({ error: 'Usuário inválido' }, 500);
    }

    const { error: insertAdminError } = await adminClient.from('admins').insert({
      id: userId,
      email,
      nome,
      role: 'admin',
    });

    if (insertAdminError) {
      if (createdAuthUser) {
        await adminClient.auth.admin.deleteUser(userId);
      }

      return jsonResponse({ error: insertAdminError.message }, 500);
    }

    return jsonResponse({ id: userId, email, nome }, 200);
  } catch (error: unknown) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      500,
    );
  }
});
