import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  Eye,
  ChevronDown,
  LayoutList,
  CheckSquare,
  Type,
  Copy,
  Settings as SettingsIcon,
  ListChecks,
  Clock,
  Target,
  GripVertical,
  Brain,
  Info,
  Tag
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Question } from '../types';
import { CategoryModal } from '../components/CategoryModal';
import { AIGenerator } from '../components/AIGenerator';

export function CreateExamPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [examId, setExamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('settings');
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, type: 'multiple', text: '', options: ['', '', '', ''], correct: 0, points: 1, explanation: '', imagem_url: '' }
  ]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState('Administração');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    random: true,
    results: true,
    review: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [openTypeDropdownId, setOpenTypeDropdownId] = useState<string | number | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.get('/categorias');
      const categoriesArray = Array.isArray(data) ? data : [];
      setCategories(categoriesArray);
      
      // Update selected category if it's not set or not in the new list
      if (categoriesArray.length > 0) {
        if (!categoryId) {
          setCategoryId(categoriesArray[0].id);
          setCategory(categoriesArray[0].nome);
        } else {
          const currentCat = categoriesArray.find(c => c.id === categoryId);
          if (currentCat) {
            setCategory(currentCat.nome);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Ensure it's an array on error
    }
  }, [categoryId]);

  React.useEffect(() => {
    fetchCategories();

    if (slug) {
      const fetchExam = async () => {
        try {
          let exam: any = null;
          try {
            exam = await api.get(`/provas/slug/${slug}`);
          } catch (slugErr) {
            exam = await api.get(`/provas/${slug}`);
          }
          setExamId(exam?.id?.toString() || null);
          setTitle(exam.titulo);
          setDescription(exam.descricao);
          setDuration(exam.duracao || 60);
          setCategoryId(exam.categoria_id || null);
          
          if (exam.perguntas) {
            const mappedQuestions = exam.perguntas.map((q: any, idx: number) => ({
              id: q.id || idx + 1,
              type: q.tipo || 'multiple',
              text: q.enunciado,
              imagem_url: q.imagem_url || '',
              options: q.alternativas.map((a: any) => a.texto),
              correct: q.alternativas.findIndex((a: any) => a.is_correta),
              points: q.pontos || 1,
              explanation: q.explicacao || ''
            }));
            setQuestions(mappedQuestions);
          }
        } catch (err) {
          console.error('Error fetching exam:', err);
        }
      };
      fetchExam();
    }
  }, [slug]);

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('Por favor, insira um título para a prova.');
      setActiveTab('settings');
      return;
    }

    setIsPublishing(true);
    
    try {
      // Map frontend format to backend format
      const payload = {
        titulo: title,
        descricao: description,
        categoria_id: categoryId,
        duracao: duration,
        embaralhar_questoes: settings.random,
        mostrar_resultado: settings.results,
        permitir_revisao: settings.review,
        perguntas: questions.map(q => ({
          enunciado: q.text,
          tipo: q.type,
          pontos: q.points,
          explicacao: q.explanation,
          imagem_url: q.imagem_url,
          alternativas: q.options.map((opt, idx) => ({
            texto: opt,
            is_correta: idx === q.correct
          }))
        }))
      };

      if (examId) {
        await api.put(`/provas/${examId}`, payload);
      } else {
        await api.post('/provas', payload);
      }

      navigate('/admin/exams');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao publicar prova');
    } finally {
      setIsPublishing(false);
    }
  };

  const addQuestion = (type: string = 'multiple', index?: number) => {
    const newId = Math.max(0, ...questions.map(q => typeof q.id === 'number' ? q.id : 0)) + 1;
    const newQuestion: Question = { 
      id: newId, 
      type, 
      text: '', 
      options: ['', '', '', ''], 
      correct: 0,
      points: 1,
      explanation: '',
      imagem_url: ''
    };

    if (typeof index === 'number') {
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      setQuestions(newQuestions);
    } else {
      setQuestions([...questions, newQuestion]);
    }
  };

  const duplicateQuestion = (id: number | string) => {
    const questionToCopy = questions.find(q => q.id === id);
    if (questionToCopy) {
      const newId = Math.max(0, ...questions.map(q => typeof q.id === 'number' ? q.id : 0)) + 1;
      setQuestions([...questions, { ...questionToCopy, id: newId }]);
    }
  };

  const removeQuestion = (id: number | string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const totalPoints = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 bg-surface-container/80 backdrop-blur-md border-b border-outline z-50">
        <div className="flex items-center justify-between px-3 sm:px-6 h-16 sm:h-20">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button 
              className="p-2 hover:bg-surface-container-high rounded-xl text-on-surface-variant transition-all shrink-0"
              onClick={() => navigate('/admin/exams')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="hidden sm:block h-8 w-px bg-outline shrink-0"></div>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-primary/20 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Salvo
            </div>
            <nav className="flex items-center gap-4 sm:gap-8 ml-2 sm:ml-4">
              <button 
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "text-xs sm:text-sm font-bold transition-all relative py-5 sm:py-7 group whitespace-nowrap",
                  activeTab === 'settings' ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                Config.
                {activeTab === 'settings' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('content')}
                className={cn(
                  "text-xs sm:text-sm font-bold transition-all relative py-5 sm:py-7 group",
                  activeTab === 'content' ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                Questões
                {activeTab === 'content' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden xl:flex items-center gap-6 mr-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low px-5 py-2.5 rounded-2xl border border-outline">
              <span className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary/60" />
                {questions.length} Questões
              </span>
              <div className="w-px h-4 bg-outline"></div>
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-secondary/60" />
                {totalPoints} Pontos
              </span>
            </div>
            <button 
              onClick={() => setShowPreview(true)}
              className="hidden sm:flex px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-all items-center gap-2 rounded-xl hover:bg-primary/5"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">Visualizar</span>
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className={cn(
                "btn-primary px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm",
                isPublishing && "opacity-70 cursor-not-allowed"
              )}
            >
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
               <span className="hidden sm:inline">{isPublishing ? 'Salvando...' : examId ? 'Salvar' : 'Publicar'}</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl border border-outline overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-outline flex items-center justify-between bg-surface-container-low/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-headline tracking-tight">Visualização da Prova</h2>
                    <p className="text-xs text-on-surface-variant font-medium">Veja como os alunos visualizarão sua avaliação</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="w-12 h-12 rounded-2xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-all hover:rotate-90"
                >
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar bg-surface/30">
                {questions.map((q, i) => (
                  <div key={q.id} className="space-y-8">
                    <div className="flex items-start gap-6">
                      <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-primary/20">
                        {i + 1}
                      </span>
                      <p className="text-xl font-bold text-on-surface leading-snug font-headline">
                        {q.text || <span className="italic opacity-30 font-normal">Questão sem enunciado...</span>}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 ml-16">
                      {q.options.map((opt, optIdx) => (
                        <div 
                          key={optIdx}
                          className={cn(
                            "p-5 rounded-[20px] border-2 transition-all flex items-center gap-5 group",
                            optIdx === q.correct 
                              ? "bg-primary/5 border-primary/30 text-on-surface" 
                              : "bg-surface-container border-outline hover:border-primary/20 text-on-surface-variant"
                          )}
                        >
                          <span className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors",
                            optIdx === q.correct ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
                          )}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-base font-semibold">{opt || <span className="italic opacity-30 font-normal">Sem alternativa...</span>}</span>
                          {optIdx === q.correct && (
                            <div className="ml-auto flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg">
                              <CheckSquare className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Gabarito</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 border-t border-outline bg-surface-container-low/50 flex justify-end">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="btn-primary px-10 py-3"
                >
                  Fechar Visualização
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-20 sm:pt-28 pb-32 px-3 sm:px-8 max-w-[1600px] mx-auto transition-all duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {activeTab === 'settings' ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="card-saas !p-5 sm:!p-10 space-y-8 sm:space-y-10">
                  <div className="flex items-center gap-4 border-b border-outline pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <SettingsIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-headline tracking-tight">Configurações Gerais</h2>
                      <p className="text-sm text-on-surface-variant">Defina as informações básicas e regras da sua avaliação</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                        Título da Prova
                        <Info className="w-3.5 h-3.5 opacity-50" />
                      </label>
                      <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Avaliação de Lógica - Nível Pleno"
                        className="input-saas w-full h-14 text-lg font-semibold"
                      />
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Descrição / Instruções</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva o objetivo da prova e as instruções para os alunos..."
                        className="input-saas w-full min-h-[140px] resize-none py-4"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Duração (minutos)
                      </label>
                      <input 
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="input-saas w-full h-14 text-lg font-semibold"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5" />
                          Categoria
                        </label>
                        <button 
                          type="button"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Gerenciar
                        </button>
                      </div>
                      <div className="relative group">
                        <select 
                          value={categoryId || ''}
                          onChange={(e) => {
                            const id = e.target.value;
                            setCategoryId(id);
                            const cat = categories.find(c => c.id === id);
                            if (cat) setCategory(cat.nome);
                          }}
                          className="input-saas w-full h-14 text-lg font-semibold appearance-none cursor-pointer pr-12"
                        >
                          {Array.isArray(categories) && categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nome}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-outline space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <ListChecks className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold font-headline">Regras da Avaliação</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { id: 'random', label: 'Aleatorizar Questões', desc: 'As questões aparecerão em ordem diferente para cada aluno.' },
                        { id: 'results', label: 'Mostrar Resultado Imediato', desc: 'O aluno verá sua nota logo após finalizar a prova.' },
                        { id: 'review', label: 'Permitir Revisão', desc: 'O aluno poderá revisar suas respostas antes de enviar.' }
                      ].map(setting => (
                        <label key={setting.id} className="flex items-start gap-4 p-5 rounded-2xl border border-outline hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group">
                          <div className="relative flex items-center h-5 mt-1">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-outline text-primary focus:ring-primary transition-all cursor-pointer bg-surface-container" 
                              checked={settings[setting.id as keyof typeof settings]}
                              onChange={(e) => setSettings({ ...settings, [setting.id]: e.target.checked })}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{setting.label}</p>
                            <p className="text-xs text-on-surface-variant leading-relaxed mt-1">{setting.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {questions.map((q, idx) => (
                  <motion.div 
                    key={q.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="group relative"
                  >
                    <div className="card-saas !p-0 overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all">
                      <div className="bg-surface-container-low/50 px-4 sm:px-8 py-4 sm:py-5 border-b border-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          <div className="p-1.5 sm:p-2 text-on-surface-variant/30 hover:text-on-surface-variant cursor-grab active:cursor-grabbing transition-colors hidden sm:block">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20">
                            {idx + 1}
                          </div>
                          <div className="h-4 w-px bg-outline hidden sm:block"></div>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenTypeDropdownId(openTypeDropdownId === q.id ? null : q.id)}
                              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-surface-container rounded-lg sm:rounded-xl border border-outline text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:border-primary transition-all"
                            >
                              {q.type === 'multiple' && <CheckSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />}
                              {q.type === 'list' && <LayoutList className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-500" />}
                              {q.type === 'text' && <Type className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-500" />}
                              <span className="hidden sm:inline">{q.type === 'multiple' ? 'Múltipla Escolha' : q.type === 'list' ? 'Lista' : 'Dissertativa'}</span>
                              <ChevronDown className={cn("w-3.5 h-3.5 opacity-50 transition-transform", openTypeDropdownId === q.id && "rotate-180")} />
                            </button>
                            
                            <AnimatePresence>
                              {openTypeDropdownId === q.id && (
                                <>
                                  <div className="fixed inset-0 z-[5]" onClick={() => setOpenTypeDropdownId(null)} />
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-2 w-48 sm:w-56 bg-surface-container rounded-2xl shadow-2xl border border-outline z-10 p-2"
                                  >
                                    {[
                                      { id: 'multiple', label: 'Múltipla Escolha', icon: CheckSquare, color: 'text-primary' },
                                      { id: 'list', label: 'Lista', icon: LayoutList, color: 'text-blue-500' },
                                      { id: 'text', label: 'Dissertativa', icon: Type, color: 'text-amber-500' }
                                    ].map(type => (
                                      <button 
                                        key={type.id}
                                        onClick={() => {
                                          const newQuestions = [...questions];
                                          newQuestions[idx].type = type.id;
                                          setQuestions(newQuestions);
                                          setOpenTypeDropdownId(null);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all"
                                      >
                                        <type.icon className={cn("w-4 h-4", type.color)} />
                                        {type.label}
                                      </button>
                                    ))}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="flex items-center gap-2 sm:gap-3 bg-surface-container px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-outline">
                            <Target className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary/40" />
                            <span className="text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Pts:</span>
                            <input 
                              type="number" 
                              className="w-8 sm:w-10 text-sm font-black text-primary bg-transparent border-none p-0 focus:ring-0" 
                              value={q.points}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[idx].points = Number(e.target.value);
                                setQuestions(newQuestions);
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <button 
                              onClick={() => duplicateQuestion(q.id)}
                              className="p-2 sm:p-2.5 text-on-surface-variant/50 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                              title="Duplicar"
                            >
                              <Copy className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <button 
                              onClick={() => removeQuestion(q.id)}
                              className="p-2 sm:p-2.5 text-on-surface-variant/50 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5 sm:p-10 space-y-6 sm:space-y-10">
                        <div className="relative group/input">
                          <textarea 
                            className="w-full text-lg sm:text-2xl font-bold text-on-surface border-none p-0 focus:ring-0 placeholder:text-on-surface-variant/20 bg-transparent resize-none leading-tight font-headline" 
                            placeholder="Qual o enunciado desta questão?"
                            rows={2}
                            value={q.text}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[idx].text = e.target.value;
                              setQuestions(newQuestions);
                            }}
                          />
                          <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-primary scale-y-0 group-focus-within/input:scale-y-100 transition-transform origin-top rounded-full" />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5" />
                            URL da Imagem (Opcional)
                          </label>
                          <input 
                            type="text"
                            value={q.imagem_url || ''}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[idx].imagem_url = e.target.value;
                              setQuestions(newQuestions);
                            }}
                            placeholder="https://exemplo.com/imagem.png"
                            className="input-saas w-full h-12 text-sm"
                          />
                        </div>

                        {q.type === 'text' ? (
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Resposta esperada (referência)</label>
                            <textarea 
                              className="input-saas w-full min-h-[120px] resize-none py-4 text-sm font-medium"
                              placeholder="Escreva aqui a resposta esperada como referência para correção..."
                              value={q.options[0] || ''}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[idx].options = [e.target.value];
                                setQuestions(newQuestions);
                              }}
                            />
                          </div>
                        ) : (
                        <div className="grid grid-cols-1 gap-4 sm:gap-5">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2 sm:gap-5 group/opt">
                              <button 
                                onClick={() => {
                                  const newQuestions = [...questions];
                                  if (q.type === 'list') {
                                    // Toggle selection for list type (multiple correct)
                                    newQuestions[idx].correct = optIdx;
                                  } else {
                                    newQuestions[idx].correct = optIdx;
                                  }
                                  setQuestions(newQuestions);
                                }}
                                className={cn(
                                  "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center text-xs sm:text-sm font-black transition-all shrink-0",
                                  optIdx === q.correct 
                                    ? q.type === 'list' 
                                      ? "bg-blue-500 border-blue-500 text-white shadow-xl shadow-blue-500/20"
                                      : "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                                    : "bg-surface-container border-outline text-on-surface-variant hover:border-primary/30 hover:bg-primary/5"
                                )}
                              >
                                {q.type === 'list' ? (
                                  <CheckSquare className="w-5 h-5" />
                                ) : (
                                  String.fromCharCode(65 + optIdx)
                                )}
                              </button>
                              <div className="flex-1 relative">
                                <input 
                                  className={cn(
                                    "input-saas w-full h-11 sm:h-14 text-sm sm:text-base font-semibold",
                                    optIdx === q.correct 
                                      ? q.type === 'list' ? "bg-blue-500/5 border-blue-500/20" : "bg-primary/5 border-primary/20" 
                                      : ""
                                  )} 
                                  placeholder={q.type === 'list' ? `Item ${optIdx + 1}...` : `Alternativa ${String.fromCharCode(65 + optIdx)}...`}
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newQuestions = [...questions];
                                    newQuestions[idx].options[optIdx] = e.target.value;
                                    setQuestions(newQuestions);
                                  }}
                                />
                                {optIdx === q.correct && q.type !== 'list' && (
                                  <div className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-primary/10 px-2 sm:px-3 py-1 rounded-lg">
                                    <CheckSquare className="w-3 h-3 text-primary" />
                                    <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-widest hidden sm:inline">Gabarito</span>
                                  </div>
                                )}
                              </div>
                              {q.options.length > 2 && (
                                <button 
                                  onClick={() => {
                                    const newQuestions = [...questions];
                                    newQuestions[idx].options = q.options.filter((_, i) => i !== optIdx);
                                    if (newQuestions[idx].correct >= newQuestions[idx].options.length) {
                                      newQuestions[idx].correct = 0;
                                    }
                                    setQuestions(newQuestions);
                                  }}
                                  className="p-2 text-on-surface-variant hover:text-error opacity-0 group-hover/opt:opacity-100 transition-all"
                                >
                                  <Plus className="w-6 h-6 rotate-45" />
                                </button>
                              )}
                            </div>
                          ))}
                          {q.options.length < 5 && (
                            <button 
                              onClick={() => {
                                const newQuestions = [...questions];
                                newQuestions[idx].options.push('');
                                setQuestions(newQuestions);
                              }}
                              className="w-full py-4 border-2 border-dashed border-outline rounded-2xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
                            >
                              <Plus className="w-5 h-5" />
                              {q.type === 'list' ? 'Adicionar Item' : 'Adicionar Alternativa'}
                            </button>
                          )}
                        </div>
                        )}

                        <div className="space-y-4 pt-8 border-t border-outline">
                          <div className="flex items-center gap-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                            <Brain className="w-4 h-4 text-primary/60" />
                            Explicação da Resposta (Opcional)
                          </div>
                          <textarea 
                            className="input-saas w-full min-h-[100px] resize-none py-4 text-sm font-medium" 
                            placeholder="Explique por que esta é a resposta correta para ajudar no aprendizado do aluno..."
                            rows={2}
                            value={q.explanation}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[idx].explanation = e.target.value;
                              setQuestions(newQuestions);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative h-12 group/add flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-outline group-hover/add:bg-primary/20 transition-colors" />
                      </div>
                      <button 
                        onClick={() => addQuestion('multiple', idx)}
                        className="relative z-10 w-10 h-10 rounded-2xl bg-surface-container border border-outline shadow-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary hover:scale-110 transition-all opacity-0 group-hover/add:opacity-100"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button 
                className="w-full py-12 border-2 border-dashed border-outline rounded-[40px] text-on-surface-variant font-bold flex flex-col items-center justify-center gap-4 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
                onClick={() => addQuestion()}
              >
                <div className="w-16 h-16 rounded-3xl bg-surface-container-low flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-headline">Adicionar nova questão</p>
                  <p className="text-xs font-medium opacity-60 uppercase tracking-widest mt-1">Múltipla escolha por padrão</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-28 space-y-8">
            <div className="card-saas !p-8 space-y-8">
              <div className="flex items-center gap-3 border-b border-outline pb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ListChecks className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-headline">Resumo da Prova</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-surface-container rounded-2xl border border-outline">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <ListChecks className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Questões</p>
                      <p className="text-lg font-black text-on-surface">{questions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-surface-container rounded-2xl border border-outline">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Total de Pontos</p>
                      <p className="text-lg font-black text-on-surface">{totalPoints}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-outline">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Navegação Rápida</h4>
                  <span className="px-2 py-1 bg-surface-container rounded-md text-[9px] font-black text-on-surface-variant border border-outline">AUTO-SAVE</span>
                </div>
                <div className="grid grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                  {questions.map((q, i) => (
                    <button 
                      key={q.id}
                      className={cn(
                        "aspect-square rounded-xl border flex items-center justify-center text-xs font-black transition-all hover:scale-110",
                        q.text ? "bg-primary/5 border-primary/20 text-primary" : "bg-surface-container border-outline text-on-surface-variant"
                      )}
                      onClick={() => {
                        const el = document.getElementById(`question-${q.id}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => addQuestion()}
                    className="aspect-square rounded-xl border-2 border-dashed border-outline flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </aside>
      </div>
    </main>


      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryChange={fetchCategories}
      />

      <AIGenerator 
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onQuestionsGenerated={(newQuestions) => {
          setQuestions([...questions, ...newQuestions]);
        }}
      />
    </div>
  );
}

export default CreateExamPage;
