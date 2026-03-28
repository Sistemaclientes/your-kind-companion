import React, { useState } from 'react';
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

export function CreateExamPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, type: 'multiple', text: '', options: ['', '', '', ''], correct: 0, points: 1, explanation: '' }
  ]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState('Administração');
  const [settings, setSettings] = useState({
    random: true,
    results: true,
    review: true,
    lock: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [openTypeDropdownId, setOpenTypeDropdownId] = useState<number | null>(null);

  React.useEffect(() => {
    if (id) {
      const fetchExam = async () => {
        try {
          const exam = await api.get(`/provas/${id}`);
          setTitle(exam.titulo);
          setDescription(exam.descricao);
          // Map backend questions to frontend format if necessary
          if (exam.perguntas) {
            const mappedQuestions = exam.perguntas.map((q: any, idx: number) => ({
              id: q.id || idx + 1,
              type: 'multiple',
              text: q.enunciado,
              options: q.alternativas.map((a: any) => a.texto),
              // We'd need to fetch the correct alternative ID from the backend to map it safely
              // but for now let's assume index 0 if not provided
              correct: 0, 
              points: 1,
              explanation: ''
            }));
            setQuestions(mappedQuestions);
          }
        } catch (err) {
          console.error('Error fetching exam:', err);
        }
      };
      fetchExam();
    }
  }, [id]);

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Por favor, insira um título para a prova.');
      setActiveTab('settings');
      return;
    }

    setIsPublishing(true);
    
    try {
      // Map frontend format to backend format
      const payload = {
        titulo: title,
        descricao: description,
        perguntas: questions.map(q => ({
          enunciado: q.text,
          alternativas: q.options.map((opt, idx) => ({
            texto: opt,
            is_correta: idx === q.correct
          }))
        }))
      };

      if (id) {
        await api.post(`/provas/${id}`, payload); // Assuming update is also POST or I should use PUT
      } else {
        await api.post('/provas', payload);
      }

      navigate('/admin/exams');
    } catch (err: any) {
      alert(err.message || 'Erro ao publicar prova');
    } finally {
      setIsPublishing(false);
    }
  };

  const addQuestion = (type: string = 'multiple', index?: number) => {
    const newId = Math.max(0, ...questions.map(q => q.id)) + 1;
    const newQuestion = { 
      id: newId, 
      type, 
      text: '', 
      options: ['', '', '', ''], 
      correct: 0,
      points: 1,
      explanation: ''
    };

    if (typeof index === 'number') {
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      setQuestions(newQuestions);
    } else {
      setQuestions([...questions, newQuestion]);
    }
  };

  const duplicateQuestion = (id: number) => {
    const questionToCopy = questions.find(q => q.id === id);
    if (questionToCopy) {
      const newId = Math.max(0, ...questions.map(q => q.id)) + 1;
      setQuestions([...questions, { ...questionToCopy, id: newId }]);
    }
  };

  const removeQuestion = (id: number) => {
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
              <span className="hidden sm:inline">{isPublishing ? 'Salvando...' : id ? 'Salvar' : 'Publicar'}</span>
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
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" />
                        Categoria
                      </label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-saas w-full h-14 text-lg font-semibold appearance-none cursor-pointer"
                      >
                        <option value="Administração">Administração</option>
                        <option value="Ambiental">Ambiental</option>
                        <option value="Arquitetura e Engenharia">Arquitetura e Engenharia</option>
                        <option value="Concursos Públicos">Concursos Públicos</option>
                        <option value="Contabilidade">Contabilidade</option>
                        <option value="Cotidiano">Cotidiano</option>
                        <option value="Cursos Profissionalizantes">Cursos Profissionalizantes</option>
                        <option value="Desenvolvimento Pessoal">Desenvolvimento Pessoal</option>
                        <option value="Enfermagem">Enfermagem</option>
                        <option value="Finanças">Finanças</option>
                        <option value="Gestão e Liderança">Gestão e Liderança</option>
                        <option value="Idiomas">Idiomas</option>
                        <option value="Informática">Informática</option>
                        <option value="Logística">Logística</option>
                        <option value="Programação e Desenvolvimento">Programação e Desenvolvimento</option>
                        <option value="Publicidade e Marketing">Publicidade e Marketing</option>
                        <option value="Recursos Humanos">Recursos Humanos</option>
                        <option value="Segurança do Trabalho">Segurança do Trabalho</option>
                        <option value="Vendas">Vendas</option>
                      </select>
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
                        { id: 'review', label: 'Permitir Revisão', desc: 'O aluno poderá revisar suas respostas antes de enviar.' },
                        { id: 'lock', label: 'Bloquear Navegação', desc: 'Impede o aluno de sair da aba da prova durante a execução.' }
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
                      <div className="bg-surface-container-low/50 px-8 py-5 border-b border-outline flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 text-on-surface-variant/30 hover:text-on-surface-variant cursor-grab active:cursor-grabbing transition-colors">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">
                            {idx + 1}
                          </div>
                          <div className="h-4 w-px bg-outline"></div>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenTypeDropdownId(openTypeDropdownId === q.id ? null : q.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-xl border border-outline text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:border-primary transition-all"
                            >
                              {q.type === 'multiple' && <CheckSquare className="w-4 h-4 text-primary" />}
                              {q.type === 'list' && <LayoutList className="w-4 h-4 text-blue-500" />}
                              {q.type === 'text' && <Type className="w-4 h-4 text-amber-500" />}
                              {q.type === 'multiple' ? 'Múltipla Escolha' : q.type === 'list' ? 'Lista' : 'Dissertativa'}
                              <ChevronDown className={cn("w-4 h-4 ml-1 opacity-50 transition-transform", openTypeDropdownId === q.id && "rotate-180")} />
                            </button>
                            
                            <AnimatePresence>
                              {openTypeDropdownId === q.id && (
                                <>
                                  <div className="fixed inset-0 z-[5]" onClick={() => setOpenTypeDropdownId(null)} />
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-2 w-56 bg-surface-container rounded-2xl shadow-2xl border border-outline z-10 p-2"
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
                                        className="w-full flex items-center gap-4 p-3.5 rounded-xl hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all"
                                      >
                                        <type.icon className={cn("w-5 h-5", type.color)} />
                                        {type.label}
                                      </button>
                                    ))}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-surface-container px-4 py-2 rounded-xl border border-outline">
                            <Target className="w-4 h-4 text-primary/40" />
                            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Pontos:</span>
                            <input 
                              type="number" 
                              className="w-10 text-sm font-black text-primary bg-transparent border-none p-0 focus:ring-0" 
                              value={q.points}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[idx].points = Number(e.target.value);
                                setQuestions(newQuestions);
                              }}
                            />
                          </div>
                          <div className="h-6 w-px bg-outline"></div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => duplicateQuestion(q.id)}
                              className="p-2.5 text-on-surface-variant/50 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                              title="Duplicar"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => removeQuestion(q.id)}
                              className="p-2.5 text-on-surface-variant/50 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                              title="Excluir"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-10 space-y-10">
                        <div className="relative group/input">
                          <textarea 
                            className="w-full text-2xl font-bold text-on-surface border-none p-0 focus:ring-0 placeholder:text-on-surface-variant/20 bg-transparent resize-none leading-tight font-headline" 
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
                        <div className="grid grid-cols-1 gap-5">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-5 group/opt">
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
                                  "w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-sm font-black transition-all shrink-0",
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
                                    "input-saas w-full h-14 text-base font-semibold",
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
                                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg">
                                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Gabarito</span>
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

            <div className="bg-primary p-8 rounded-[32px] text-white relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold font-headline text-lg mb-2">Dica de Especialista</h4>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Questões com imagens aumentam o engajamento e a compreensão em até 40%. Tente adicionar diagramas onde for possível.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>

      {/* Floating Action Menu */}
      <AnimatePresence>
        {activeTab === 'content' && (
          <motion.div 
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-surface-container/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[32px] p-2 border border-outline flex items-center gap-2">
              <button 
                onClick={() => addQuestion('multiple')}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest">Múltipla</p>
                  <p className="text-[10px] opacity-50 font-medium">Escolha única</p>
                </div>
              </button>
              
              <div className="w-px h-10 bg-outline mx-2"></div>
              
              <button 
                onClick={() => addQuestion('list')}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-blue-500/10 text-on-surface-variant hover:text-blue-500 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <LayoutList className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest">Lista</p>
                  <p className="text-[10px] opacity-50 font-medium">Múltiplas opções</p>
                </div>
              </button>
              
              <div className="w-px h-10 bg-outline mx-2"></div>
              
              <button 
                onClick={() => addQuestion('text')}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-amber-500/10 text-on-surface-variant hover:text-amber-500 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Type className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest">Dissertativa</p>
                  <p className="text-[10px] opacity-50 font-medium">Texto livre</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
