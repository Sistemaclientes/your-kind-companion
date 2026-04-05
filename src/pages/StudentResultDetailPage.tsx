import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function StudentResultDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [result, setResult] = React.useState<any>(null);
  const [exam, setExam] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        if (!slug) return;
        const data = await api.get(`/resultados/slug/${slug}`);
        setResult(data);
        setExam(data.exam);
      } catch (err) {
        console.error('Error loading result detail:', err);
        setError('Erro ao carregar detalhes do resultado.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-sans text-on-surface antialiased">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-2xl font-black text-on-surface font-headline">{error}</h1>
          <button onClick={() => navigate('/aluno/dashboard')} className="btn-primary px-8 py-3 rounded-xl font-bold text-sm">
            Voltar à Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const isApproved = result ? result.pontuacao >= 70 : false;
  const erros = result ? result.total - result.acertos : 0;

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-[40%] -right-[5%] w-[30%] h-[40%] rounded-full bg-secondary/6 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/aluno/dashboard')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar à Dashboard
        </motion.button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 mt-4" />)}
          </div>
        ) : result && exam ? (
          <>
            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-on-surface font-headline tracking-tight mb-2">
                {result.prova_titulo}
              </h1>
              <p className="text-sm text-on-surface-variant font-medium">
                Realizada em {result.data ? new Date(result.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10"
            >
              <div className="card-saas !p-5 sm:!p-6 flex flex-col items-center text-center group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Nota Final</span>
                <span className={cn(
                  "text-4xl sm:text-5xl font-black font-headline tracking-tighter",
                  isApproved ? "text-primary" : "text-error"
                )}>
                  {(result.pontuacao / 10).toFixed(1)}
                </span>
                <span className={cn(
                  "mt-2 px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest border",
                  isApproved ? "bg-primary/10 text-primary border-primary/20" : "bg-error/10 text-error border-error/20"
                )}>
                  {isApproved ? 'Aprovado' : 'Reprovado'}
                </span>
              </div>

              <div className="card-saas !p-5 sm:!p-6 flex flex-col items-center text-center group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Acertos</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-primary font-headline tracking-tighter">{result.acertos}</span>
                  <span className="text-xl font-black text-on-surface-variant">/{result.total}</span>
                </div>
              </div>

              <div className="card-saas !p-5 sm:!p-6 flex flex-col items-center text-center group">
                <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <XCircle className="w-5 h-5 text-error" />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Erros</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-error font-headline tracking-tighter">{erros}</span>
                  <span className="text-xl font-black text-on-surface-variant">/{result.total}</span>
                </div>
              </div>
            </motion.div>

            {/* Questions Detail */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-on-surface font-headline tracking-tight">Detalhes por Questão</h2>
              </div>

              <div className="space-y-4">
                {exam.perguntas?.map((question: any, qIdx: number) => {
                  const correctAltId = exam.correctAlts?.[question.id];
                  const studentAnswerId = result.respostas?.[question.id];
                  const studentGotRight = studentAnswerId === correctAltId;

                  return (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * qIdx }}
                      className="card-saas !p-5 sm:!p-6"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-headline font-black text-sm shrink-0",
                          studentGotRight ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                        )}>
                          {qIdx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-bold text-on-surface leading-relaxed">{question.enunciado}</p>
                          <span className={cn(
                            "inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest",
                            studentGotRight ? "text-primary" : "text-error"
                          )}>
                            {studentGotRight ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {studentGotRight ? 'Acertou' : 'Errou'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 ml-11">
                        {question.alternativas?.map((alt: any) => {
                          const isCorrect = alt.id === correctAltId || alt.is_correta;
                          const isStudentAnswer = alt.id === studentAnswerId;
                          const isWrongAnswer = isStudentAnswer && !isCorrect;

                          return (
                            <div
                              key={alt.id}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                                isCorrect
                                  ? "bg-primary/5 border-primary/20 text-primary"
                                  : isWrongAnswer
                                    ? "bg-error/5 border-error/20 text-error"
                                    : "bg-surface-container-low border-outline text-on-surface-variant"
                              )}
                            >
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                              ) : isWrongAnswer ? (
                                <XCircle className="w-4 h-4 text-error shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-outline shrink-0" />
                              )}
                              <span>{alt.texto}</span>
                              {isCorrect && (
                                <span className="ml-auto text-[9px] font-black text-primary uppercase tracking-widest">Correta</span>
                              )}
                              {isWrongAnswer && (
                                <span className="ml-auto text-[9px] font-black text-error uppercase tracking-widest">Sua resposta</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {question.explicacao && (
                        <div className="ml-11 mt-3 px-4 py-3 rounded-xl bg-surface-container-low border border-outline/50 text-sm text-on-surface-variant leading-relaxed">
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Explicação</span>
                          {question.explicacao}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Bottom action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex justify-center"
            >
              <button
                onClick={() => navigate('/aluno/dashboard')}
                className="btn-primary px-8 py-3.5 rounded-xl font-bold text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar à Dashboard
              </button>
            </motion.div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default StudentResultDetailPage;
