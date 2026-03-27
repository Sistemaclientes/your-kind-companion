import React from 'react';
import { TopBar } from '@/src/components/TopBar';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  FileText,
  ChevronRight,
  X,
  Check,
  XCircle,
  Info
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export function StudentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedExam, setSelectedExam] = React.useState<any>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [studentData, setStudentData] = React.useState({
    name: 'Beatriz Helena Santos',
    email: 'beatriz.santos@email.com',
    phone: '(11) 98765-4321',
    location: 'São Paulo, SP',
    joined: '12 de Maio, 2023',
    status: 'Ativo',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    stats: [
      { label: 'Média Geral', value: '9.2', icon: TrendingUp, color: 'emerald' },
      { label: 'Provas Realizadas', value: '14', icon: FileText, color: 'blue' },
      { label: 'Tempo Médio', value: '42min', icon: Clock, color: 'purple' },
      { label: 'Aproveitamento', value: '94%', icon: CheckCircle2, color: 'orange' },
    ],
    history: [
      { 
        id: '1',
        exam: 'Matemática Básica', 
        date: '20 Out, 2023', 
        score: '9.5', 
        status: 'Aprovado',
        questions: [
          {
            text: 'Qual o valor de X na equação 2x + 5 = 15?',
            options: ['X = 5', 'X = 10', 'X = 2', 'X = 7'],
            correct: 0,
            studentAnswer: 0,
            explanation: 'Subtraindo 5 de ambos os lados: 2x = 10. Dividindo por 2: x = 5.'
          },
          {
            text: 'Quanto é 15% de 200?',
            options: ['20', '30', '40', '15'],
            correct: 1,
            studentAnswer: 1,
            explanation: '15% de 200 = 0.15 * 200 = 30.'
          },
          {
            text: 'Qual a raiz quadrada de 144?',
            options: ['10', '11', '12', '14'],
            correct: 2,
            studentAnswer: 2,
            explanation: '12 * 12 = 144.'
          }
        ]
      },
      { 
        id: '2',
        exam: 'Física I', 
        date: '15 Out, 2023', 
        score: '8.8', 
        status: 'Aprovado',
        questions: [
          {
            text: 'Qual a unidade de medida de força no SI?',
            options: ['Joule', 'Watt', 'Newton', 'Pascal'],
            correct: 2,
            studentAnswer: 2,
            explanation: 'A unidade de força no Sistema Internacional é o Newton (N).'
          },
          {
            text: 'A primeira lei de Newton também é conhecida como:',
            options: ['Lei da Inércia', 'Lei da Ação e Reação', 'Lei da Gravitação', 'Princípio Fundamental'],
            correct: 0,
            studentAnswer: 1,
            explanation: 'A primeira lei de Newton é a Lei da Inércia.'
          }
        ]
      },
      { id: '3', exam: 'Química Orgânica', date: '02 Out, 2023', score: '9.2', status: 'Aprovado', questions: [] },
      { id: '4', exam: 'Literatura Brasileira', date: '28 Set, 2023', score: '9.8', status: 'Aprovado', questions: [] },
    ]
  });

  const [tempData, setTempData] = React.useState(studentData);

  const handleSaveProfile = () => {
    setStudentData(tempData);
    setIsEditing(false);
  };

  const student = studentData;

  return (
    <>
      <TopBar title="Painel Administrativo" subtitle="Detalhes do Aluno" />
      <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <button 
          className="flex items-center gap-2 text-text-secondary hover:text-primary font-bold text-xs uppercase tracking-widest mb-8 transition-all group"
          onClick={() => navigate('/admin/students')}
        >
          <div className="p-1.5 rounded-lg bg-background-light dark:bg-background-dark group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Voltar para lista
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card-saas p-8 text-center">
              <div className="relative inline-block mb-6">
                <div className="p-1 rounded-full bg-gradient-to-tr from-primary to-secondary">
                  <img 
                    alt={student.name} 
                    className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-cards-dark shadow-xl" 
                    src={student.img}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className={cn(
                  "absolute bottom-2 right-2 w-6 h-6 border-4 border-white dark:border-cards-dark rounded-full shadow-sm",
                  student.status === 'Ativo' ? "bg-green-500" : 
                  student.status === 'Inativo' ? "bg-red-500" :
                  "bg-orange-500"
                )}></div>
              </div>
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary font-headline tracking-tight">{student.name}</h2>
                <div className={cn(
                  "mt-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                  student.status === 'Ativo' && "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
                  student.status === 'Inativo' && "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
                  student.status === 'Pendente' && "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
                )}>
                  {student.status}
                </div>
              </div>
              <p className="text-sm text-text-secondary font-semibold mb-6">Estudante de Engenharia</p>
              
              <div className="space-y-4 text-left border-t border-border pt-6">
                <div className="flex items-center gap-4 text-sm text-text-secondary font-medium">
                  <div className="w-9 h-9 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center text-primary/70 border border-border">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary font-medium">
                  <div className="w-9 h-9 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center text-primary/70 border border-border">
                    <Phone className="w-4 h-4" />
                  </div>
                  {student.phone}
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary font-medium">
                  <div className="w-9 h-9 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center text-primary/70 border border-border">
                    <MapPin className="w-4 h-4" />
                  </div>
                  {student.location}
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary font-medium">
                  <div className="w-9 h-9 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center text-primary/70 border border-border">
                    <Calendar className="w-4 h-4" />
                  </div>
                  Membro desde {student.joined}
                </div>
              </div>

              <button 
                onClick={() => {
                  setTempData(studentData);
                  setIsEditing(true);
                }}
                className="w-full mt-8 py-3.5 rounded-xl border border-primary/20 bg-primary/5 text-primary font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                Editar Perfil
              </button>
            </div>

            <div className="bg-secondary/10 dark:bg-secondary/5 p-6 rounded-2xl border border-secondary/20 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-secondary-dark dark:text-secondary">Observação</h4>
              </div>
              <p className="text-sm text-text-secondary dark:text-text-secondary/80 leading-relaxed relative z-10 font-medium">
                A aluna Beatriz tem demonstrado um desempenho excepcional em matérias de exatas, mantendo uma média acima de 9.0 em todas as avaliações deste semestre.
              </p>
            </div>
          </div>

          {/* Stats and History */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {student.stats.map((s, i) => (
                <div key={i} className="card-saas p-5 flex flex-col items-center text-center group hover:border-primary/30 transition-all">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                    s.color === 'emerald' && "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400",
                    s.color === 'blue' && "bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400",
                    s.color === 'purple' && "bg-purple-500/10 text-purple-600 dark:bg-purple-500/5 dark:text-purple-400",
                    s.color === 'orange' && "bg-orange-500/10 text-orange-600 dark:bg-orange-500/5 dark:text-orange-400",
                  )}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-text-primary font-headline">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="card-saas overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between bg-white/50 dark:bg-cards-dark/50 backdrop-blur-sm">
                <h4 className="text-lg font-bold text-text-primary font-headline tracking-tight">Histórico de Avaliações</h4>
                <button className="text-primary font-bold text-xs uppercase tracking-widest hover:text-primary-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5">Ver relatório completo</button>
              </div>
              <div className="divide-y divide-border">
                {student.history.map((item, i) => (
                  <div 
                    key={i} 
                    className="p-5 flex items-center justify-between hover:bg-background-light dark:hover:bg-background-dark/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedExam(item)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center text-text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all border border-border group-hover:border-primary/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-text-primary group-hover:text-primary transition-colors">{item.exam}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3 text-text-secondary" />
                          <p className="text-[11px] text-text-secondary font-medium">{item.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary font-headline leading-none">{item.score}</p>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Nota</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border",
                          item.status === 'Aprovado' 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400" 
                            : "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/5 dark:text-red-400"
                        )}>
                          {item.status}
                        </span>
                        <div className="p-1.5 rounded-lg bg-background-light dark:bg-background-dark group-hover:bg-primary/10 transition-all">
                          <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setIsEditing(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-cards-dark rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-border"
              >
                <div className="p-8 border-b border-border flex items-center justify-between bg-background-light/50 dark:bg-background-dark/50">
                  <h3 className="text-xl font-bold text-text-primary font-headline tracking-tight">Editar Perfil</h3>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-cards-dark border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  {[
                    { label: 'Nome Completo', value: tempData.name, key: 'name', type: 'text' },
                    { label: 'E-mail', value: tempData.email, key: 'email', type: 'email' },
                    { label: 'Telefone', value: tempData.phone, key: 'phone', type: 'text' },
                    { label: 'Localização', value: tempData.location, key: 'location', type: 'text' },
                    { label: 'Status', value: tempData.status, key: 'status', type: 'select', options: ['Ativo', 'Inativo', 'Pendente'] },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{field.label}</label>
                      {field.type === 'select' ? (
                        <select 
                          className="w-full bg-surface-container-low border border-outline rounded-2xl px-5 py-4 text-on-surface font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner appearance-none"
                          value={field.value}
                          onChange={(e) => setTempData({ ...tempData, [field.key]: e.target.value })}
                        >
                          {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type={field.type} 
                          className="w-full bg-surface-container-low border border-outline rounded-2xl px-5 py-4 text-on-surface font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner"
                          value={field.value}
                          onChange={(e) => setTempData({ ...tempData, [field.key]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-8 border-t border-border bg-background-light/50 dark:bg-background-dark/50 flex gap-4">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3.5 border border-border text-text-secondary font-bold rounded-xl hover:bg-white dark:hover:bg-cards-dark hover:text-text-primary transition-all shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="btn-primary flex-1 py-3.5"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Exam Results Modal */}
        <AnimatePresence>
          {selectedExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setSelectedExam(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-cards-dark rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-border"
              >
                {/* Modal Header */}
                <div className="p-8 border-b border-border flex items-center justify-between bg-background-light/50 dark:bg-background-dark/50">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-2xl font-bold text-text-primary font-headline tracking-tight">{selectedExam.exam}</h3>
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border",
                        selectedExam.status === 'Aprovado' 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400" 
                          : "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/5 dark:text-red-400"
                      )}>
                        {selectedExam.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        Realizada em {selectedExam.date}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-primary/60" />
                        Nota Final: <span className="text-primary font-bold">{selectedExam.score}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedExam(null)}
                    className="w-12 h-12 rounded-xl bg-white dark:bg-cards-dark border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                  {selectedExam.questions && selectedExam.questions.length > 0 ? (
                    selectedExam.questions.map((q: any, idx: number) => (
                      <div key={idx} className="space-y-6">
                        <div className="flex items-start gap-5">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 border border-primary/20">
                            {idx + 1}
                          </div>
                          <div className="space-y-6 flex-1">
                            <h5 className="text-lg font-bold text-text-primary leading-tight font-headline">{q.text}</h5>
                            
                            <div className="grid grid-cols-1 gap-3">
                              {q.options.map((opt: string, optIdx: number) => {
                                const isCorrect = optIdx === q.correct;
                                const isStudentAnswer = optIdx === q.studentAnswer;
                                
                                return (
                                  <div 
                                    key={optIdx}
                                    className={cn(
                                      "p-5 rounded-2xl border-2 transition-all flex items-center justify-between group",
                                      isCorrect && "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/5",
                                      isStudentAnswer && !isCorrect && "bg-red-500/5 border-red-500/20 dark:bg-red-500/5",
                                      !isCorrect && !isStudentAnswer && "bg-background-light dark:bg-background-dark/50 border-transparent hover:border-border"
                                    )}
                                  >
                                    <div className="flex items-center gap-5">
                                      <div className={cn(
                                        "w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all",
                                        isCorrect && "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20",
                                        isStudentAnswer && !isCorrect && "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20",
                                        !isCorrect && !isStudentAnswer && "border-border text-text-secondary bg-white dark:bg-cards-dark"
                                      )}>
                                        {String.fromCharCode(65 + optIdx)}
                                      </div>
                                      <span className={cn(
                                        "text-sm font-bold",
                                        isCorrect && "text-emerald-700 dark:text-emerald-400",
                                        isStudentAnswer && !isCorrect && "text-red-700 dark:text-red-400",
                                        !isCorrect && !isStudentAnswer && "text-text-primary"
                                      )}>
                                        {opt}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      {isCorrect && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                          <Check className="w-3.5 h-3.5" />
                                          <span className="text-[10px] font-bold uppercase tracking-widest">Correta</span>
                                        </div>
                                      )}
                                      {isStudentAnswer && !isCorrect && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                          <XCircle className="w-3.5 h-3.5" />
                                          <span className="text-[10px] font-bold uppercase tracking-widest">Sua Resposta</span>
                                        </div>
                                      )}
                                      {isStudentAnswer && isCorrect && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                          <span className="text-[10px] font-bold uppercase tracking-widest">Sua Resposta</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <div className="p-5 bg-primary/5 dark:bg-primary/5 rounded-2xl border border-primary/20 flex gap-4 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 relative z-10">
                                  <Info className="w-5 h-5" />
                                </div>
                                <div className="relative z-10">
                                  <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1.5">Explicação Detalhada</p>
                                  <p className="text-sm text-text-primary leading-relaxed font-medium">{q.explanation}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {idx < selectedExam.questions.length - 1 && <div className="h-px bg-border my-10" />}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 rounded-full bg-background-light dark:bg-background-dark flex items-center justify-center text-text-secondary/30 mx-auto mb-6 border border-border">
                        <FileText className="w-10 h-10" />
                      </div>
                      <p className="text-text-secondary font-bold text-lg">Nenhum detalhe disponível para esta avaliação.</p>
                      <p className="text-text-secondary/60 text-sm mt-1">Os detalhes das questões não foram registrados para este exame.</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-border bg-background-light/50 dark:bg-background-dark/50 flex justify-end">
                  <button 
                    onClick={() => setSelectedExam(null)}
                    className="btn-primary px-10 py-3.5"
                  >
                    Fechar Detalhes
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
