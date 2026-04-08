import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Clock, ChevronLeft, ChevronRight, LayoutGrid, CheckCircle2, AlertCircle,
  Flag, X, Send, HelpCircle, Shield, Camera, AlertTriangle, Maximize
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { supabase } from '../integrations/supabase/client';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useProctoring } from '../hooks/useProctoring';

export function StudentExamPage() {
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [reviewFilter, setReviewFilter] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [terminated, setTerminated] = useState(false);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Anti-cheat
  const antiCheat = useAntiCheat({
    enabled: !!attemptId && !isSubmitting && !terminated,
    maxViolations: 3,
    attemptId,
    onTerminate: useCallback(() => {
      handleTerminate();
    }, []),
  });

  // Proctoring
  const proctoring = useProctoring({
    enabled: !!attemptId && !isSubmitting && !terminated,
    captureIntervalSec: 15,
    attemptId,
  });

  // Show warning on violation
  useEffect(() => {
    if (antiCheat.lastViolationType && antiCheat.violations < 3) {
      const messages: Record<string, string> = {
        exit_fullscreen: 'Você saiu do modo tela cheia. Volte imediatamente!',
        tab_switch: 'Troca de aba detectada! Isso é uma violação.',
        window_blur: 'Você saiu da janela da prova!',
        copy_attempt: 'Copiar não é permitido durante a prova.',
        paste_attempt: 'Colar não é permitido durante a prova.',
        right_click: 'Clique direito bloqueado durante a prova.',
        devtools_attempt: 'Tentativa de abrir ferramentas de desenvolvedor detectada!',
        multi_screen: 'Múltiplos monitores detectados!',
      };
      setViolationMessage(messages[antiCheat.lastViolationType] || 'Violação detectada!');
      setShowViolationWarning(true);
      setTimeout(() => setShowViolationWarning(false), 4000);
    }
  }, [antiCheat.violations, antiCheat.lastViolationType]);

  const handleTerminate = async () => {
    setTerminated(true);
    if (attemptId) {
      try {
        await supabase.functions.invoke('exam-manager', {
          body: { attempt_id: attemptId, reason: 'max_violations' },
          headers: { 'x-action': 'terminate' },
        });
      } catch {}
    }
  };

  // Start exam attempt via edge function
  useEffect(() => {
    const examId = sessionStorage.getItem('current_exam_id');
    if (!examId) { navigate('/student/start'); return; }

    const initExam = async () => {
      try {
        const data = await api.get(`/provas/${examId}`);
        setExam(data);

        // Start attempt via edge function
        const { data: result, error } = await supabase.functions.invoke('exam-manager', {
          body: JSON.stringify({ exam_id: examId, device_info: getDeviceInfo() }),
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        // Parse the response - invoke may return different formats
        let parsed = result;
        if (typeof result === 'string') {
          try { parsed = JSON.parse(result); } catch { parsed = result; }
        }

        if (error || parsed?.error) {
          toast.error(parsed?.error || 'Erro ao iniciar prova');
          navigate('/student/start');
          return;
        }

        if (parsed?.attempt) {
          setAttemptId(parsed.attempt.id);
          setTimeLeft(parsed.remaining_seconds || 3600);
        } else {
          setTimeLeft(60 * 60);
        }
      } catch (err) {
        console.error('Error starting exam:', err);
        navigate('/student/start');
      } finally {
        setLoading(false);
      }
    };
    initExam();
  }, [navigate]);

  // Request fullscreen on load
  useEffect(() => {
    if (!loading && attemptId) {
      antiCheat.requestFullscreen();
    }
  }, [loading, attemptId]);

  // Timer countdown
  useEffect(() => {
    if (loading || isSubmitting || terminated) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isSubmitting, terminated]);

  // Sync time with backend every 30s
  useEffect(() => {
    if (!attemptId || isSubmitting || terminated) return;

    syncTimerRef.current = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke('exam-manager', {
          body: JSON.stringify({ attempt_id: attemptId }),
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-action': 'sync-time' },
        });

        let parsed = data;
        if (typeof data === 'string') try { parsed = JSON.parse(data); } catch {}

        if (parsed?.remaining_seconds !== undefined) {
          setTimeLeft(parsed.remaining_seconds);
          if (parsed.status === 'expired') {
            handleAutoFinish();
          }
        }
      } catch {}
    }, 30000);

    return () => { if (syncTimerRef.current) clearInterval(syncTimerRef.current); };
  }, [attemptId, isSubmitting, terminated]);

  // Trigger AI analysis periodically (every 60s)
  useEffect(() => {
    if (!attemptId || isSubmitting || terminated) return;

    const interval = setInterval(async () => {
      try {
        await supabase.functions.invoke('exam-manager', {
          body: JSON.stringify({ attempt_id: attemptId }),
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-action': 'analyze' },
        });
      } catch {}
    }, 60000);

    return () => clearInterval(interval);
  }, [attemptId, isSubmitting, terminated]);

  const currentQuestion = exam?.perguntas[currentQuestionIdx];
  const totalQuestions = exam?.perguntas.length || 0;

  const toggleFlag = () => {
    setFlaggedQuestions(prev =>
      prev.includes(currentQuestionIdx)
        ? prev.filter(q => q !== currentQuestionIdx)
        : [...prev, currentQuestionIdx]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      handleAutoFinish();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) setCurrentQuestionIdx(prev => prev - 1);
  };

  const handleAutoFinish = async () => {
    if (!exam || isSubmitting) return;
    setIsSubmitting(true);
    setCountdown(5);

    try {
      // Submit answers
      const result = await api.post('/responder-prova', {
        prova_id: exam.id,
        respostas: answers,
      });
      localStorage.setItem('last_result', JSON.stringify(result));

      // Mark attempt as completed
      if (attemptId) {
        await supabase.functions.invoke('exam-manager', {
          body: JSON.stringify({ attempt_id: attemptId }),
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-action': 'finish' },
        });
      }

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      proctoring.stopCamera();

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); navigate('/student/result'); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      toast.error('Erro ao enviar respostas. Tente novamente.');
    }
  };

  const selectOption = (optionId: number) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    setTimeout(() => {
      if (currentQuestionIdx < totalQuestions - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      } else {
        handleAutoFinish();
      }
    }, 400);
  };

  if (loading || !exam) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Preparando sua avaliação...</p>
        </div>
      </div>
    );
  }

  if (terminated) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full space-y-8">
          <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-12 h-12 text-error" />
          </div>
          <h2 className="text-3xl font-black text-on-surface font-headline">Prova Encerrada</h2>
          <p className="text-on-surface-variant font-medium">
            Sua prova foi encerrada automaticamente devido a múltiplas violações das regras de integridade.
            O administrador será notificado sobre este incidente.
          </p>
          <button onClick={() => navigate('/student/dashboard')} className="btn-primary px-8 py-3 text-sm uppercase tracking-widest">
            Voltar ao Painel
          </button>
        </motion.div>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / totalQuestions) * 100;

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full space-y-8">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-primary font-mono">{countdown}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-on-surface font-headline tracking-tight">O sistema está corrigindo a sua prova</h2>
            <p className="text-on-surface-variant font-medium">Por favor, aguarde enquanto processamos seus resultados.</p>
          </div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <motion.div key={i} animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-primary" />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface antialiased select-none">
      {/* Hidden video/canvas for proctoring */}
      <video ref={proctoring.videoRef} className="hidden" muted playsInline />
      <canvas ref={proctoring.canvasRef} className="hidden" />

      {/* Violation Warning Toast */}
      <AnimatePresence>
        {showViolationWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-error text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-lg"
          >
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">{violationMessage}</p>
              <p className="text-xs opacity-80">Violação {antiCheat.violations}/3 — Na próxima sua prova será encerrada</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-20 bg-surface-container border-b border-outline flex items-center justify-between px-6 md:px-10 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">{exam?.titulo}</h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{exam?.descricao}</p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-outline" />
          <div className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300",
            timeLeft < 300 ? "bg-error/10 border-error/20 text-error animate-pulse" : "bg-surface-container-low border-outline text-on-surface"
          )}>
            <Clock className={cn("w-4 h-4", timeLeft < 300 ? "text-error" : "text-primary")} />
            <span className="text-lg font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Security indicators */}
          <div className="hidden md:flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", antiCheat.isFullscreen ? "bg-green-500" : "bg-error animate-pulse")} />
            <Shield className="w-4 h-4 text-on-surface-variant" />
            {proctoring.cameraReady && <Camera className="w-4 h-4 text-green-500" />}
          </div>

          {!antiCheat.isFullscreen && (
            <button onClick={antiCheat.requestFullscreen} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-error/10 text-error border border-error/20 text-xs font-bold uppercase tracking-widest">
              <Maximize className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tela Cheia</span>
            </button>
          )}

          <button className="btn-primary py-2.5 px-4 sm:px-6 text-xs uppercase tracking-widest shadow-md" onClick={handleAutoFinish}>
            <span>Finalizar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-outline/30 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-primary to-[#06B6D4]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-headline font-black text-xl shadow-sm border border-primary/20">
              {currentQuestionIdx + 1}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Questão Atual</span>
              <span className="text-sm font-bold text-on-surface">Progresso: {Object.keys(answers).length} de {totalQuestions}</span>
            </div>
            {flaggedQuestions.includes(currentQuestionIdx) && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-secondary/10 p-2 rounded-xl border border-secondary/20">
                <Flag className="w-4 h-4 text-secondary fill-secondary" />
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline rounded-2xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              Múltipla Escolha
            </div>
            {antiCheat.violations > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-error/10 border border-error/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-error">
                <AlertTriangle className="w-3.5 h-3.5" />
                {antiCheat.violations}/3 violações
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card-saas !p-0 overflow-hidden border-none shadow-xl shadow-primary/5 mb-8"
          >
            <div className="p-6 md:p-10 space-y-10">
              <div className="space-y-8">
                <h2 className="text-xl md:text-2xl font-bold text-on-surface leading-snug tracking-tight">
                  {currentQuestion?.enunciado || currentQuestion?.pergunta}
                </h2>
                {currentQuestion?.imagem_url && (
                  <div className="rounded-[32px] overflow-hidden border border-outline shadow-2xl shadow-primary/10">
                    <img src={currentQuestion.imagem_url} alt="Enunciado" className="w-full max-h-[400px] object-contain bg-surface-container-low" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(currentQuestion?.alternativas || currentQuestion?.respostas || []).map((opt: any, i: number) => (
                  <button
                    key={opt.id}
                    className={cn(
                      "w-full p-5 md:p-6 rounded-[20px] border-2 text-left transition-all flex items-start gap-5 group relative overflow-hidden",
                      answers[currentQuestion.id] === opt.id
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                        : "bg-surface-container-low border-outline hover:border-primary/30 hover:bg-surface-container-high"
                    )}
                    onClick={() => selectOption(opt.id)}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-black shrink-0 transition-all duration-300",
                      answers[currentQuestion.id] === opt.id
                        ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20"
                        : "bg-surface border-outline text-on-surface-variant group-hover:border-primary/50 group-hover:text-primary"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <p className={cn(
                      "text-sm md:text-base font-semibold leading-relaxed pt-1.5 transition-colors",
                      answers[currentQuestion.id] === opt.id ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"
                    )}>
                      {opt.texto}
                    </p>
                    {answers[currentQuestion.id] === opt.id && (
                      <motion.div layoutId="active-option" className="absolute right-6 top-1/2 -translate-y-1/2">
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

      {/* Footer */}
      <footer className="h-20 bg-surface-container border-t border-outline flex items-center justify-between px-4 md:px-10 sticky bottom-0 z-50 backdrop-blur-md bg-surface-container/90">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <button onClick={handlePrev} disabled={currentQuestionIdx === 0}
            className="flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl border border-outline text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:pointer-events-none font-bold text-xs uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Anterior</span>
          </button>
          <button onClick={() => setShowMap(true)}
            className="flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl border border-outline text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all font-bold text-xs uppercase tracking-widest">
            <LayoutGrid className="w-4 h-4" /><span className="hidden sm:inline">Ver Mapa</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <span className="text-[10px] sm:text-xs font-black text-on-surface-variant uppercase tracking-[0.15em] mb-0.5">
            Questão {currentQuestionIdx + 1} de {totalQuestions}
          </span>
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{Object.keys(answers).length} respondidas</span>
          </div>
        </div>
        <button onClick={handleNext}
          className="flex items-center gap-2 px-3 sm:px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-container transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
          <span className="hidden sm:inline">{currentQuestionIdx === totalQuestions - 1 ? 'Finalizar' : 'Próxima'}</span>
          <span className="inline sm:hidden">{currentQuestionIdx === totalQuestions - 1 ? 'Fim' : 'Próx'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* Question Map Modal */}
      <AnimatePresence>
        {showMap && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMap(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container p-0 w-full max-w-2xl rounded-[32px] shadow-2xl border border-outline overflow-hidden relative z-10">
              <div className="p-8 border-b border-outline flex items-center justify-between bg-surface-container-low">
                <div>
                  <h2 className="text-2xl font-bold font-headline text-on-surface tracking-tight">Mapa de Questões</h2>
                  <p className="text-sm text-on-surface-variant mt-1 font-medium">Navegue rapidamente entre as questões.</p>
                </div>
                <button onClick={() => setShowMap(false)} className="w-10 h-10 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant border border-outline">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Respondidas</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary" /><span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Para Revisão</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-outline" /><span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Pendentes</span></div>
                  </div>
                  <button onClick={() => setReviewFilter(!reviewFilter)}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border shadow-sm",
                      reviewFilter ? "bg-primary text-white border-primary" : "bg-surface-container-low text-on-surface-variant border-outline hover:bg-surface-container-high")}>
                    <Flag className={cn("w-3.5 h-3.5", reviewFilter && "fill-white")} />
                    {reviewFilter ? "Ver Todas" : "Ver Marcadas"}
                  </button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {Array.from({ length: totalQuestions }).map((_, i) => {
                    const qId = exam.perguntas[i].id;
                    const isFlagged = flaggedQuestions.includes(i);
                    const isAnswered = !!answers[qId];
                    const isCurrent = i === currentQuestionIdx;
                    if (reviewFilter && !isFlagged) return null;
                    return (
                      <button key={qId} onClick={() => { setCurrentQuestionIdx(i); setShowMap(false); }}
                        className={cn("aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative border-2",
                          isCurrent ? "border-primary scale-110 shadow-lg z-10" : "border-transparent",
                          isFlagged ? "bg-secondary/10 text-secondary border-secondary/20" : isAnswered ? "bg-primary/10 text-primary border-primary/20" : "bg-surface-container-low text-on-surface-variant border-outline hover:border-primary/20"
                        )}>
                        <span className="text-sm font-black">{i + 1}</span>
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
                <button onClick={() => setShowMap(false)} className="btn-primary px-8 py-3 text-sm uppercase tracking-widest">Fechar Mapa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: screen.width,
    screenHeight: screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    timestamp: new Date().toISOString(),
  };
}

export default StudentExamPage;
