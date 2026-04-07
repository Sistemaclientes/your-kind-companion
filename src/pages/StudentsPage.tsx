import React, { useState, useMemo } from 'react';
import { TopBar } from '../components/TopBar';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Check,
  ChevronDown,
  ArrowUpDown,
  LogOut,
  Mail,
  Pencil,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { buildStudentSlug, cn, getStudentSlugMap, setStudentSlugMap } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { studentsService } from '../services/students.service';

export function StudentsPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos');
  const [sortBy, setSortBy] = useState<'Nome' | 'Recentes'>('Nome');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ nome: string; cpf: string; telefone: string }>({ nome: '', cpf: '', telefone: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ email: string; nome: string } | null>(null);

  const itemsPerPage = 10;

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await api.get('/dashboard/students');
        const map = getStudentSlugMap();
        const mapped = data.map((student: any) => {
          const slug = buildStudentSlug(student.nome, student.email);
          map[slug] = student.email;
          return { ...student, slug };
        });
        setStudentSlugMap(map);
        setStudents(mapped);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    let result = [...students];
    
    if (statusFilter === 'Ativos') {
      result = result.filter(s => s.status === 'Ativo');
    } else if (statusFilter === 'Inativos') {
      result = result.filter(s => s.status === 'Cadastrado' || s.status === 'Aguardando Confirmação');
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.nome.toLowerCase().includes(q) || 
        s.email.toLowerCase().includes(q) ||
        (s.cpf && s.cpf.includes(q))
      );
    }

    if (sortBy === 'Nome') {
      result.sort((a, b) => a.nome.localeCompare(b.nome));
    } else {
      result.sort((a, b) => new Date(b.ultimo_acesso).getTime() - new Date(a.ultimo_acesso).getTime());
    }

    return result;
  }, [students, statusFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExport = () => {
    const headers = ['Nome', 'Email', 'CPF', 'Status', 'Provas Realizadas', 'Média Geral', 'Último Acesso'];
    const rows = filteredStudents.map(s => [
      s.nome,
      s.email,
      s.cpf || '',
      s.status || (s.provas_contagem > 0 ? 'Ativo' : 'Cadastrado'),
      s.provas_contagem,
      `${Math.round(s.media_pontuacao)}%`,
      new Date(s.ultimo_acesso).toLocaleDateString('pt-BR'),
    ]);
    const csv = [headers, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alunos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return null;

  return (
    <>
      <TopBar title="Painel Administrativo" subtitle="Gestão de Alunos" />
      <main className="pt-24 px-4 sm:px-6 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">Gestão de Alunos</h1>
            <p className="text-on-surface-variant font-medium mt-1 text-sm">Visualize e gerencie todos os estudantes que já realizaram provas.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button 
              onClick={async () => {
                if (confirm('Deseja reenviar e-mail de confirmação para TODOS os alunos não confirmados?')) {
                  try {
                    const res = await api.post('/admin/bulk-resend-confirmation', {});
                    alert(res.message);
                  } catch (err: any) {
                    alert(err.message || 'Erro ao reenviar e-mails.');
                  }
                }
              }} 
              className="w-full sm:w-auto btn-primary px-6 h-11 flex items-center justify-center gap-2 rounded-2xl shadow-sm transition-all text-sm font-semibold"
            >
              <Mail className="w-4 h-4" />
              Reenviar Confirmações
            </button>
            <button 
              onClick={async () => {
                if (confirm('Deseja realmente deslogar todos os alunos?')) {
                  try {
                    await api.post('/admin/students/logout-all', {});
                    alert('Todos os alunos foram marcados para reconfirmação.');
                    window.location.reload();
                  } catch (err) {
                    alert('Erro ao deslogar alunos.');
                  }
                }
              }} 
              className="w-full sm:w-auto btn-secondary bg-surface-container-high hover:bg-red-500/10 hover:text-red-500 px-6 h-11 flex items-center justify-center gap-2 rounded-2xl border-none shadow-sm transition-all text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Deslogar Todos
            </button>

            <button onClick={handleExport} className="w-full sm:w-auto btn-secondary px-6 h-11 flex items-center justify-center gap-2 rounded-2xl bg-surface-container shadow-sm border-none transition-all text-sm font-semibold">
              <Download className="w-4 h-4 text-primary" />
              Exportar
            </button>
          </div>
        </div>

        <div className="card-saas p-0 overflow-hidden border border-outline/30 shadow-2xl shadow-primary/5 rounded-2xl bg-surface-container-low/30 backdrop-blur-sm">
          <div className="p-6 border-b border-outline/30 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4.5 h-4.5 opacity-50" />
              <input 
                className="w-full bg-surface-container-high/50 border border-outline/30 rounded-xl pl-12 pr-4 h-12 text-sm text-on-surface font-medium placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner" 
                placeholder="Buscar por nome, e-mail ou CPF..." 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="flex items-center gap-2">
               <span className="text-xs font-semibold text-on-surface-variant px-3 py-1.5 bg-surface-container rounded-lg border border-outline/20">
                 {filteredStudents.length} Alunos
               </span>
            </div>
          </div>

          <div className="flex flex-col">
            {currentStudents.length > 0 ? (
              <div className="divide-y divide-outline/20">
                {currentStudents.map((student, i) => (
                  <div 
                    key={student.email} 
                    className="flex items-center justify-between p-4 sm:p-6 hover:bg-surface-container-high/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/admin/students/${student.slug}`)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0 shadow-sm border border-primary/10">
                        {student.nome.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                          {student.nome}
                        </p>
                        <p className="text-xs text-on-surface-variant/70 font-medium truncate mt-0.5">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 px-8">
                      <div className="flex flex-col items-center min-w-[80px]">
                        <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mb-1">Status</span>
                        <span className={cn(
                          "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider",
                          student.status === 'Ativo' ? "bg-green-500/10 text-green-500" : 
                          student.status === 'Aguardando Confirmação' ? "bg-amber-500/10 text-amber-500" :
                          "bg-surface-container-high text-on-surface-variant"
                        )}>
                          {student.status || 'Cadastrado'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center min-w-[100px]">
                        <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mb-1">Provas</span>
                        <span className="text-sm font-bold text-on-surface">
                          {student.provas_contagem}
                        </span>
                      </div>

                      <div className="flex flex-col items-center min-w-[100px]">
                        <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mb-1">Média</span>
                        <span className={cn(
                          "text-sm font-bold",
                          student.media_pontuacao >= 70 ? "text-green-500" : "text-amber-500"
                        )}>
                          {Math.round(student.media_pontuacao)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setEditingStudent(student.email);
                          setEditForm({ nome: student.nome, cpf: student.cpf || '', telefone: student.telefone || '' });
                        }}
                        className="p-2 rounded-xl hover:bg-primary/10 text-on-surface-variant/60 hover:text-primary transition-all"
                      >
                        <Pencil className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudentToDelete({ email: student.email, nome: student.nome });
                        }}
                        className="p-2 rounded-xl hover:bg-red-500/10 text-on-surface-variant/60 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 border border-outline/20">
                  <Users className="w-8 h-8 text-on-surface-variant/30" />
                </div>
                <p className="text-on-surface-variant font-medium">Nenhum aluno encontrado.</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-outline/20 flex flex-col items-center gap-6 bg-surface-container-low/50">
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline/30 bg-surface-container text-on-surface-variant hover:text-primary disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => goToPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center",
                      currentPage === i + 1 
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                        : "bg-surface-container text-on-surface-variant border border-outline/30 hover:border-primary/50"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline/30 bg-surface-container text-on-surface-variant hover:text-primary disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-on-surface-variant/50 font-bold tracking-widest uppercase">
              Página {currentPage} de {totalPages}
            </p>
          </div>
        </div>
      </main>
      
      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-high border border-outline rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-on-surface text-center mb-2">Excluir Aluno?</h3>
              <p className="text-on-surface-variant text-center mb-8">
                Deseja realmente excluir o aluno <span className="text-on-surface font-bold">"{studentToDelete.nome}"</span>? 
                Esta ação é irreversível e removerá todos os resultados e registros do estudante.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setStudentToDelete(null)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    if (!studentToDelete) return;
                    setActionLoading(true);
                    try {
                      await studentsService.deleteStudent(studentToDelete.email);
                      setStudents(prev => prev.filter(s => s.email !== studentToDelete.email));
                      setStudentToDelete(null);
                    } catch (err: any) {
                      alert(err.message || 'Erro ao excluir');
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default StudentsPage;
