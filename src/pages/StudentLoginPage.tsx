import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, KeyRound, User, Phone, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { phoneMask } from '../lib/masks';
import { useAuthStore } from '../lib/authStore';
import { useTheme } from '../lib/ThemeContext';
import { api } from '../lib/api';
import livroDark from '../assets/livro_logo_dark.png';
import livroWhite from '../assets/livro_logo_white.png';

type Tab = 'login' | 'register';

export function StudentLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loginStudent } = useAuthStore();
  const { theme } = useTheme();
  const redirectUrl = searchParams.get('redirect') || '/student/dashboard';
  const [tab, setTab] = React.useState<Tab>('login');

  // Login state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [unconfirmedEmail, setUnconfirmedEmail] = React.useState<string | null>(null);
  const [resending, setResending] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotSent, setForgotSent] = React.useState(false);


  // Register state
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPhone, setRegPhone] = React.useState('');
  const [regCpf, setRegCpf] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regConfirmPassword, setRegConfirmPassword] = React.useState('');
  const [showRegPassword, setShowRegPassword] = React.useState(false);
  const [regError, setRegError] = React.useState('');
  const [regSuccess, setRegSuccess] = React.useState(false);

  // Load saved credentials
  React.useEffect(() => {
    const saved = localStorage.getItem('student_remembered');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEmail(parsed.email || '');
        setPassword(parsed.password || '');
        setRememberMe(true);
      } catch {}
    }
  }, []);

  // Auto-login if already authenticated
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(redirectUrl, { replace: true });
      }
    }
  }, [user, navigate, redirectUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnconfirmedEmail(null);
    setResendSuccess(false);

    try {
      const data = await api.post('/student/login', { email, senha: password });

      loginStudent({
        nome: data.student.nome,
        email: data.student.email,
        telefone: data.student.telefone || '',
        cpf: data.student.cpf || ''
      });

      if (rememberMe) {
        localStorage.setItem('student_remembered', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('student_remembered');
      }

      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      if (err.unconfirmed) {
        setUnconfirmedEmail(err.email);
        setError('Seu e-mail ainda não foi confirmado.');
      } else {
        setError(err.message || 'Email ou senha inválidos.');
      }
    }
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail || resending) return;
    setResending(true);
    setError('');
    
    try {
      await api.post('/student/resend-confirmation', { email: unconfirmedEmail });
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar e-mail.');
    } finally {
      setResending(false);
    }
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas não coincidem.');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    try {
      await api.post('/student/register', {
        nome: regName,
        email: regEmail,
        telefone: regPhone,
        senha: regPassword,
        cpf: regCpf
      });

      setRegSuccess(true);

      setTimeout(() => {
        setEmail(regEmail);
        setPassword(regPassword);
        setTab('login');
        setRegSuccess(false);
        setRegName(''); setRegEmail(''); setRegPhone(''); setRegCpf(''); setRegPassword(''); setRegConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      setRegError(err.message || 'Erro ao cadastrar. Tente novamente.');
    }
  };

  const [forgotLoading, setForgotLoading] = React.useState(false);
  const [forgotError, setForgotError] = React.useState('');
  
  // Reset password state (student)
  const [showResetPassword, setShowResetPassword] = React.useState(false);
  const [resetNewPassword, setResetNewPassword] = React.useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = React.useState('');
  const [resetError, setResetError] = React.useState('');
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [showResetPw, setShowResetPw] = React.useState(false);

  // Check URL for reset params
  React.useEffect(() => {
    if (searchParams.get('reset') === 'true' && searchParams.get('token') && searchParams.get('email')) {
      setShowResetPassword(true);
    }
  }, [searchParams]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Informe seu e-mail');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/student/forgot-password', { email: forgotEmail.trim() });
      setForgotSent(true);
    } catch (err: any) {
      setForgotError(err.message || 'Erro ao processar solicitação');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetNewPassword || !resetConfirmPassword) {
      setResetError('Preencha todos os campos');
      return;
    }
    if (resetNewPassword.length < 6) {
      setResetError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('As senhas não coincidem');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      const emailParam = searchParams.get('email') || '';
      const tokenParam = searchParams.get('token') || '';
      await api.post('/student/reset-password', {
        email: emailParam,
        token: tokenParam,
        new_password: resetNewPassword,
      });
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetPassword(false);
        setResetSuccess(false);
        setResetNewPassword('');
        setResetConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || 'Erro ao redefinir senha');
    } finally {
      setResetLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none";
  const inputPasswordClass = "w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none";
  const labelClass = "block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors";

  // Reset password view (student)
  if (showResetPassword) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-surface-container p-8 sm:p-10 rounded-3xl shadow-2xl shadow-primary/5 border border-outline relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-on-surface font-headline tracking-tight">Nova Senha</h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">Defina uma nova senha para sua conta.</p>
          </div>

          {resetSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <p className="text-on-surface font-bold">Senha redefinida!</p>
              <p className="text-on-surface-variant text-sm">Redirecionando para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {resetError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                  <p>{resetError}</p>
                </motion.div>
              )}
              <div className="space-y-2">
                <label className={labelClass}>Nova Senha</label>
                <div className="relative group">
                  <Lock className={iconClass} />
                  <input className={inputPasswordClass} placeholder="Mínimo 6 caracteres" type={showResetPw ? 'text' : 'password'} value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowResetPw(!showResetPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors">
                    {showResetPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Confirmar Senha</label>
                <div className="relative group">
                  <Lock className={iconClass} />
                  <input className={inputClass} placeholder="Repita a nova senha" type="password" value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50" disabled={resetLoading}>
                {resetLoading ? 'Redefinindo...' : 'Redefinir Senha'}
              </button>
              <button type="button" onClick={() => setShowResetPassword(false)} className="w-full text-center text-sm text-primary font-bold hover:underline">
                Voltar ao Login
              </button>
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
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-surface-container p-8 sm:p-10 rounded-3xl shadow-2xl shadow-primary/5 border border-outline relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-on-surface font-headline tracking-tight">Recuperar Senha</h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              {forgotSent ? 'Solicitação enviada!' : 'Insira seu e-mail para recuperar a senha.'}
            </p>
          </div>

          {forgotSent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-on-surface-variant">
                Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada e spam.
              </p>
              <button
                onClick={() => { setShowForgotPassword(false); setForgotSent(false); setForgotError(''); }}
                className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm"
              >
                Voltar ao Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {forgotError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                  <p>{forgotError}</p>
                </motion.div>
              )}
              <div className="space-y-2">
                <label className={labelClass}>E-mail</label>
                <div className="relative group">
                  <Mail className={iconClass} />
                  <input className={inputClass} placeholder="seu@email.com" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50" disabled={forgotLoading}>
                {forgotLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
              <button type="button" onClick={() => { setShowForgotPassword(false); setForgotError(''); }} className="w-full text-center text-sm text-primary font-bold hover:underline">Voltar ao Login</button>
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
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F8B8D 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-surface-container p-8 sm:p-10 rounded-3xl shadow-2xl shadow-primary/5 border border-outline relative z-10"
      >
        <div className="text-center mb-6">
          <img src={theme === 'dark' ? livroWhite : livroDark} alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-black text-on-surface font-headline tracking-tight">Painel do Aluno</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Acesse seus resultados e provas</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-container-low rounded-xl p-1 mb-6 border border-outline">
          <button
            onClick={() => { setTab('login'); setError(''); setRegError(''); }}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2",
              tab === 'login'
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Entrar
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); setRegError(''); }}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2",
              tab === 'register'
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Cadastrar
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' ?
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className={labelClass}>E-mail</label>
                <div className="relative group">
                  <Mail className={iconClass} />
                  <input className={inputClass} placeholder="seu@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Senha</label>
                <div className="relative group">
                  <Lock className={iconClass} />
                  <input className={inputPasswordClass} placeholder="Sua senha" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-outline text-primary focus:ring-primary/20 bg-surface-container-low" />
                  <span className="text-xs font-semibold text-on-surface-variant">Lembrar-me</span>
                </label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs font-bold text-primary hover:underline underline-offset-4">
                  Esqueci a senha
                </button>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3 space-y-2">
                  <p>{error}</p>
                  {unconfirmedEmail && !resendSuccess && (
                    <button 
                      type="button" 
                      onClick={handleResendConfirmation} 
                      disabled={resending}
                      className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1"
                    >
                      {resending ? 'Enviando...' : 'Reenviar e-mail de confirmação'}
                    </button>
                  )}
                  {resendSuccess && (
                    <p className="text-xs text-primary font-bold">E-mail reenviado com sucesso!</p>
                  )}
                </motion.div>
              )}


              <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 group">
                <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Entrar
              </button>
            </motion.form>
          :
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              {regSuccess ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-lg font-black text-on-surface font-headline">Cadastro realizado!</p>
                  <p className="text-sm text-on-surface-variant">Um e-mail de confirmação foi enviado. Por favor, confirme seu cadastro para acessar a plataforma.</p>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className={labelClass}>Nome Completo</label>
                    <div className="relative group">
                      <User className={iconClass} />
                      <input className={inputClass} placeholder="Seu nome completo" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>E-mail</label>
                    <div className="relative group">
                      <Mail className={iconClass} />
                      <input className={inputClass} placeholder="seu@email.com" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Telefone / WhatsApp</label>
                    <div className="relative group">
                      <Phone className={iconClass} />
                      <input className={inputClass} placeholder="(00) 00000-0000" type="tel" value={regPhone} onChange={(e) => setRegPhone(phoneMask(e.target.value))} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>CPF</label>
                    <div className="relative group">
                      <User className={iconClass} />
                      <input className={inputClass} placeholder="000.000.000-00" type="text" value={regCpf} onChange={(e) => setRegCpf(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Senha</label>
                    <div className="relative group">
                      <Lock className={iconClass} />
                      <input className={inputPasswordClass} placeholder="Crie uma senha" type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors">
                        {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Confirmar Senha</label>
                    <div className="relative group">
                      <Lock className={iconClass} />
                      <input className={inputClass} placeholder="Repita a senha" type={showRegPassword ? 'text' : 'password'} value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required />
                    </div>
                  </div>

                  {regError && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-error font-bold bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                      {regError}
                    </motion.p>
                  )}

                  <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 group mt-2">
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Criar Conta
                  </button>
                </>
              )}
            </motion.form>
          }
        </AnimatePresence>

        <p className="mt-8 text-center text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">
          Eduvix © {new Date().getFullYear()} • Todos os direitos reservados
        </p>
      </motion.div>
    </div>
  );
}
