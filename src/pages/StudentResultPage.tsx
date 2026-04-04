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
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

export function StudentResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = React.useState<any>(null);
  const [studentInfo, setStudentInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const res = localStorage.getItem('last_result');
    const info = localStorage.getItem('student_info');
    if (res) setResult(JSON.parse(res));
    if (info) setStudentInfo(JSON.parse(info));
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
            onClick={() => navigate('/aluno/dashboard')}
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
          className="text-center mb-8 sm:mb-16 px-2"
        >
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-on-surface font-headline tracking-tight mb-4 sm:mb-6 leading-tight">
            {isApproved ? 'Parabéns,' : 'Continue tentando,'} <span className="text-primary block sm:inline">{studentInfo?.nome || 'Estudante'}!</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed">
            {isApproved 
              ? 'Você concluiu sua avaliação com desempenho satisfatório. Deseja fazer mais uma avaliação?'
              : 'Infelizmente você não atingiu a pontuação mínima, mas pode tentar novamente.'}
          </p>
        </motion.div>

        {/* Result Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mb-8 sm:mb-16"
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

        {/* Certificate Action */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-4xl bg-surface-container-high rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-12 text-on-surface flex flex-col items-center md:flex-row md:items-center justify-between gap-6 sm:gap-8 mb-8 sm:mb-16 shadow-2xl shadow-primary/5 border border-outline"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <FileCheck className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-headline mb-1">Certificado de Conclusão</h3>
              <p className="text-on-surface-variant text-sm font-medium">Sua certificação oficial está pronta para download.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/aluno/dashboard')}
            className="btn-primary py-3.5 sm:py-4 px-8 sm:px-10 w-full md:w-auto text-sm uppercase tracking-widest group"
          >
            <BarChart3 className="w-5 h-5" />
            Minha Dashboard
          </button>
          <button 
            onClick={() => navigate('/student/start')}
            className="btn-secondary py-3.5 sm:py-4 px-8 sm:px-10 w-full md:w-auto text-sm uppercase tracking-widest group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Nova avaliação
          </button>
        </motion.div>

        {/* Footer Actions */}
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
