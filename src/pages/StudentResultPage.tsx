import React from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Target, 
  Download, 
  Share2, 
  ArrowRight,
  TrendingUp,
  Brain,
  Zap,
  ChevronLeft,
  FileCheck,
  Award,
  BarChart3,
  Eye,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';

export function StudentResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = React.useState<any>(null);
  const [exam, setExam] = React.useState<any>(null);
  const [studentInfo, setStudentInfo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const lastRes = localStorage.getItem('last_result');
        if (lastRes) {
          const parsedRes = JSON.parse(lastRes);
          if (parsedRes.resultId) {
            const fullResult = await api.get(`/resultados/${parsedRes.resultId}`);
            setResult(fullResult);
            setExam(fullResult.exam);
          } else {
            setResult(parsedRes);
          }
        }
      } catch (err) {
        console.error('Error loading full result:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  React.useEffect(() => {
    if (result && result.pontuacao >= 70) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [result]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const isApproved = result ? result.pontuacao >= 70 : false;

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden flex flex-col items-center font-sans text-on-surface antialiased">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-56 sm:w-80 h-56 sm:h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6 pt-8 sm:pt-16 pb-8 sm:pb-12 flex flex-col items-center">
        {/* Header Actions */}
        <div className="w-full flex justify-start mb-6 sm:mb-8">
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            Ir para Dashboard
          </button>
        </div>

        {/* Trophy Icon */}
        <motion.div 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[24px] sm:rounded-[32px] flex items-center justify-center mb-6 sm:mb-10 shadow-xl shadow-primary/20 border-2 border-primary/30 relative"
        >
          <Trophy className="w-10 h-10 sm:w-14 sm:h-14 text-primary drop-shadow-lg" strokeWidth={2.5} />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-secondary/40"
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
        </motion.div>
        
        {/* Greeting */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 sm:mb-12 px-2"
        >
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-on-surface font-headline tracking-tight mb-4 sm:mb-6 leading-tight">
            {isApproved ? 'Parabéns,' : 'Continue tentando,'} <span className="text-primary block sm:inline">{studentInfo?.nome || 'Estudante'}!</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed">
            {isApproved 
              ? 'Você concluiu sua avaliação com desempenho satisfatório.'
              : 'Infelizmente você não atingiu a pontuação mínima, mas pode tentar novamente.'}
          </p>
        </motion.div>

        {/* Result Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mb-8 sm:mb-10"
        >
          {/* Note Card */}
          <motion.div variants={itemVariants} className="card-saas !p-6 sm:!p-10 flex flex-col items-center justify-center text-center group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3 sm:mb-4">Sua Nota</span>
            <span className={cn(
                "text-5xl sm:text-7xl font-black font-headline mb-3 sm:mb-4 tracking-tighter",
                isApproved ? "text-primary" : "text-error"
            )}>
                {(result?.pontuacao / 10).toFixed(1).replace('.', ',')}
            </span>
            <div className={cn(
                "px-4 sm:px-5 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border",
                isApproved ? "bg-primary/10 text-primary border-primary/20" : "bg-error/10 text-error border-error/20"
            )}>
              {isApproved ? 'Aprovado' : 'Reprovado'}
            </div>
          </motion.div>

          {/* Correct Answers Card */}
          <motion.div variants={itemVariants} className="card-saas !p-6 sm:!p-10 flex flex-col items-center justify-center text-center group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3 sm:mb-4">Acertos</span>
            <div className="flex items-baseline gap-1 mb-3 sm:mb-4">
              <span className="text-5xl sm:text-7xl font-black text-on-surface font-headline tracking-tighter">{result?.acertos}</span>
              <span className="text-2xl sm:text-3xl font-black text-on-surface-variant">/{result?.total}</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{result?.pontuacao}% de Precisão</span>
          </motion.div>

          {/* Feedback Card */}
          <motion.div variants={itemVariants} className="card-saas !p-6 sm:!p-10 flex flex-col items-center justify-center text-center group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3 sm:mb-4">Status</span>
            <span className="text-lg sm:text-xl font-black text-on-surface font-headline mb-3 sm:mb-4">
                {isApproved ? 'Excelência Técnica' : 'Necessita Revisão'}
            </span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Avaliação Final</span>
          </motion.div>
        </motion.div>

        {/* View Details - Breakdown */}
        {result && exam && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-4xl mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-black text-on-surface font-headline tracking-tight">Análise por Questão</h2>
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
                    className="card-saas !p-5 sm:!p-8 border-l-4"
                    style={{ borderLeftColor: studentGotRight ? 'var(--primary)' : 'var(--error)' }}
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-headline font-black text-sm shrink-0 shadow-sm",
                        studentGotRight ? "bg-primary text-white" : "bg-error text-white"
                      )}>
                        {qIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-lg font-bold text-on-surface leading-snug">{question.enunciado}</p>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          studentGotRight ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                        )}>
                          {studentGotRight ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {studentGotRight ? 'Acertou' : 'Errou'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 ml-0 sm:ml-14">
                      {question.alternativas?.map((alt: any) => {
                        const isCorrect = alt.id === correctAltId || alt.is_correta;
                        const isStudentAnswer = alt.id === studentAnswerId;
                        const isWrongAnswer = isStudentAnswer && !isCorrect;

                        return (
                          <div
                            key={alt.id}
                            className={cn(
                              "flex items-center gap-4 px-5 py-4 rounded-2xl border text-sm font-semibold transition-all",
                              isCorrect
                                ? "bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5"
                                : isWrongAnswer
                                  ? "bg-error/5 border-error/40 text-error"
                                  : "bg-surface-container-low border-outline text-on-surface-variant/80"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-transform duration-300",
                              isCorrect ? "bg-primary border-primary" : isWrongAnswer ? "bg-error border-error" : "border-outline"
                            )}>
                              {isCorrect ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              ) : isWrongAnswer ? (
                                <XCircle className="w-3.5 h-3.5 text-white" />
                              ) : null}
                            </div>
                            <span className="flex-1">{alt.texto}</span>
                            {isCorrect && (
                              <span className="ml-auto text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">Correta</span>
                            )}
                            {isWrongAnswer && (
                              <span className="ml-auto text-[10px] font-black text-error uppercase tracking-widest bg-error/10 px-2 py-0.5 rounded-md">Sua Resposta</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explicacao && (
                      <div className="ml-0 sm:ml-14 mt-6 p-5 rounded-2xl bg-surface-container border border-outline/50 text-sm text-on-surface-variant leading-relaxed shadow-inner">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <Brain className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Explicação</span>
                        </div>
                        {question.explicacao}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Bottom Actions */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 sm:mb-16"
        >
          <button 
            onClick={() => navigate('/aluno/dashboard')}
            className="btn-secondary py-3.5 sm:py-4 px-8 sm:px-10 w-full sm:w-auto text-sm uppercase tracking-widest group"
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/student/start')}
            className="btn-secondary py-3.5 sm:py-4 px-8 sm:px-10 w-full sm:w-auto text-sm uppercase tracking-widest group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Nova Prova
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-6"
        >
          <button 
            className="text-on-surface-variant font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors"
            onClick={() => navigate('/aluno/dashboard')}
          >
            Voltar à Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default StudentResultPage;
