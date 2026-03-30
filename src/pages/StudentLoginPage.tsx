import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, KeyRound, User, Phone, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { phoneMask } from '../lib/masks';
import { useAuthStore } from '../lib/authStore';
import { api } from '../lib/api';

type Tab = 'login' | 'register';

export function StudentLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loginStudent } = useAuthStore();
  const redirectUrl = searchParams.get('redirect') || '/aluno/dashboard';
  const [tab, setTab] = React.useState<Tab>('login');

  // Login state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotSent, setForgotSent] = React.useState(false);

  // Register state
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPhone, setRegPhone] = React.useState('');
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const student = registeredStudents.find((s: any) => s.email === email);

    if (!student) {
      setError('E-mail não encontrado. Cadastre-se primeiro.');
      return;
    }

    if (student.password && student.password !== password) {
      setError('Senha incorreta. Tente novamente.');
      return;
    }

    loginStudent({
      nome: student.nome,
      email: student.email,
      telefone: student.telefone || ''
    });

    if (rememberMe) {
      localStorage.setItem('student_remembered', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('student_remembered');
    }

    navigate(redirectUrl, { replace: true });
  };

  const handleRegister = (e: React.FormEvent) => {
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

    const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const existing = registeredStudents.find((s: any) => s.email === regEmail);

    if (existing) {
      setRegError('Este e-mail já está cadastrado. Faça login.');
      return;
    }

    registeredStudents.push({
      nome: regName,
      email: regEmail,
      telefone: regPhone,
      password: regPassword
    });
    localStorage.setItem('registered_students', JSON.stringify(registeredStudents));
    setRegSuccess(true);

    setTimeout(() => {
      setEmail(regEmail);
      setPassword(regPassword);
      setTab('login');
      setRegSuccess(false);
      setRegName(''); setRegEmail(''); setRegPhone(''); setRegPassword(''); setRegConfirmPassword('');
    }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const student = registeredStudents.find((s: any) => s.email === forgotEmail);
    if (student) {
      student.password = '';
      localStorage.setItem('registered_students', JSON.stringify(registeredStudents));
    }
    setForgotSent(true);
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none";
  const inputPasswordClass = "w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none";
  const labelClass = "block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors";

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
              {forgotSent ? 'Sua senha foi resetada com sucesso.' : 'Insira seu e-mail para resetar a senha.'}
            </p>
          </div>

          {forgotSent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-on-surface-variant">
                Você pode fazer login novamente sem senha. Defina uma nova senha nas configurações do painel.
              </p>
              <button
                onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm"
              >
                Voltar ao Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <label className={labelClass}>E-mail</label>
                <div className="relative group">
                  <Mail className={iconClass} />
                  <input className={inputClass} placeholder="seu@email.com" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">Resetar Senha</button>
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
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F8B8D 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-surface-container p-8 sm:p-10 rounded-3xl shadow-2xl shadow-primary/5 border border-outline relative z-10"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-on-surface font-headline tracking-tight">Painel do Aluno</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Acesse seus resultados e provas</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-container-low rounded-xl p-1 mb-6 border border-outline">
          <button
            onClick={() => { setTab('login'); setError(''); setRegError(''); }}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
              tab === 'login'
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); setRegError(''); }}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
              tab === 'register'
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
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
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                  {error}
                </motion.p>
              )}

              <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 group">
                <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Entrar
              </button>
            </motion.form>
          ) : (
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
                  <p className="text-sm text-on-surface-variant">Redirecionando para o login...</p>
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
                      <input className={inputPasswordClass} placeholder="Repita a senha" type={showRegPassword ? 'text' : 'password'} value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required />
                    </div>
                  </div>

                  {regError && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                      {regError}
                    </motion.p>
                  )}

                  <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 group">
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Criar Conta
                  </button>
                </>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-6">
          Plataforma de avaliações online
        </p>
      </motion.div>
    </div>
  );
}

export default StudentLoginPage;
