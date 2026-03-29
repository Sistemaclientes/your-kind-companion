import React from 'react';
import { TopBar } from '../components/TopBar';
import { 
  FileText, 
  Plus, 
  MoreVertical, 
  Edit, 
  Eye, 
  Link as LinkIcon,
  Filter,
  ArrowUpDown,
  Construction,
  Brain,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  X,
  Clock,
  Users,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

export function ExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [examToDelete, setExamToDelete] = React.useState<string | null>(null);
  const [dateFilter, setDateFilter] = React.useState('Todos');
  const [sortBy, setSortBy] = React.useState('Recentes');

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/provas');
      // Map backend fields to frontend format
      const mapped = data.map((e: any) => ({
        id: e.id,
        title: e.titulo,
        subtitle: e.descricao || 'Sem descrição',
        status: 'Ativa', // Default for now
        students: '0', // TODO: count real results
        date: new Date(e.created_at).toLocaleDateString('pt-BR'),
        category: 'Geral', // Default for now
        slug: e.slug,
      }));
      setExams(mapped);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchExams();
  }, []);

  const handleDeleteAll = async () => {
    try {
      await api.delete('/provas');
      setExams([]);
      setShowDeleteConfirm(false);
    } catch (err) {
      alert('Acesso negado ou erro ao excluir');
    }
  };

  const handleDeleteExam = (id: string) => {
    setExamToDelete(id);
  };

  const confirmDeleteExam = async () => {
    if (examToDelete) {
      try {
        await api.delete(`/provas/${examToDelete}`);
        setExams(exams.filter(e => e.id !== examToDelete));
        setExamToDelete(null);
      } catch (err) {
        alert('Erro ao excluir prova');
      }
    }
  };

  const filteredExams = React.useMemo(() => {
    let result = exams.filter(exam => {
      if (dateFilter === 'Todos') return true;

      const [day, month, year] = exam.date.split('/').map(Number);
      const examDate = new Date(year, month - 1, day);
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      if (dateFilter === 'Este Mês') return examDate >= firstDayThisMonth;
      if (dateFilter === 'Mês Passado') return examDate >= firstDayLastMonth && examDate <= lastDayLastMonth;
      return true;
    });

    if (sortBy === 'Nome (A-Z)') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Recentes') {
      // Already sorted by most recent from API
    }

    return result;
  }, [exams, dateFilter, sortBy]);

  const getIconConfig = (category: string) => {
    switch (category) {
      case 'Engenharia':
        return { icon: Construction, iconBg: 'bg-blue-100', iconColor: 'text-primary' };
      case 'Lógica':
        return { icon: Brain, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' };
      case 'Segurança':
        return { icon: ShieldCheck, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' };
      default:
        return { icon: FileText, iconBg: 'bg-slate-100', iconColor: 'text-slate-600' };
    }
  };

  const stats = [
    { label: 'Total de Provas', value: exams.length.toString(), sub: '+2 este mês', color: 'slate' },
    { label: 'Alunos Ativos', value: '148', sub: 'Engajamento 92%', color: 'blue' },
    { label: 'Média Geral', value: '7.4', sub: 'Escala 0-10', color: 'slate' },
  ];

  return (
    <>
      <TopBar title="Painel Administrativo" subtitle="Gerenciamento de Provas" />
      <main className="pt-24 px-4 sm:px-8 pb-12 max-w-[1600px] mx-auto">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant mb-3 uppercase tracking-widest">
              <span>Admin</span>
              <span className="w-1 h-1 bg-outline rounded-full"></span>
              <span className="text-primary">Provas</span>
            </nav>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight font-headline leading-tight">Gerenciamento de <span className="text-primary">Provas</span></h3>
            <p className="text-on-surface-variant mt-2 font-medium text-sm sm:text-lg">Crie, edite e acompanhe suas avaliações.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {exams.length > 0 && (
              <button 
                className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-error hover:bg-error/5 transition-all border border-transparent hover:border-error/20"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden sm:inline">Excluir todas</span>
              </button>
            )}
            <button 
              className="btn-primary px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-widest"
              onClick={() => navigate('/admin/exams/new')}
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Criar nova prova</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
          {stats.map((s, i) => (
            <div key={i} className="card-saas flex flex-col gap-2 group hover:border-primary/30 transition-all">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{s.label}</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-on-surface font-headline tracking-tight">{s.value}</span>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-lg",
                  s.color === 'blue' ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-600 dark:text-green-400"
                )}>{s.sub}</span>
              </div>
            </div>
          ))}
        </section>

        <div className="card-saas !p-0 overflow-hidden border-none shadow-xl shadow-primary/5">
          <div className="p-4 sm:p-6 border-b border-outline flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-6 bg-surface-container-low/50 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 group-focus-within:text-primary transition-colors" />
                <select 
                  className="pl-11 pr-10 py-3 bg-surface-container border border-outline rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer appearance-none outline-none transition-all shadow-sm focus:shadow-primary/10"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="Todos">Período: Todos</option>
                  <option value="Este Mês">Este Mês</option>
                  <option value="Mês Passado">Mês Passado</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
              </div>

              <div className="relative group">
                <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 group-focus-within:text-primary transition-colors" />
                <select 
                  className="pl-11 pr-10 py-3 bg-surface-container border border-outline rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer appearance-none outline-none transition-all shadow-sm focus:shadow-primary/10"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Recentes">Ordenar: Recentes</option>
                  <option value="Nome (A-Z)">Nome (A-Z)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
              </div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-4 py-2 rounded-lg border border-outline shadow-sm">
              Exibindo <span className="text-primary">{filteredExams.length}</span> de <span className="text-on-surface">{exams.length}</span> provas
            </div>
          </div>

          {/* Mobile card layout */}
          <div className="sm:hidden divide-y divide-outline">
            {filteredExams.map((exam) => {
              const config = getIconConfig(exam.category);
              const Icon = config.icon;
              return (
                <div key={exam.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", 
                      config.iconBg === 'bg-blue-100' ? "bg-primary/10 text-primary" : 
                      config.iconBg === 'bg-purple-100' ? "bg-purple-500/10 text-purple-500" :
                      config.iconBg === 'bg-orange-100' ? "bg-secondary/10 text-secondary" :
                      cn(config.iconBg, config.iconColor)
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface tracking-tight leading-snug">{exam.title}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-1 line-clamp-2">{exam.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-widest",
                      (exam.status === 'Ativa' || exam.status === 'Ativo') && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                      (exam.status === 'Inativa' || exam.status === 'Inativo') && "bg-red-500/20 text-red-400 border border-red-500/30",
                      (exam.status === 'Pendente' || exam.status === 'Rascunho') && "bg-orange-500/15 text-orange-400 border border-orange-500/30",
                      exam.status === 'Finalizada' && "bg-surface-container-high text-on-surface-variant",
                    )}>
                      {exam.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-8 h-8 rounded-lg bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline"
                        onClick={() => navigate(`/admin/exams/edit/${exam.id}`)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        className="w-8 h-8 rounded-lg bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline"
                        onClick={() => {
                          const url = exam.slug 
                            ? `${window.location.origin}/prova/${exam.slug}`
                            : `${window.location.origin}/student/start`;
                          navigator.clipboard.writeText(url);
                          alert('Link copiado: ' + url);
                        }}
                        title="Copiar Link"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        className="w-8 h-8 rounded-lg bg-surface-container hover:bg-error/10 text-on-surface-variant hover:text-error transition-all flex items-center justify-center border border-outline"
                        onClick={() => handleDeleteExam(exam.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table layout */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline">Informações da Prova</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {filteredExams.map((exam) => {
                  const config = getIconConfig(exam.category);
                  const Icon = config.icon;
                  return (
                    <tr key={exam.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm", 
                            config.iconBg === 'bg-blue-100' ? "bg-primary/10 text-primary" : 
                            config.iconBg === 'bg-purple-100' ? "bg-purple-500/10 text-purple-500" :
                            config.iconBg === 'bg-orange-100' ? "bg-secondary/10 text-secondary" :
                            cn(config.iconBg, config.iconColor)
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-base text-on-surface group-hover:text-primary transition-colors tracking-tight leading-none">{exam.title}</p>
                            <p className="text-xs text-on-surface-variant font-medium mt-1.5">{exam.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-4 py-1.5 text-[10px] font-bold rounded-xl uppercase tracking-widest shadow-sm",
                          (exam.status === 'Ativa' || exam.status === 'Ativo') && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                          (exam.status === 'Inativa' || exam.status === 'Inativo') && "bg-red-500/20 text-red-400 border border-red-500/30",
                          (exam.status === 'Pendente' || exam.status === 'Rascunho') && "bg-orange-500/15 text-orange-400 border border-orange-500/30",
                          exam.status === 'Finalizada' && "bg-surface-container-high text-on-surface-variant",
                        )}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline hover:border-primary/20 btn-icon-saas"
                            onClick={() => navigate(`/admin/exams/edit/${exam.id}`)}
                            title="Editar Prova"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline hover:border-primary/20 btn-icon-saas"
                            onClick={() => navigate(exam.slug ? `/prova/${exam.slug}` : '/student/start')}
                            title="Visualizar Prova"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline hover:border-primary/20 btn-icon-saas"
                            onClick={() => {
                              const url = exam.slug 
                                ? `${window.location.origin}/prova/${exam.slug}`
                                : `${window.location.origin}/student/start`;
                              navigator.clipboard.writeText(url);
                              alert('Link copiado: ' + url);
                            }}
                            title="Copiar Link"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </button>
                          <button 
                            className="w-10 h-10 rounded-xl bg-surface-container hover:bg-error/10 text-on-surface-variant hover:text-error transition-all flex items-center justify-center border border-outline hover:border-error/20 btn-icon-saas"
                            onClick={() => handleDeleteExam(exam.id)}
                            title="Excluir Prova"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-surface-container-lowest p-8 rounded-3xl shadow-2xl border border-outline-variant max-w-md w-full relative z-10"
              >
                <div className="w-16 h-16 bg-error-container text-error rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-extrabold text-on-surface text-center font-headline mb-2">Excluir Todas as Provas?</h4>
                <p className="text-on-surface-variant text-center font-sans mb-8">
                  Esta ação é irreversível. Todas as provas cadastradas e seus dados serão removidos permanentemente.
                </p>
                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-3 px-6 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="flex-1 py-3 px-6 rounded-xl font-bold bg-error text-on-error hover:bg-error/90 transition-colors shadow-lg shadow-error/20"
                    onClick={handleDeleteAll}
                  >
                    Confirmar Exclusão
                  </button>
                </div>
                <button 
                  className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {examToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setExamToDelete(null)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-surface-container-lowest p-8 rounded-3xl shadow-2xl border border-outline-variant max-w-md w-full relative z-10"
              >
                <div className="w-16 h-16 bg-error-container text-error rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-extrabold text-on-surface text-center font-headline mb-2">Excluir Prova?</h4>
                <p className="text-on-surface-variant text-center font-sans mb-8">
                  Tem certeza que deseja excluir a prova <span className="text-on-surface font-bold">"{exams.find(e => e.id === examToDelete)?.title}"</span>? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-3 px-6 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    onClick={() => setExamToDelete(null)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="flex-1 py-3 px-6 rounded-xl font-bold bg-error text-on-error hover:bg-error/90 transition-colors shadow-lg shadow-error/20"
                    onClick={confirmDeleteExam}
                  >
                    Excluir
                  </button>
                </div>
                <button 
                  className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface"
                  onClick={() => setExamToDelete(null)}
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
