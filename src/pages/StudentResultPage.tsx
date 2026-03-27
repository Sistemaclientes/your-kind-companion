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
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

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
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 pt-16 pb-12 flex flex-col items-center">
        {/* Header Actions */}
        <div className="w-full flex justify-start mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            Sair do Portal
          </button>
        </div>

        {/* Trophy Icon */}
        <motion.div 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-28 h-28 bg-primary/10 rounded-[32px] flex items-center justify-center mb-10 shadow-xl shadow-primary/10 border border-primary/20 relative"
        >
          <Trophy className="w-12 h-12 text-primary" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg"
          >
            <Zap className="w-4 h-4 fill-current" />
          </motion.div>
        </motion.div>
        
        {/* Greeting */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black text-on-surface font-headline tracking-tight mb-6 leading-tight">
            {isApproved ? 'Parabéns,' : 'Continue tentando,'} <span className="text-primary">{studentInfo?.nome || 'Estudante'}!</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed">
            Você concluiu sua avaliação. {isApproved ? 'Seu desempenho foi satisfatório e você pode baixar seu certificado.' : 'Infelizmente você não atingiu a pontuação mínima, mas pode tentar novamente.'}
          </p>
        </motion.div>

        {/* Result Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16"
        >
          {/* Note Card */}
          <motion.div variants={itemVariants} className="card-saas !p-10 flex flex-col items-center justify-center text-center group">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4">Sua Nota</span>
            <span className={cn(
                "text-7xl font-black font-headline mb-4 tracking-tighter",
                isApproved ? "text-primary" : "text-error"
            )}>
                {(result?.pontuacao / 10).toFixed(1).replace('.', ',')}
            </span>
            <div className={cn(
                "px-5 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border",
                isApproved ? "bg-primary/10 text-primary border-primary/20" : "bg-error/10 text-error border-error/20"
            )}>
              {isApproved ? 'Aprovado' : 'Reprovado'}
            </div>
          </motion.div>

          {/* Correct Answers Card */}
          <motion.div variants={itemVariants} className="card-saas !p-10 flex flex-col items-center justify-center text-center group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4">Acertos</span>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-7xl font-black text-on-surface font-headline tracking-tighter">{result?.acertos}</span>
              <span className="text-3xl font-black text-on-surface-variant">/{result?.total}</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{result?.pontuacao}% de Precisão</span>
          </motion.div>

          {/* Feedback Card */}
          <motion.div variants={itemVariants} className="card-saas !p-10 flex flex-col items-center justify-center text-center group">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4">Status</span>
            <span className="text-xl font-black text-on-surface font-headline mb-4">
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
          className="w-full max-w-4xl bg-surface-container-high rounded-[32px] p-8 md:p-12 text-on-surface flex flex-col md:flex-row items-center justify-between gap-8 mb-16 shadow-2xl shadow-primary/5 border border-outline"
        >
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-headline mb-1">Certificado de Conclusão</h3>
              <p className="text-on-surface-variant text-sm font-medium">Sua certificação oficial está pronta para download.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/student/start')}
            className="btn-primary py-4 px-10 w-full md:w-auto text-sm uppercase tracking-widest group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Fazer outra prova
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
            onClick={() => navigate('/admin/dashboard')}
          >
            Voltar para o Painel Administrativo
          </button>
        </motion.div>
      </div>
    </div>
  );
}
