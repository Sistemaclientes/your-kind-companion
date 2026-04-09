import React from 'react';
import { toast } from 'sonner';
import { Play, ShieldCheck, Clock, FileText, AlertCircle, ChevronRight, User } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/authStore';

export function StudentStartPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuthStore();

  const [exam, setExam] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [starting, setStarting] = React.useState(false);

  const autoStart = searchParams.get('start') === 'true';

  // Fetch exam publicly by slug or id
  React.useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const identifier = slug || searchParams.get('examId');
        if (!identifier) {
          setError('Prova não encontrada.');
          return;
        }
        const data = await api.get(`/provas/slug/${identifier}`).catch(() => api.get(`/provas/${identifier}`));
        if (!data || !data.id) {
          setError('Prova não encontrada.');
          return;
        }
        setExam(data);
      } catch {
        setError('Erro ao carregar prova.');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [slug, searchParams]);

  // Auto-start after login redirect
  React.useEffect(() => {
    if (autoStart && user && exam && !authLoading && !starting) {
      handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, user, exam, authLoading]);

  const handleStart = () => {
    if (!exam) return;
    if (starting) return;

    // If not logged in, redirect to login with return URL
    if (!user) {
      const currentPath = `/prova/${slug || exam.slug || exam.id}`;
      navigate(`/painel-do-aluno?redirect=${encodeURIComponent(currentPath + '?start=true')}`, { replace: true });
      return;
    }

    setStarting(true);
    // Store exam id and navigate to exam page
    sessionStorage.setItem('current_exam_id', exam.id);
    navigate('/student/exam');
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Carregando prova...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h1 className="text-2xl font-black text-on-surface font-headline">Erro</h1>
          <p className="text-on-surface-variant font-medium">{error || 'Prova não encontrada.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary px-8 py-3 rounded-xl font-bold text-sm">Voltar</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest border border-primary/20">
            <ShieldCheck className="w-4 h-4" /> Ambiente Seguro
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-on-surface font-headline leading-tight">{exam.titulo}</h1>
          <p className="text-on-surface-variant font-medium">{exam.descricao || ''}</p>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="card-saas !p-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText className="w-6 h-6" /></div>
              <div><p className="text-2xl font-black text-on-surface font-headline">{exam.perguntas?.length || 0}</p><p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Questões</p></div>
            </div>
            <div className="card-saas !p-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><Clock className="w-6 h-6" /></div>
              <div><p className="text-2xl font-black text-on-surface font-headline">{exam.duracao || 60}</p><p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Minutos</p></div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container p-5 sm:p-10 rounded-3xl shadow-2xl border border-outline order-1 lg:order-2">
          <header className="mb-8">
            {user ? (
              <>
                <h3 className="text-2xl font-black text-on-surface font-headline">Olá, {user.nome}!</h3>
                <p className="text-sm text-on-surface-variant font-medium">Pronto para iniciar a avaliação.</p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black text-on-surface font-headline">Iniciar Avaliação</h3>
                <p className="text-sm text-on-surface-variant font-medium">Faça login para começar a prova.</p>
              </>
            )}
          </header>

          <div className="space-y-6">
            <button
              className="w-full btn-primary py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 group disabled:opacity-50"
              onClick={handleStart}
              disabled={starting}
            >
              {starting ? (
                'Iniciando...'
              ) : user ? (
                <><Play className="w-5 h-5 fill-current" /> Iniciar Avaliação <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              ) : (
                <><User className="w-5 h-5" /> Entrar e Iniciar <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default StudentStartPage;
