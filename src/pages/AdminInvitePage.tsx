import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/lib/authStore';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  XCircle,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
} from 'lucide-react';

type InviteStatus = 'loading' | 'valid' | 'invalid' | 'accepting' | 'success';
type AuthMode = 'login' | 'register';

export function AdminInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkSession } = useAuthStore();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<InviteStatus>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');

  // Auth form state
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log("[AdminInvite] Token recebido:", token);
  }, [token]);

  // Fix route duplication if present
  useEffect(() => {
    if (location.pathname.includes('/convite-admin/convite-admin')) {
      console.log("[AdminInvite] URL duplicada detectada, corrigindo...");
      const cleanPath = location.pathname.replace('/convite-admin/convite-admin', '/convite-admin');
      navigate(`${cleanPath}${location.search}`, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setErrorMsg('Token não fornecido');
      return;
    }

    (async () => {
      console.log("[AdminInvite] Validando token...");
      const { data, error } = await supabase.rpc('validar_convite_admin', {
        p_token: token,
      });

      if (error || !data) {
        console.error("[AdminInvite] Erro na validação RPC:", error);
        setStatus('invalid');
        setErrorMsg('Erro ao validar convite');
        return;
      }

      const result = data as { valid: boolean; error?: string; email?: string; role?: string };

      if (!result.valid) {
        console.log("[AdminInvite] Token inválido:", result.error);
        setStatus('invalid');
        setErrorMsg(result.error || 'Convite inválido');
        return;
      }

      console.log("[AdminInvite] Token válido para:", result.email);
      setInviteEmail(result.email || '');
      setInviteRole(result.role || 'admin');
      setEmail(result.email || '');
      setStatus('valid');
    })();
  }, [token]);

  // Watch user state change to accept invite
  useEffect(() => {
    if (user && status === 'valid') {
      console.log("[AdminInvite] Usuário autenticado pelo store e convite válido. Aceitando...");
      acceptInvite();
    }
  }, [user, status, token]);

  const acceptInvite = async () => {
    // Evitar chamadas múltiplas
    if (status === 'accepting' || status === 'success') return;

    setStatus('accepting');
    try {
      console.log("[AdminInvite] Chamando RPC aceitar_convite_admin...");
      const { data, error } = await supabase.rpc('aceitar_convite_admin', {
        p_token: token,
      });

      if (error) {
        console.error("[AdminInvite] Erro ao aceitar:", error);
        setStatus('valid');
        setAuthError(error.message);
        return;
      }

      const result = data as { success: boolean; role?: string };

      if (result?.success) {
        console.log("[AdminInvite] Convite aceito com sucesso!");
        setStatus('success');
        // Refresh session to pick up admin role
        await checkSession();
        setTimeout(() => navigate('/admin/dashboard', { replace: true }), 2000);
      } else {
        console.log("[AdminInvite] Falha ao aceitar convite.");
        setStatus('valid');
        setAuthError('Erro ao aceitar convite');
      }
    } catch (err: any) {
      console.error("[AdminInvite] Erro inesperado:", err);
      setStatus('valid');
      setAuthError(err.message || 'Erro inesperado');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        if (!signUpData.user) throw new Error('Erro ao criar conta');

        // If email confirmation is required, user won't have a session yet
        if (!signUpData.session) {
          setAuthError(
            'Conta criada! Verifique seu e-mail para confirmar e depois retorne a este link.'
          );
          setAuthLoading(false);
          return;
        }
      }
      
      // onAuthStateChange will trigger acceptInvite()
      setAuthLoading(false);
    } catch (err: any) {
      setAuthError(err.message || 'Erro na autenticação');
      setAuthLoading(false);
    }
  };

  const inputClass =
    'block w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:bg-surface-container-high transition-all outline-none font-medium';

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-on-surface-variant font-bold text-sm">Validando convite...</p>
        </motion.div>
      </div>
    );
  }

  // Invalid/expired
  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-surface-container p-8 rounded-3xl shadow-2xl border border-outline text-center space-y-6"
        >
          <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-2xl font-black text-on-surface">Convite Inválido</h1>
          <p className="text-on-surface-variant font-medium">{errorMsg}</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="btn-primary w-full py-3.5 rounded-xl font-bold"
          >
            Ir para Login
          </button>
        </motion.div>
      </div>
    );
  }

  // Accepting
  if (status === 'accepting') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-on-surface-variant font-bold text-sm">Ativando seu acesso...</p>
        </motion.div>
      </div>
    );
  }

  // Success
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-surface-container p-8 rounded-3xl shadow-2xl border border-outline text-center space-y-6"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-on-surface">Bem-vindo, Admin!</h1>
          <p className="text-on-surface-variant font-medium">
            Seu acesso como <span className="font-bold text-primary">{inviteRole}</span> foi ativado.
            Redirecionando...
          </p>
        </motion.div>
      </div>
    );
  }

  // Valid — show auth form
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-container p-8 rounded-3xl shadow-2xl border border-outline space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-on-surface">Convite de Administrador</h1>
          <p className="text-on-surface-variant text-sm font-medium">
            Você foi convidado como <span className="font-bold text-primary">{inviteRole}</span> para{' '}
            <span className="font-bold">{inviteEmail}</span>
          </p>
        </div>

        {/* Auth mode toggle */}
        <div className="flex bg-surface-container-low rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setAuthError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              authMode === 'login'
                ? 'bg-primary text-on-primary shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setAuthError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              authMode === 'register'
                ? 'bg-primary text-on-primary shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Cadastrar
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authError && (
            <div className="bg-error/10 border border-error/20 p-3 rounded-xl text-error text-sm font-medium">
              {authError}
            </div>
          )}

          <div className="space-y-2">
            <label className="block font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              E-mail
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                className={inputClass + ' !pr-12'}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authMode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                required
              />
              <button
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full btn-primary py-4 text-sm font-bold disabled:opacity-50"
          >
            {authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : authMode === 'login' ? (
              'Entrar e Aceitar Convite'
            ) : (
              'Criar Conta e Aceitar'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default AdminInvitePage;
