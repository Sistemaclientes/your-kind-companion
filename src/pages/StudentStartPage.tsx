import React from 'react';
import { toast } from 'sonner';
import { Play, ShieldCheck, Clock, FileText, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/authStore';

export function StudentStartPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const examIdFromUrl = searchParams.get('examId');
  const [exams, setExams] = React.useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      navigate('/painel-do-aluno?redirect=' + encodeURIComponent(window.location.pathname + window.location.search), { replace: true });
      return;
    }
  }, [user, navigate]);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (examIdFromUrl) {
          const exam = await api.get(`/provas/${examIdFromUrl}`);
          setExams([exam]);
          setSelectedExamId(exam.id);
        } else {
          const data = await api.get('/provas');
          setExams(data);
          if (data.length > 0) setSelectedExamId(data[0].id);
        }
      } catch {
        setError('Erro ao carregar provas.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [examIdFromUrl, user]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) { toast.error('Selecione uma prova.'); return; }
    // Store examId in sessionStorage for the exam page
    sessionStorage.setItem('current_exam_id', selectedExamId);
    navigate('/student/exam');
  };

  const selectedExam = exams.find(e => e.id === selectedExamId);

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h1 className="text-2xl font-black text-on-surface font-headline">Erro</h1>
          <p className="text-on-surface-variant font-medium">{error}</p>
          <button onClick={() => navigate('/student/dashboard')} className="btn-primary px-8 py-3 rounded-xl font-bold text-sm">Voltar</button>
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
          <h1 className="text-2xl md:text-4xl font-black text-on-surface font-headline leading-tight">{selectedExam?.titulo || 'Carregando...'}</h1>
          <p className="text-on-surface-variant font-medium">{selectedExam?.descricao || ''}</p>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="card-saas !p-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText className="w-6 h-6" /></div>
              <div><p className="text-2xl font-black text-on-surface font-headline">{selectedExam?.perguntas?.length || 0}</p><p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Questões</p></div>
            </div>
            <div className="card-saas !p-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><Clock className="w-6 h-6" /></div>
              <div><p className="text-2xl font-black text-on-surface font-headline">60</p><p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Minutos</p></div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container p-5 sm:p-10 rounded-3xl shadow-2xl border border-outline order-1 lg:order-2">
          <header className="mb-8">
            <h3 className="text-2xl font-black text-on-surface font-headline">Olá, {user?.nome}!</h3>
            <p className="text-sm text-on-surface-variant font-medium">Pronto para iniciar a avaliação.</p>
          </header>

          <form className="space-y-6" onSubmit={handleStart}>
            {!examIdFromUrl && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Selecionar Prova</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
                  <select className="w-full pl-12 pr-10 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface font-semibold focus:border-primary outline-none appearance-none cursor-pointer" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)} required>
                    {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.titulo}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 pointer-events-none" />
                </div>
              </div>
            )}

            <button className="w-full btn-primary py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 group" type="submit">
              <Play className="w-5 h-5 fill-current" /> Iniciar Avaliação <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default StudentStartPage;
