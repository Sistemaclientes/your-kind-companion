import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Trophy,
  Target,
  BookOpen,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { TopBar } from '../components/TopBar';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = React.useState<any>(null);
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const info = localStorage.getItem('student_info');
    if (!info) {
      navigate('/aluno/login');
      return;
    }
    const parsed = JSON.parse(info);
    setStudentInfo(parsed);

    const fetchData = async () => {
      try {
        const allResults = JSON.parse(localStorage.getItem('local_resultados') || '[]');
        const myResults = allResults.filter((r: any) => r.email_aluno === parsed.email);
        setResults(myResults);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const totalExams = results.length;
  const avgScore = totalExams > 0 ? Math.round(results.reduce((s, r) => s + r.pontuacao, 0) / totalExams) : 0;
  const totalCorrect = results.reduce((s, r) => s + (r.acertos || 0), 0);
  const totalQuestions = results.reduce((s, r) => s + (r.total || 0), 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const lastExam = results.length > 0 ? results[results.length - 1] : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <TopBar title={`Olá, ${studentInfo?.nome || 'Estudante'}`} subtitle={studentInfo?.email} />
      <div className="pt-[60px] p-4 sm:p-8">
        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 mt-4"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 sm:h-32" />
            ))
          ) : (
            <>
              <motion.div variants={itemVariants} className="card-saas !p-4 sm:!p-6 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Provas Feitas</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-on-surface font-headline tracking-tighter">{totalExams}</p>
              </motion.div>

              <motion.div variants={itemVariants} className="card-saas !p-4 sm:!p-6 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Média Geral</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-on-surface font-headline tracking-tighter">{(avgScore / 10).toFixed(1)}</p>
              </motion.div>

              <motion.div variants={itemVariants} className="card-saas !p-4 sm:!p-6 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Precisão</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-on-surface font-headline tracking-tighter">{overallAccuracy}%</p>
              </motion.div>

              <motion.div variants={itemVariants} className="card-saas !p-4 sm:!p-6 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Última Prova</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-on-surface truncate">
                  {lastExam ? lastExam.prova_titulo : '—'}
                </p>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Recent Results */}
        {!loading && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-black text-on-surface font-headline tracking-tight mb-4">Últimos Resultados</h2>
            <div className="space-y-3">
              {[...results].reverse().slice(0, 5).map((result, idx) => {
                const realIdx = results.length - 1 - idx;
                const isApproved = result.pontuacao >= 70;
                const dateStr = result.data ? new Date(result.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                return (
                  <div key={realIdx} className="card-saas !p-4 flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-headline font-black text-lg",
                      isApproved ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                    )}>
                      {(result.pontuacao / 10).toFixed(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{result.prova_titulo}</p>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{dateStr}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      isApproved ? "text-primary bg-primary/10 border-primary/20" : "text-error bg-error/10 border-error/20"
                    )}>
                      {isApproved ? 'Aprovado' : 'Reprovado'}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}

export default StudentDashboardPage;
