import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Trophy,
  Target,
  BookOpen,
  Clock,
  ChevronRight,
  Play,
  Eye,
  LogOut,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = React.useState<any>(null);
  const [results, setResults] = React.useState<any[]>([]);
  const [exams, setExams] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const info = localStorage.getItem('student_info');
    if (!info) {
      navigate('/student/start');
      return;
    }
    const parsed = JSON.parse(info);
    setStudentInfo(parsed);

    const fetchData = async () => {
      try {
        const [allExams, allResults] = await Promise.all([
          api.get('/provas'),
          Promise.resolve(JSON.parse(localStorage.getItem('local_resultados') || '[]'))
        ]);
        setExams(allExams);
        // Filter results for current student
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

  const completedExamIds = new Set(results.map(r => r.prova_id));

  const handleLogout = () => {
    localStorage.removeItem('student_info');
    navigate('/student/start');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-[30%] -right-[5%] w-[30%] h-[40%] rounded-full bg-secondary/6 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-on-surface font-headline tracking-tight">
              Olá, <span className="text-primary">{studentInfo?.nome?.split(' ')[0] || 'Estudante'}</span>
            </h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">{studentInfo?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all self-start"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Available Exams */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Play className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-on-surface font-headline tracking-tight">Provas Disponíveis</h2>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))
              ) : exams.length === 0 ? (
                <div className="card-saas !p-6 text-center">
                  <p className="text-sm text-on-surface-variant font-medium">Nenhuma prova disponível no momento.</p>
                </div>
              ) : (
                exams.map((exam: any) => (
                  <motion.div
                    key={exam.id}
                    whileHover={{ scale: 1.01 }}
                    className="card-saas !p-4 sm:!p-5 flex items-center gap-4 cursor-pointer"
                    onClick={() => {
                      if (!exam.slug) {
                        console.error('Slug indisponível para esta prova');
                        return;
                      }
                      navigate(`/prova/${exam.slug}`);
                    }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-on-surface truncate">{exam.titulo}</p>
                      <p className="text-xs text-on-surface-variant font-medium truncate">{exam.descricao || 'Sem descrição'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{exam.qCount || exam.perguntas?.length || 0} questões</span>
                        {completedExamIds.has(exam.id) && (
                          <span className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                            <Award className="w-3 h-3" /> Concluída
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant shrink-0" />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Exam History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-secondary" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-on-surface font-headline tracking-tight">Histórico de Provas</h2>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))
              ) : results.length === 0 ? (
                <div className="card-saas !p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-base font-bold text-on-surface mb-1">Nenhuma prova realizada</p>
                  <p className="text-sm text-on-surface-variant font-medium">Comece fazendo uma prova disponível ao lado.</p>
                </div>
              ) : (
                [...results].reverse().map((result, idx) => {
                  const isApproved = result.pontuacao >= 70;
                  const dateStr = result.data ? new Date(result.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      className="card-saas !p-4 sm:!p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 font-headline font-black text-lg sm:text-xl",
                          isApproved ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                        )}>
                          {(result.pontuacao / 10).toFixed(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-bold text-on-surface truncate">{result.prova_titulo}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{dateStr}</span>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{result.acertos}/{result.total} acertos</span>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                              isApproved ? "text-primary bg-primary/10 border-primary/20" : "text-error bg-error/10 border-error/20"
                            )}>
                              {isApproved ? 'Aprovado' : 'Reprovado'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/aluno/resultado/${idx}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline text-on-surface-variant font-bold text-[10px] uppercase tracking-widest hover:bg-surface-container-high hover:text-primary transition-all shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Detalhes</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardPage;
