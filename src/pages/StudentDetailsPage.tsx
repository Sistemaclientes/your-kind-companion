import React from 'react';
import { TopBar } from '../components/TopBar';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  FileText,
  ChevronRight,
  X,
  Check,
  XCircle,
  Info
} from 'lucide-react';
import { cn, getStudentSlugMap } from '../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

export function StudentDetailsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [selectedExam, setSelectedExam] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [studentData, setStudentData] = React.useState<any>(null);
  const [results, setResults] = React.useState<any[]>([]);

  const resolveEmail = React.useCallback((value: string) => {
    const decoded = decodeURIComponent(value);
    if (decoded.includes('@')) return decoded;
    const map = getStudentSlugMap();
    return map[decoded] || null;
  }, []);

  React.useEffect(() => {
    if (!slug) return;
    const email = resolveEmail(slug);
    if (!email) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const data = await api.get(`/dashboard/students/${encodeURIComponent(email)}`);
        setStudentData(data.student);
        setResults(data.results);
      } catch (err) {
        console.error('Error fetching student details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, resolveEmail]);

  if (loading) {
    return (
      <>
        <TopBar title="Painel Administrativo" subtitle="Detalhes do Aluno" />
        <main className="pt-24 px-4 sm:px-6 pb-12 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
      </>
    );
  }

  if (!studentData) {
    return (
      <>
        <TopBar title="Painel Administrativo" subtitle="Detalhes do Aluno" />
        <main className="pt-24 px-4 sm:px-6 pb-12 max-w-7xl mx-auto text-center">
          <p className="text-on-surface-variant font-medium">Aluno não encontrado.</p>
          <button onClick={() => navigate('/admin/students')} className="btn-primary mt-4 px-6 py-3">Voltar</button>
        </main>
      </>
    );
  }

  const totalExams = results.length;
  const avgScore = totalExams > 0 ? Math.round(results.reduce((sum, r) => sum + r.pontuacao, 0) / totalExams) : 0;
  const totalCorrect = results.reduce((sum, r) => sum + r.acertos, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.total, 0);
  const aproveitamento = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const stats = [
    { label: 'Média Geral', value: `${avgScore}%`, icon: TrendingUp, color: 'emerald' },
    { label: 'Provas Realizadas', value: String(totalExams), icon: FileText, color: 'blue' },
    { label: 'Total de Acertos', value: `${totalCorrect}/${totalQuestions}`, icon: CheckCircle2, color: 'purple' },
    { label: 'Aproveitamento', value: `${aproveitamento}%`, icon: Clock, color: 'orange' },
  ];

  return (
    <>
      <TopBar title="Painel Administrativo" subtitle="Detalhes do Aluno" />
      <main className="pt-24 px-4 sm:px-6 pb-12 max-w-7xl mx-auto">
        <button 
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold text-xs uppercase tracking-widest mb-8 transition-all group"
          onClick={() => navigate('/admin/students')}
        >
          <div className="p-1.5 rounded-lg bg-surface-container group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Voltar para lista
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card-saas p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mx-auto mb-6 font-headline border border-primary/20">
                {studentData.nome.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-on-surface font-headline tracking-tight">{studentData.nome}</h2>
              
              <div className="space-y-4 text-left border-t border-outline pt-6 mt-6">
                <div className="flex items-center gap-4 text-sm text-on-surface-variant font-medium">
                  <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary/70 border border-outline">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="truncate">{studentData.email}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant font-medium">
                  <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary/70 border border-outline">
                    <Calendar className="w-4 h-4" />
                  </div>
                  Primeiro acesso: {new Date(studentData.primeiro_acesso).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant font-medium">
                  <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary/70 border border-outline">
                    <Clock className="w-4 h-4" />
                  </div>
                  Último acesso: {new Date(studentData.ultimo_acesso).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          {/* Stats and History */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="card-saas p-5 flex flex-col items-center text-center group hover:border-primary/30 transition-all">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                    s.color === 'emerald' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    s.color === 'blue' && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                    s.color === 'purple' && "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                    s.color === 'orange' && "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                  )}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-on-surface font-headline">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="card-saas overflow-hidden">
              <div className="p-6 border-b border-outline flex items-center justify-between bg-surface-container-low/50 backdrop-blur-sm">
                <h4 className="text-lg font-bold text-on-surface font-headline tracking-tight">Histórico de Avaliações</h4>
              </div>
              <div className="divide-y divide-outline">
                {results.length > 0 ? results.map((item, i) => {
                  const status = item.pontuacao >= 60 ? 'Aprovado' : 'Reprovado';
                  return (
                    <div 
                      key={i} 
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-primary/[0.02] transition-all cursor-pointer group"
                      onClick={() => setSelectedExam(item)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all border border-outline group-hover:border-primary/20 shrink-0">
                          <FileText className="w-4 sm:w-5 h-4 sm:h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors">{item.prova_titulo}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-3 h-3 text-on-surface-variant" />
                            <p className="text-[11px] text-on-surface-variant font-medium">{new Date(item.data).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-8 ml-13 sm:ml-0">
                        <div className="text-left sm:text-right">
                          <p className="text-lg sm:text-xl font-bold text-primary font-headline leading-none">{item.pontuacao}%</p>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">{item.acertos}/{item.total} acertos</p>
                        </div>
                        <span className={cn(
                          "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border",
                          status === 'Aprovado' 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                            : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                        )}>
                          {status}
                        </span>
                        <div className="p-1.5 rounded-lg bg-surface-container group-hover:bg-primary/10 transition-all hidden sm:block">
                          <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="p-12 text-center text-on-surface-variant font-medium">
                    Nenhuma prova realizada.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Exam Results Modal */}
        <AnimatePresence>
          {selectedExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedExam(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-surface-container-lowest rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-outline"
              >
                {/* Modal Header */}
                <div className="p-6 sm:p-8 border-b border-outline flex items-center justify-between bg-surface-container-low/50">
                  <div>
                    <div className="flex items-center gap-4 mb-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold text-on-surface font-headline tracking-tight">{selectedExam.prova_titulo}</h3>
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border",
                        selectedExam.pontuacao >= 60
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                          : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                      )}>
                        {selectedExam.pontuacao >= 60 ? 'Aprovado' : 'Reprovado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant font-medium flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        {new Date(selectedExam.data).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-outline" />
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-primary/60" />
                        Nota: <span className="text-primary font-bold">{selectedExam.pontuacao}%</span> ({selectedExam.acertos}/{selectedExam.total})
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedExam(null)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-container border border-outline flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all shrink-0"
                  >
                    <X className="w-5 sm:w-6 h-5 sm:h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                  {selectedExam.perguntas && selectedExam.perguntas.length > 0 ? (
                    selectedExam.perguntas.map((q: any, idx: number) => {
                      const correctAlt = q.alternativas?.find((a: any) => a.is_correta);
                      const studentAltId = q.resposta_aluno_id;
                      
                      return (
                        <div key={idx} className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border",
                              q.correto 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                            )}>
                              {idx + 1}
                            </div>
                            <div className="space-y-4 flex-1">
                              <h5 className="text-base font-bold text-on-surface leading-tight font-headline">{q.enunciado}</h5>
                              
                              <div className="grid grid-cols-1 gap-2.5">
                                {q.alternativas?.map((alt: any, optIdx: number) => {
                                  const isCorrect = alt.is_correta;
                                  const isStudentAnswer = alt.id === studentAltId;
                                  
                                  return (
                                    <div 
                                      key={alt.id}
                                      className={cn(
                                        "p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                                        isCorrect && "bg-emerald-500/5 border-emerald-500/20",
                                        isStudentAnswer && !isCorrect && "bg-red-500/5 border-red-500/20",
                                        !isCorrect && !isStudentAnswer && "bg-surface-container border-transparent"
                                      )}
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className={cn(
                                          "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold",
                                          isCorrect && "bg-emerald-500 border-emerald-500 text-white",
                                          isStudentAnswer && !isCorrect && "bg-red-500 border-red-500 text-white",
                                          !isCorrect && !isStudentAnswer && "border-outline text-on-surface-variant bg-surface-container"
                                        )}>
                                          {String.fromCharCode(65 + optIdx)}
                                        </div>
                                        <span className={cn(
                                          "text-sm font-semibold",
                                          isCorrect && "text-emerald-700 dark:text-emerald-400",
                                          isStudentAnswer && !isCorrect && "text-red-700 dark:text-red-400",
                                          !isCorrect && !isStudentAnswer && "text-on-surface"
                                        )}>
                                          {alt.texto}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        {isCorrect && (
                                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            <Check className="w-3 h-3" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Correta</span>
                                          </div>
                                        )}
                                        {isStudentAnswer && !isCorrect && (
                                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                            <XCircle className="w-3 h-3" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Resposta</span>
                                          </div>
                                        )}
                                        {isStudentAnswer && isCorrect && (
                                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Sua Resposta</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          {idx < selectedExam.perguntas.length - 1 && <div className="h-px bg-outline my-4" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/30 mx-auto mb-4 border border-outline">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-on-surface-variant font-bold">Detalhes das questões não disponíveis.</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 sm:p-8 border-t border-outline bg-surface-container-low/50 flex justify-end">
                  <button 
                    onClick={() => setSelectedExam(null)}
                    className="btn-primary px-8 py-3"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
