import React, { useState } from 'react';
import { 
  X, 
  Brain, 
  Sparkles, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Type,
  LayoutList,
  CheckSquare,
  ChevronRight,
  Target,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { supabase } from '../services/supabase';
import { Question } from '../types';

interface AIGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: Question[]) => void;
}

export function AIGenerator({ isOpen, onClose, onQuestionsGenerated }: AIGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [difficulty, setDifficulty] = useState('Intermediário');
  const [type, setType] = useState('multiple');
  const [step, setStep] = useState(1);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Por favor, informe um tema para as questões.');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: { topic, difficulty, quantity, type }
      });

      if (error) throw error;
      if (!data?.questions) throw new Error('Nenhuma questão gerada.');

      const generatedQuestions: Question[] = data.questions.map((q: any, idx: number) => ({
        id: `ai-${Date.now()}-${idx}`,
        type: q.type || type,
        text: q.text || q.enunciado,
        options: q.options || q.alternativas || [],
        correct: typeof q.correct === 'number' ? q.correct : 0,
        points: q.points || 1,
        explanation: q.explanation || q.explicacao || '',
        imagem_url: q.imagem_url || ''
      }));

      onQuestionsGenerated(generatedQuestions);
      toast.success(`${generatedQuestions.length} questões geradas com sucesso!`);
      onClose();
      // Reset state
      setStep(1);
      setTopic('');
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      toast.error('Erro ao gerar questões: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const difficultyLevels = ['Iniciante', 'Intermediário', 'Avançado', 'Especialista'];
  const questionTypes = [
    { id: 'multiple', label: 'Múltipla Escolha', icon: CheckSquare, color: 'text-primary' },
    { id: 'list', label: 'Lista', icon: LayoutList, color: 'text-blue-500' },
    { id: 'text', label: 'Dissertativa', icon: Type, color: 'text-amber-500' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isGenerating ? undefined : onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-surface rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-outline flex items-center justify-between bg-surface-container-low/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
                  <Brain className="w-6 h-6" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-on-surface font-headline tracking-tight">Gerador de Questões IA</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Crie avaliações profissionais em segundos</p>
                </div>
              </div>
              {!isGenerating && (
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-surface-container rounded-full transition-all text-on-surface-variant hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xl font-bold font-headline">A IA está trabalhando...</h4>
                    <p className="text-on-surface-variant max-w-sm mx-auto">
                      Estamos analisando o tema e gerando as melhores questões para sua prova. Isso pode levar alguns segundos.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processando com Lovable AI
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Theme & Topic */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">1</span>
                      <h4 className="text-lg font-bold font-headline">Qual o tema da avaliação?</h4>
                    </div>
                    <div className="space-y-4">
                      <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Fundamentos de Logística e Cadeia de Suprimentos, Noções de Direito Administrativo..."
                        className="input-saas w-full min-h-[120px] resize-none py-4 text-lg font-medium"
                        disabled={isGenerating}
                      />
                      <div className="flex flex-wrap gap-2">
                        {['Logística', 'Marketing', 'Finanças', 'Programação', 'Direito'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setTopic(prev => prev ? `${prev}, ${t}` : t)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-high text-[10px] font-bold text-on-surface-variant hover:bg-primary hover:text-white transition-all border border-outline"
                          >
                            + {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center font-bold text-sm">2</span>
                        <h4 className="text-lg font-bold font-headline">Configurações</h4>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                            Dificuldade
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {difficultyLevels.map(d => (
                              <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={cn(
                                  "py-3 rounded-xl border-2 text-xs font-bold transition-all",
                                  difficulty === d 
                                    ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5" 
                                    : "bg-surface-container-low border-outline text-on-surface-variant hover:border-primary/30"
                                )}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                            Quantidade de Questões
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="1"
                              max="15"
                              value={quantity}
                              onChange={(e) => setQuantity(Number(e.target.value))}
                              className="flex-1 h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <span className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20">
                              {quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm">3</span>
                        <h4 className="text-lg font-bold font-headline">Tipo de Questão</h4>
                      </div>

                      <div className="space-y-3">
                        {questionTypes.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setType(t.id)}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                              type === t.id 
                                ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                                : "bg-surface-container-low border-outline text-on-surface-variant hover:border-primary/30"
                            )}
                          >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/50", t.color)}>
                              <t.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={cn("text-sm font-black uppercase tracking-widest", type === t.id ? "text-primary" : "text-on-surface-variant")}>
                                {t.label}
                              </p>
                              <p className="text-[10px] font-medium opacity-50">Gere questões no formato {t.label.toLowerCase()}</p>
                            </div>
                            {type === t.id && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary Tip */}
                  <div className="bg-surface-container p-6 rounded-[24px] border border-outline flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface mb-1">Dica da Lovable IA</p>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        Ao gerar questões para o nível <strong>{difficulty}</strong>, nossa IA focará em conceitos {difficulty === 'Iniciante' ? 'fundamentais' : difficulty === 'Especialista' ? 'extremamente complexos e práticos' : 'desafiadores e aplicados'}.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!isGenerating && (
              <div className="p-8 bg-surface-container-low border-t border-outline flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-8 py-4 font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim()}
                  className="btn-primary px-10 py-4 flex items-center gap-3 shadow-2xl shadow-primary/30 group"
                >
                  <Brain className="w-5 h-5" />
                  <span>Gerar {quantity} Questões</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
