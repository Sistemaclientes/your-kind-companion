import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, KeyRound, User, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../lib/authStore';
import { useTheme } from '../lib/ThemeContext';
import { authService } from '../services/auth.service';
import livroDark from '../assets/livro_logo_dark.png';
import livroWhite from '../assets/livro_logo_white.png';

type Tab = 'login' | 'register';

export function StudentLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loginStudent } = useAuthStore();
  const { theme } = useTheme();
  const redirectUrl = searchParams.get('redirect') || '/student/dashboard';
  const cursoParam = searchParams.get('curso')?.trim().toLowerCase() || null;
  const [tab, setTab] = React.useState<Tab>(cursoParam ? 'register' : 'login');

  // Login state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotSent, setForgotSent] = React.useState(false);
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const [forgotError, setForgotError] = React.useState('');

  // Register state
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regConfirmPassword, setRegConfirmPassword] = React.useState('');
  const [showRegPassword, setShowRegPassword] = React.useState(false);
  const [regError, setRegError] = React.useState('');
  const [regSuccess, setRegSuccess] = React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState('');

  // Reset password state
  const [showResetPassword, setShowResetPassword] = React.useState(false);
  const [resetNewPassword, setResetNewPassword] = React.useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = React.useState('');
  const [resetError, setResetError] = React.useState('');
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [showResetPw, setShowResetPw] = React.useState(false);

  // Check for recovery hash
  React.useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      setShowResetPassword(true);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate(redirectUrl, { replace: true });
    }
  }, [user, navigate, redirectUrl]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [timeoutError, setTimeoutError] = React.useState('');

  // Auth timeout: show error after 10 seconds
  React.useEffect(() => {
    if (!isLoading) { setTimeoutError(''); return; }
    const timer = setTimeout(() => {
      setTimeoutError('A autenticação está demorando mais que o esperado. Verifique sua conexão e tente novamente.');
      setIsLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      const { user: authUser, aluno } = await authService.loginStudent(email, password);
      loginStudent(authUser, aluno);
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      console.error('[StudentLogin] Login error:', err);
      setError(err.message || 'Email ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setRegError('');
    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas não coincidem.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await authService.registerStudent({ nome: regName, email: regEmail, password: regPassword, curso: cursoParam || undefined });
      if (result.autoLogin && result.user && result.aluno) {
        // Auto-login succeeded — go straight to dashboard
        loginStudent(result.user, result.aluno);
        navigate(redirectUrl, { replace: true });
      } else {
        // Fallback: account created but auto-login failed
        setRegSuccess(true);
        setRegisteredEmail(regEmail);
        setRegName(''); setRegEmail(''); setRegPassword(''); setRegConfirmPassword('');
      }
    } catch (err: any) {
      console.error('[StudentLogin] Register error:', err);
      setRegError(err.message || 'Erro ao cadastrar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setForgotError('Informe seu e-mail'); return; }
    setForgotLoading(true);
    setForgotError('');
    try {
      await authService.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      setForgotError(err.message || 'Erro');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetNewPassword || !resetConfirmPassword) { setResetError('Preencha todos os campos'); return; }
    if (resetNewPassword.length < 6) { setResetError('Mínimo 6 caracteres'); return; }
    if (resetNewPassword !== resetConfirmPassword) { setResetError('Senhas não coincidem'); return; }
    setResetLoading(true);
    setResetError('');
    try {
      await authService.updatePassword(resetNewPassword);
      setResetSuccess(true);
      setTimeout(() => { setShowResetPassword(false); setResetSuccess(false); }, 2000);
    } catch (err: any) {
      setResetError(err.message || 'Erro');
    } finally {
      setResetLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none";
  const inputPasswordClass = "w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none";
  const labelClass = "block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors";

  // Reset password view
  if (showResetPassword) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[100px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-surface-container p-8 sm:p-10 rounded-3xl shadow-2xl border border-outline relative z-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Lock className="w-7 h-7 text-primary" /></div>
            <h1 className="text-2xl font-black text-on-surface font-headline tracking-tight">Nova Senha</h1>
          </div>
          {resetSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><ShieldCheck className="w-7 h-7 text-primary" /></div>
              <p className="text-on-surface font-bold">Senha redefinida!</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {resetError && <p className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3">{resetError}</p>}
              <div className="space-y-2">
                <label className={labelClass}>Nova Senha</label>
                <div className="relative group">
                  <Lock className={iconClass} />
                  <input className={inputPasswordClass} placeholder="Mínimo 6 caracteres" type={showResetPw ? 'text' : 'password'} value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowResetPw(!showResetPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary">
                    {showResetPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Confirmar Senha</label>
                <div className="relative group"><Lock className={iconClass} /><input className={inputClass} type="password" value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} required /></div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50" disabled={resetLoading}>{resetLoading ? 'Redefinindo...' : 'Redefinir Senha'}</button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  // Forgot password view
  if (showForgotPassword) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-surface-container p-8 sm:p-10 rounded-3xl shadow-2xl border border-outline relative z-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><KeyRound className="w-7 h-7 text-primary" /></div>
            <h1 className="text-2xl font-black text-on-surface font-headline tracking-tight">Recuperar Senha</h1>
          </div>
          {forgotSent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-on-surface-variant">Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.</p>
              <button onClick={() => { setShowForgotPassword(false); setForgotSent(false); }} className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">Voltar ao Login</button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {forgotError && <p className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3">{forgotError}</p>}
              <div className="space-y-2">
                <label className={labelClass}>E-mail</label>
                <div className="relative group"><Mail className={iconClass} /><input className={inputClass} placeholder="seu@email.com" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required /></div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50" disabled={forgotLoading}>{forgotLoading ? 'Enviando...' : 'Enviar Link'}</button>
              <button type="button" onClick={() => setShowForgotPassword(false)} className="w-full text-center text-sm text-primary font-bold hover:underline">Voltar ao Login</button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-surface-container p-8 sm:p-10 rounded-3xl shadow-2xl border border-outline relative z-10">
        <div className="text-center mb-6">
          <img src={theme === 'dark' ? livroWhite : livroDark} alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-black text-on-surface font-headline tracking-tight">Painel do Aluno</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Acesse seus resultados e provas</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-container-low rounded-xl p-1 mb-6 border border-outline">
          <button onClick={() => { setTab('login'); setError(''); setRegError(''); }} className={cn("flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2", tab === 'login' ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface")}>
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Entrar
          </button>
          <button onClick={() => { setTab('register'); setError(''); setRegError(''); }} className={cn("flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2", tab === 'register' ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface")}>
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Cadastrar
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className={labelClass}>E-mail</label>
                <div className="relative group"><Mail className={iconClass} /><input className={inputClass} placeholder="seu@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Senha</label>
                <div className="relative group">
                  <Lock className={iconClass} />
                  <input className={inputPasswordClass} placeholder="Sua senha" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs font-bold text-primary hover:underline">Esqueci a senha</button>
              </div>
              {(error || timeoutError) && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error || timeoutError}</motion.p>}
              <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>{isLoading ? 'Entrando...' : <><LogIn className="w-5 h-5" /> Entrar</>}</button>
            </motion.form>
          ) : (
            <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleRegister} className="space-y-4">
              {regSuccess ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto"><ShieldCheck className="w-7 h-7 text-primary" /></div>
                  <p className="text-lg font-black text-on-surface font-headline">Cadastro realizado!</p>
                  <p className="text-sm text-on-surface-variant font-medium">Sua conta foi criada. Faça login para continuar.</p>
                  <button type="button" onClick={() => { setTab('login'); setRegSuccess(false); setEmail(registeredEmail); }} className="btn-primary w-full py-3.5 rounded-xl font-bold mt-4">Ir para Login</button>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className={labelClass}>Nome Completo</label>
                    <div className="relative group"><User className={iconClass} /><input className={inputClass} placeholder="Seu nome" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required /></div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>E-mail</label>
                    <div className="relative group"><Mail className={iconClass} /><input className={inputClass} placeholder="seu@email.com" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required /></div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Senha</label>
                    <div className="relative group">
                      <Lock className={iconClass} />
                      <input className={inputPasswordClass} placeholder="Mínimo 6 caracteres" type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary">
                        {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Confirmar Senha</label>
                    <div className="relative group"><Lock className={iconClass} /><input className={inputClass} placeholder="Repita a senha" type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required /></div>
                  </div>
                  {regError && <p className="text-xs text-error font-bold bg-error/10 border border-error/20 rounded-xl px-4 py-3">{regError}</p>}
                  <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>{isLoading ? 'Cadastrando...' : <><UserPlus className="w-5 h-5" /> Criar Conta</>}</button>
                </>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-8 text-center text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">
          Eduvix © {new Date().getFullYear()} • Todos os direitos reservados
        </p>
      </motion.div>
    </div>
  );
}

export default StudentLoginPage;
