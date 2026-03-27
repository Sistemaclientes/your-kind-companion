import React, { useState, useMemo } from 'react';
import { TopBar } from '@/components/TopBar';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  UserPlus,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export function StudentsPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');
  const [sortBy, setSortBy] = useState<'Data de Cadastro' | 'Nome'>('Data de Cadastro');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const itemsPerPage = 5;

  const allStudents = [
    { id: 1, name: 'Beatriz Helena Santos', email: 'beatriz.santos@email.com', phone: '(11) 98765-4321', date: '12/05/2023', status: 'Ativo', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: 2, name: 'Ricardo Almeida', email: 'ricardo.almeida@email.com', phone: '(11) 91234-5678', date: '15/05/2023', status: 'Ativo', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: 3, name: 'Juliana Ferreira', email: 'juliana.f@email.com', phone: '(11) 97777-8888', date: '20/05/2023', status: 'Inativo', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: 4, name: 'Marcos Vinícius', email: 'marcos.v@email.com', phone: '(11) 96666-5555', date: '22/05/2023', status: 'Pendente', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: 5, name: 'Lucas Oliveira', email: 'lucas.o@email.com', phone: '(11) 95555-4444', date: '25/05/2023', status: 'Ativo', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  ];

  const filteredStudents = useMemo(() => {
    let result = [...allStudents];
    
    if (statusFilter !== 'Todos') {
      result = result.filter(s => s.status === statusFilter);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.email.toLowerCase().includes(q) || 
        s.phone.includes(q)
      );
    }

    if (sortBy === 'Nome') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Sort by date (mock dates are DD/MM/YYYY, let's just reverse for mock simplicity or parse)
      result.sort((a, b) => {
        const dateA = a.date.split('/').reverse().join('');
        const dateB = b.date.split('/').reverse().join('');
        return dateB.localeCompare(dateA);
      });
    }

    return result;
  }, [statusFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <TopBar title="Painel Administrativo" subtitle="Gestão de Alunos" />
      <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-headline tracking-tight">Gestão de Alunos</h1>
            <p className="text-text-secondary font-medium mt-1">Visualize e gerencie todos os estudantes cadastrados na plataforma.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-border bg-white dark:bg-cards-dark text-text-primary hover:bg-background-light dark:hover:bg-background-dark transition-all shadow-sm hover:scale-[1.03] active:scale-[0.98]">
              <Download className="w-4 h-4 text-primary" />
              Exportar
            </button>
            <button className="btn-primary px-6 py-2.5 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Novo Aluno
            </button>
          </div>
        </div>

        <div className="card-saas overflow-hidden border-none shadow-xl shadow-primary/5">
          <div className="p-6 border-b border-outline flex flex-wrap items-center justify-between gap-6 bg-surface-container-low/50 backdrop-blur-md">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-4 h-4" />
              <input 
                className="w-full bg-white dark:bg-slate-950 border border-outline dark:border-outline rounded-xl pl-12 pr-4 py-3 text-sm text-on-surface font-medium placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner focus:shadow-primary/5" 
                placeholder="Buscar por nome, e-mail ou telefone..." 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-950 border border-outline rounded-xl text-xs font-bold text-on-surface hover:border-primary/50 transition-all shadow-sm hover:scale-[1.03] active:scale-[0.98]"
                >
                  <Filter className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline uppercase tracking-widest opacity-70">Status:</span> {statusFilter}
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-on-surface-variant", isStatusOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {isStatusOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsStatusOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-outline z-20 p-2 overflow-hidden"
                      >
                        {['Todos', 'Ativo', 'Inativo', 'Pendente'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusFilter(status as any);
                              setIsStatusOpen(false);
                              setCurrentPage(1);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between group",
                              statusFilter === status 
                                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                : "text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-on-surface"
                            )}
                          >
                            {status}
                            {statusFilter === status && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-950 border border-outline rounded-xl text-xs font-bold text-on-surface hover:border-primary/50 transition-all shadow-sm"
                >
                  <ArrowUpDown className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline uppercase tracking-widest opacity-70">Ordenar:</span> {sortBy}
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-on-surface-variant", isSortOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-outline z-20 p-2 overflow-hidden"
                      >
                        {['Data de Cadastro', 'Nome'].map((sort) => (
                          <button
                            key={sort}
                            onClick={() => {
                              setSortBy(sort as any);
                              setIsSortOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between group",
                              sortBy === sort 
                                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                : "text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-on-surface"
                            )}
                          >
                            {sort}
                            {sortBy === sort && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-outline">
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Aluno</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Contato</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Cadastro</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-primary/[0.02] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/admin/student/${student.id}`)}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img 
                              alt={student.name} 
                              className="w-12 h-12 rounded-2xl object-cover ring-4 ring-transparent group-hover:ring-primary/10 transition-all shadow-sm" 
                              src={student.img}
                              referrerPolicy="no-referrer"
                            />
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900",
                              student.status === 'Ativo' ? "bg-green-500" : 
                              student.status === 'Inativo' ? "bg-red-500" :
                              "bg-orange-500"
                            )} />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface group-hover:text-primary transition-colors tracking-tight">{student.name}</p>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-70">ID: #STU-{student.id.toString().padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-on-surface font-medium">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            {student.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                            <Phone className="w-3.5 h-3.5 text-on-surface-variant/50" />
                            {student.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          {student.date}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={cn(
                          "px-4 py-1.5 text-[10px] font-bold rounded-xl uppercase tracking-widest shadow-sm",
                          student.status === 'Ativo' && "bg-green-500/10 text-green-600 dark:text-green-400",
                          student.status === 'Inativo' && "bg-red-500/10 text-red-600 dark:text-red-400",
                          student.status === 'Pendente' && "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                        )}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline hover:border-primary/20 btn-icon-saas">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-background-light dark:bg-background-dark rounded-full">
                          <Users className="w-8 h-8 text-text-secondary/30" />
                        </div>
                        <p className="text-text-secondary font-medium">Nenhum aluno encontrado com os filtros selecionados.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-background-light/50 dark:bg-background-dark/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-text-secondary font-bold tracking-tight">
              Mostrando {filteredStudents.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredStudents.length)} de {filteredStudents.length} alunos
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || filteredStudents.length === 0}
                className="p-2.5 rounded-xl border border-border bg-white dark:bg-cards-dark text-text-secondary hover:text-primary hover:border-primary/50 disabled:opacity-30 transition-all shadow-sm"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => goToPage(i + 1)}
                    className={cn(
                      "w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-sm",
                      currentPage === i + 1 
                        ? "bg-primary text-white" 
                        : "bg-white dark:bg-cards-dark text-text-secondary border border-border hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || filteredStudents.length === 0}
                className="p-2.5 rounded-xl border border-border bg-white dark:bg-cards-dark text-text-secondary hover:text-primary hover:border-primary/50 disabled:opacity-30 transition-all shadow-sm"
                title="Próxima"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
