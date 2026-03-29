import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import { cn } from '../lib/utils';

export function StudentLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotSent, setForgotSent] = React.useState(false);

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

  // Auto-login if student_info exists and was remembered
  React.useEffect(() => {
    const info = localStorage.getItem('student_info');
    const remembered = localStorage.getItem('student_remembered');
    if (info && remembered) {
      navigate('/aluno/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check registered students
    const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const student = registeredStudents.find((s: any) => s.email === email);

    if (!student) {
      setError('E-mail não encontrado. Faça uma prova primeiro para se cadastrar.');
      return;
    }

    if (student.password && student.password !== password) {
      setError('Senha incorreta. Tente novamente.');
      return;
    }

    // Save student info for the panel
    localStorage.setItem('student_info', JSON.stringify({
      nome: student.nome,
      email: student.email,
      telefone: student.telefone || ''
    }));

    // Remember me
    if (rememberMe) {
      localStorage.setItem('student_remembered', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('student_remembered');
    }

    navigate('/aluno/dashboard', { replace: true });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const student = registeredStudents.find((s: any) => s.email === forgotEmail);
    
    if (student) {
      // Reset password
      student.password = '';
      localStorage.setItem('registered_students', JSON.stringify(registeredStudents));
    }
    setForgotSent(true);
  };

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
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="seu@email.com"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">
                Resetar Senha
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-center text-sm text-primary font-bold hover:underline"
              >
                Voltar ao Login
              </button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
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
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-on-surface font-headline tracking-tight">Painel do Aluno</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Acesse seus resultados e provas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                placeholder="seu@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
              <input
                className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                placeholder="Sua senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-outline text-primary focus:ring-primary/20 bg-surface-container-low"
              />
              <span className="text-xs font-semibold text-on-surface-variant">Lembrar-me</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs font-bold text-primary hover:underline underline-offset-4"
            >
              Esqueci a senha
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full btn-primary py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 group"
          >
            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Entrar
          </button>
        </form>

        <p className="text-center text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-6">
          Acesso exclusivo para alunos cadastrados
        </p>
      </motion.div>
    </div>
  );
}

export default StudentLoginPage;
