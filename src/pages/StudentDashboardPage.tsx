import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Target, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { TopBar } from '../components/TopBar';
import { useAuthStore } from '../lib/authStore';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [results, setResults] = React.useState<any[]>([]);
  const [availableExams, setAvailableExams] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [resultsData, examsData] = await Promise.all([
          api.get('/resultados'),
          api.get('/provas')
        ]);
        setResults(resultsData);
        // Filter exams by user's curso if assigned
        const userCurso = user.curso;
        const filteredExams = userCurso 
          ? examsData.filter((exam: any) => exam.curso?.toLowerCase() === userCurso.toLowerCase())
          : examsData;
        const approvedExamIds = new Set(resultsData.filter((r: any) => r.pontuacao >= 70).map((r: any) => r.prova_id));
        setAvailableExams(filteredExams.filter((exam: any) => !approvedExamIds.has(exam.id)));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const totalExams = results.length;
  const avgScore = totalExams > 0 ? Math.round(results.reduce((s, r) => s + r.pontuacao, 0) / totalExams) : 0;

  return (
    <>
      <TopBar title={`Olá, ${user?.nome || 'Estudante'}`} subtitle={user?.email} />
      <div className="pt-24 px-4 sm:px-8 pb-12 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 mt-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 sm:h-32" />) : (
            <>
              <div className="card-saas !p-4 sm:!p-6 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><BookOpen className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Provas Feitas</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-on-surface font-headline tracking-tighter">{totalExams}</p>
              </div>
              <div className="card-saas !p-4 sm:!p-6 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Média Geral</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-on-surface font-headline tracking-tighter">{avgScore}%</p>
              </div>
              <div className="card-saas !p-4 sm:!p-6 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Target className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Provas Disponíveis</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-on-surface font-headline tracking-tighter">{availableExams.length}</p>
              </div>
              <div className="card-saas !p-4 sm:!p-6 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><Clock className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Última Prova</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-on-surface truncate">{results[0]?.prova_titulo || '—'}</p>
              </div>
            </>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {!loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-black text-on-surface font-headline tracking-tight mb-4">Provas Disponíveis</h2>
              <div className="space-y-3">
                {availableExams.length === 0 ? (
                  <div className="card-saas !p-6 text-center"><p className="text-sm text-on-surface-variant font-medium">Você concluiu todas as provas! 🎉</p></div>
                ) : availableExams.slice(0, 3).map((exam) => (
                  <div key={exam.id} onClick={() => navigate(`/student/start?examId=${exam.id}`)} className="card-saas !p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-high transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><BookOpen className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{exam.titulo}</p>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{exam.qCount} questões</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!loading && results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-lg font-black text-on-surface font-headline tracking-tight mb-4">Últimos Resultados</h2>
              <div className="space-y-3">
                {results.slice(0, 5).map((result) => {
                  const isApproved = result.pontuacao >= 70;
                  const dateStr = result.created_at ? new Date(result.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                  return (
                    <div key={result.id} onClick={() => navigate(`/student/resultado/${result.id}`)} className="card-saas !p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-high transition-colors">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-headline font-black text-lg", isApproved ? "bg-primary/10 text-primary" : "bg-error/10 text-error")}>
                        {result.pontuacao}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{result.prova_titulo}</p>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{dateStr}</span>
                      </div>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", isApproved ? "text-primary bg-primary/10 border-primary/20" : "text-error bg-error/10 border-error/20")}>
                        {isApproved ? 'Aprovado' : 'Reprovado'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default StudentDashboardPage;
