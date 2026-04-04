import React from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, GraduationCap, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/authStore';
import { motion, AnimatePresence } from 'motion/react';

type View = 'login' | 'forgot' | 'reset';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loginAdmin } = useAuthStore();
  const [view, setView] = React.useState<View>(() => {
    if (searchParams.get('token') && searchParams.get('email')) return 'reset';
    return 'login';
  });
  const [email, setEmail] = React.useState(() => localStorage.getItem('admin_remembered_email') || '');
  const [password, setPassword] = React.useState(() => localStorage.getItem('admin_remembered_pw') || '');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(() => !!localStorage.getItem('admin_remembered_email'));

  // Forgot password state
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotError, setForgotError] = React.useState('');
  const [forgotSuccess, setForgotSuccess] = React.useState(false);

  // Reset password state
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [resetError, setResetError] = React.useState('');
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos');
      return;
    }
    setIsLoading(true);
    setError('');
    
    try {
      const data = await api.login({ email: email.trim(), password });
      if (remember) {
        localStorage.setItem('admin_remembered_email', email.trim());
        localStorage.setItem('admin_remembered_pw', password);
      } else {
        localStorage.removeItem('admin_remembered_email');
        localStorage.removeItem('admin_remembered_pw');
      }
      loginAdmin(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Informe seu e-mail');
      return;
    }
    setIsLoading(true);
    setForgotError('');
    try {
      await api.post('/admin/forgot-password', { email: forgotEmail.trim() });
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err.message || 'Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setResetError('Preencha todos os campos');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('As senhas não coincidem');
      return;
    }
    setIsLoading(true);
    setResetError('');
    try {
      const emailParam = searchParams.get('email') || forgotEmail.trim();
      const tokenParam = searchParams.get('token');
      
      await api.post('/admin/reset-password', { 
        email: emailParam, 
        token: tokenParam,
        new_password: newPassword 
      });
      setResetSuccess(true);
      setTimeout(() => {
        setView('login');
        setEmail(forgotEmail.trim());
        setPassword('');
        setResetSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        setForgotEmail('');
        setForgotSuccess(false);
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  const goToForgot = () => {
    setForgotEmail(email);
    setForgotError('');
    setForgotSuccess(false);
    setView('forgot');
  };

  const inputClass = "block w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:bg-surface-container-high transition-all outline-none font-medium";

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F8B8D 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="w-full max-w-[440px] flex flex-col gap-8">
        <div className="bg-surface-container p-10 rounded-[24px] shadow-2xl border border-outline transition-all duration-500 hover:shadow-primary/5">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <header className="mb-8">
                  <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Bem-vindo de volta</h1>
                  <p className="text-on-surface-variant text-sm mt-1 font-medium">Insira suas credenciais para acessar o painel.</p>
                </header>
                <form className="space-y-6" onSubmit={handleLogin}>
                  {error && (
                    <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-3 text-error text-sm font-medium animate-in fade-in slide-in-from-top-2" role="alert">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">E-mail Corporativo</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input id="email" className={inputClass} placeholder="nome@empresa.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Senha</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input id="password" className={inputClass + " !pr-12"} placeholder="••••••••" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                      <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-on-surface transition-colors" type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded border-outline text-primary focus:ring-primary/20 accent-primary cursor-pointer" />
                      <label htmlFor="remember" className="text-xs text-on-surface-variant font-medium cursor-pointer select-none">Lembrar senha</label>
                    </div>
                    <button type="button" onClick={goToForgot} className="text-xs text-primary font-bold hover:underline transition-all">
                      Esqueci a senha
                    </button>
                  </div>
                  <div className="pt-2">
                    <button className="w-full btn-primary py-4 px-4 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={isLoading}>
                      {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Autenticando...</span></>) : (<><span>Entrar no Sistema</span><LogIn className="w-4 h-4" /></>)}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {view === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <button type="button" onClick={() => setView('login')} className="flex items-center gap-2 text-xs text-on-surface-variant font-bold hover:text-primary transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4" /> Voltar ao login
                </button>
                <header className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Esqueceu a senha?</h1>
                  <p className="text-on-surface-variant text-sm mt-1 font-medium">Informe seu e-mail para verificar sua conta e redefinir a senha.</p>
                </header>

                {forgotSuccess ? (
                  <div className="text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Mail className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-on-surface font-bold">E-mail enviado!</p>
                    <p className="text-on-surface-variant text-sm">Verifique sua caixa de entrada para redefinir sua senha.</p>
                    <button onClick={() => setView('login')} className="w-full btn-primary py-3.5 text-sm mt-4">
                      Voltar ao Login
                    </button>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleForgotSubmit}>
                    {forgotError && (
                      <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-3 text-error text-sm font-medium">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{forgotError}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">E-mail</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input className={inputClass} placeholder="nome@empresa.com" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                      </div>
                    </div>
                    <button className="w-full btn-primary py-4 text-sm disabled:opacity-50" type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verificar conta'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {view === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <button type="button" onClick={() => setView('forgot')} className="flex items-center gap-2 text-xs text-on-surface-variant font-bold hover:text-primary transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <header className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Nova senha</h1>
                  <p className="text-on-surface-variant text-sm mt-1 font-medium">Defina uma nova senha para sua conta.</p>
                </header>

                {resetSuccess ? (
                  <div className="text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-on-surface font-bold">Senha redefinida!</p>
                    <p className="text-on-surface-variant text-sm">Redirecionando para o login...</p>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleResetSubmit}>
                    {resetError && (
                      <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-3 text-error text-sm font-medium">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{resetError}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nova Senha</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input className={inputClass + " !pr-12"} placeholder="Mínimo 6 caracteres" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-on-surface transition-colors" type="button" onClick={() => setShowNewPassword(!showNewPassword)}>
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Confirmar Senha</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input className={inputClass} placeholder="Repita a nova senha" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                      </div>
                    </div>
                    <button className="w-full btn-primary py-4 text-sm disabled:opacity-50" type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Redefinir Senha'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        <footer className="flex flex-col items-center gap-6">
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#">Termos</a>
            <a className="hover:text-primary transition-colors" href="#">Privacidade</a>
            <a className="hover:text-primary transition-colors" href="#">Suporte</a>
          </div>
        </footer>
      </div>
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-[#06B6D4] to-primary-container opacity-40"></div>
    </div>
  );
}
