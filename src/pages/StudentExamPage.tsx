import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  CheckCircle2, 
  AlertCircle,
  Flag,
  X,
  Send,
  HelpCircle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function StudentExamPage() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(3600); // 60:00 in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [reviewFilter, setReviewFilter] = useState(false);
  const totalQuestions = 20;

  const toggleFlag = () => {
    setFlaggedQuestions(prev => 
      prev.includes(currentQuestion) 
        ? prev.filter(q => q !== currentQuestion) 
        : [...prev, currentQuestion]
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowFinishConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    navigate('/student/result');
  };

  const selectOption = (index: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: index }));
  };

  const options = [
    "O mestre de obras é responsável apenas pela limpeza do canteiro, enquanto o engenheiro cuida de toda a execução técnica.",
    "O mestre de obras coordena as equipes de campo e executa o projeto sob supervisão técnica, sendo o elo entre o engenheiro e os operários.",
    "Não há diferença prática, ambos possuem as mesmas atribuições legais e podem assinar projetos estruturais.",
    "O mestre de obras é um cargo administrativo que não precisa frequentar o canteiro de obras diariamente."
  ];

  const progress = (Object.keys(answers).length / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface antialiased">
      {/* Header */}
      <header className="h-20 bg-surface-container border-b border-outline flex items-center justify-between px-6 md:px-10 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Mestre de Obra</h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Engenharia Civil • Avaliação 01</p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-outline"></div>
          <div className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300",
            timeLeft < 300 ? "bg-error/10 border-error/20 text-error animate-pulse" : "bg-surface-container-low border-outline text-on-surface"
          )}>
            <Clock className={cn("w-4 h-4", timeLeft < 300 ? "text-error" : "text-primary")} />
            <span className="text-lg font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end mr-4">
            <p className="text-xs font-bold text-on-surface">Ricardo Almeida</p>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">ID: 4829-10</p>
          </div>
          <button 
            className="btn-primary py-2.5 px-6 text-xs uppercase tracking-widest"
            onClick={() => setShowFinishConfirm(true)}
          >
            <span>Finalizar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-outline/30 overflow-hidden">
        <motion.div 
          className="h-full bg-primary" 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-headline font-black text-xl shadow-sm border border-primary/20">
              {currentQuestion}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Questão Atual</span>
              <span className="text-sm font-bold text-on-surface">Progresso: {Object.keys(answers).length} de {totalQuestions}</span>
            </div>
            {flaggedQuestions.includes(currentQuestion) && (
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-secondary/10 p-2 rounded-xl border border-secondary/20"
              >
                <Flag className="w-4 h-4 text-secondary fill-secondary" />
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline rounded-2xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              Múltipla Escolha
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline rounded-2xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <AlertCircle className="w-3.5 h-3.5 text-secondary" />
              Peso: 1.0
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card-saas !p-0 overflow-hidden border-none shadow-xl shadow-primary/5 mb-8"
          >
            <div className="p-6 md:p-10 space-y-10">
              <div className="space-y-8">
                <h2 className="text-xl md:text-2xl font-bold text-on-surface leading-snug tracking-tight">
                  No contexto de uma obra residencial de grande porte, qual a principal diferença entre as atribuições de um Mestre de Obras e um Engenheiro Civil residente?
                </h2>
                
                <div className="relative group rounded-3xl overflow-hidden border border-outline shadow-lg">
                  <img 
                    alt="Canteiro de Obras" 
                    className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" 
                    src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {options.map((opt, i) => (
                  <button 
                    key={i}
                    className={cn(
                      "w-full p-5 md:p-6 rounded-[20px] border-2 text-left transition-all flex items-start gap-5 group relative overflow-hidden",
                      answers[currentQuestion] === i 
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                        : "bg-surface-container-low border-outline hover:border-primary/30 hover:bg-surface-container-high"
                    )}
                    onClick={() => selectOption(i)}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-black shrink-0 transition-all duration-300",
                      answers[currentQuestion] === i 
                        ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20" 
                        : "bg-surface border-outline text-on-surface-variant group-hover:border-primary/50 group-hover:text-primary"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <p className={cn(
                      "text-sm md:text-base font-semibold leading-relaxed pt-1.5 transition-colors",
                      answers[currentQuestion] === i ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"
                    )}>
                      {opt}
                    </p>
                    {answers[currentQuestion] === i && (
                      <motion.div 
                        layoutId="active-option"
                        className="absolute right-6 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <footer className="h-24 bg-surface-container border-t border-outline flex items-center justify-between px-6 md:px-10 sticky bottom-0 z-50 backdrop-blur-md bg-surface-container/90">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={handlePrev}
            disabled={currentQuestion === 1}
            className="flex items-center gap-2 px-5 md:px-8 py-3.5 rounded-2xl border border-outline text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-[1.03] active:scale-[0.98]"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-5 md:px-8 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-container transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <span className="hidden sm:inline">{currentQuestion === totalQuestions ? 'Revisar' : 'Próxima'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleFlag}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-sm",
              flaggedQuestions.includes(currentQuestion)
                ? "bg-secondary/10 text-secondary border-secondary/20"
                : "bg-surface-container-low text-on-surface-variant border-outline hover:text-primary hover:border-primary/20"
            )}
            title="Marcar para revisão"
          >
            <Flag className={cn("w-5 h-5", flaggedQuestions.includes(currentQuestion) && "fill-secondary")} />
          </button>
          <div className="hidden sm:block h-8 w-px bg-outline"></div>
          <button 
            onClick={() => setShowMap(true)}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-surface-container-low border border-outline text-on-surface font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all shadow-sm hover:scale-[1.03] active:scale-[0.98]"
          >
            <LayoutGrid className="w-5 h-5 text-primary" />
            <span className="hidden md:inline">Mapa de Questões</span>
          </button>
        </div>
      </footer>

      {/* Question Map Modal */}
      <AnimatePresence>
        {showMap && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMap(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container p-0 w-full max-w-2xl rounded-[32px] shadow-2xl border border-outline overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-outline flex items-center justify-between bg-surface-container-low">
                <div>
                  <h2 className="text-2xl font-bold font-headline text-on-surface tracking-tight">Mapa de Questões</h2>
                  <p className="text-sm text-on-surface-variant mt-1 font-medium">Navegue rapidamente entre as questões da prova.</p>
                </div>
                <button 
                  onClick={() => setShowMap(false)}
                  className="w-10 h-10 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors border border-outline"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Respondidas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary"></div>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Para Revisão</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-outline"></div>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Pendentes</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setReviewFilter(!reviewFilter)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border shadow-sm",
                      reviewFilter 
                        ? "bg-primary text-white border-primary shadow-primary/20" 
                        : "bg-surface-container-low text-on-surface-variant border-outline hover:bg-surface-container-high"
                    )}
                  >
                    <Flag className={cn("w-3.5 h-3.5", reviewFilter && "fill-white")} />
                    {reviewFilter ? "Ver Todas" : "Ver Marcadas"}
                  </button>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {Array.from({ length: totalQuestions }).map((_, i) => {
                    const qNum = i + 1;
                    const isFlagged = flaggedQuestions.includes(qNum);
                    const isAnswered = !!answers[qNum];
                    const isCurrent = qNum === currentQuestion;
                    
                    if (reviewFilter && !isFlagged) return null;

                    return (
                      <button
                        key={qNum}
                        onClick={() => {
                          setCurrentQuestion(qNum);
                          setShowMap(false);
                        }}
                        className={cn(
                          "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative group border-2",
                          isCurrent ? "border-primary scale-110 shadow-lg shadow-primary/10 z-10" : "border-transparent",
                          isFlagged 
                            ? "bg-secondary/10 text-secondary border-secondary/20" 
                            : isAnswered 
                              ? "bg-primary/10 text-primary border-primary/20" 
                              : "bg-surface-container-low text-on-surface-variant border-outline hover:border-primary/20"
                        )}
                      >
                        <span className="text-sm font-black">{qNum}</span>
                        {isFlagged && <Flag className="w-2.5 h-2.5 fill-secondary" />}
                        {!isFlagged && isAnswered && <CheckCircle2 className="w-2.5 h-2.5" />}
                      </button>
                    );
                  })}
                </div>

                {reviewFilter && flaggedQuestions.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-surface-container-low rounded-3xl flex items-center justify-center mx-auto mb-4 border border-outline">
                      <Flag className="w-8 h-8 text-outline" />
                    </div>
                    <p className="text-on-surface-variant font-bold text-sm uppercase tracking-widest">Nenhuma questão marcada</p>
                  </div>
                )}
              </div>

              <div className="p-8 bg-surface-container-low border-t border-outline flex justify-end">
                <button 
                  onClick={() => setShowMap(false)}
                  className="btn-primary px-8 py-3 text-sm uppercase tracking-widest"
                >
                  Fechar Mapa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finish Confirmation Modal */}
      <AnimatePresence>
        {showFinishConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowFinishConfirm(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container p-8 rounded-[32px] shadow-2xl border border-outline max-w-md w-full relative z-10 text-center"
            >
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 mx-auto border border-primary/20">
                <Send className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-on-surface font-headline mb-2 tracking-tight">Finalizar Avaliação?</h4>
              <p className="text-on-surface-variant font-medium mb-8">
                Você respondeu <span className="text-primary font-bold">{Object.keys(answers).length}</span> de <span className="text-on-surface font-bold">{totalQuestions}</span> questões. Deseja enviar suas respostas agora?
              </p>
              
              {Object.keys(answers).length < totalQuestions && (
                <div className="mb-8 p-4 bg-secondary/10 rounded-2xl border border-secondary/20 flex items-start gap-3 text-left">
                  <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-secondary uppercase tracking-tight">
                    Atenção: Você ainda possui questões sem resposta.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button 
                  className="w-full btn-primary py-4 text-sm uppercase tracking-widest"
                  onClick={handleFinish}
                >
                  Sim, Finalizar Prova
                </button>
                <button 
                  className="w-full py-4 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm uppercase tracking-widest"
                  onClick={() => setShowFinishConfirm(false)}
                >
                  Continuar Respondendo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
