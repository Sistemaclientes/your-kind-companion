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
  LogOut
} from 'lucide-react';
import { buildStudentSlug, cn, getStudentSlugMap, setStudentSlugMap } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

export function StudentsPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos');
  const [sortBy, setSortBy] = useState<'Nome' | 'Recentes'>('Nome');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        s.email.toLowerCase().includes(q)
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
    const headers = ['Nome', 'Email', 'Status', 'Provas Realizadas', 'Média Geral', 'Último Acesso'];
    const rows = filteredStudents.map(s => [
      s.nome,
      s.email,
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
      <main className="pt-24 px-4 sm:px-6 pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-on-surface font-headline tracking-tight">Gestão de Alunos</h1>
            <p className="text-on-surface-variant font-medium mt-1">Visualize e gerencie todos os estudantes que já realizaram provas.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                if (confirm('Deseja realmente deslogar todos os alunos? Eles receberão um e-mail de confirmação.')) {
                  try {
                    await api.post('/admin/students/logout-all', {});
                    alert('Todos os alunos foram deslogados e e-mails de confirmação foram simulados no servidor.');
                    window.location.reload();
                  } catch (err) {
                    alert('Erro ao deslogar alunos.');
                  }
                }
              }} 
              className="btn-secondary px-5 py-2.5 flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Deslogar Todos
            </button>
            <button onClick={handleExport} className="btn-secondary px-5 py-2.5 flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              Exportar
            </button>
          </div>
        </div>

        <div className="card-saas overflow-hidden border-none shadow-xl shadow-primary/5">
          <div className="p-6 border-b border-outline flex flex-wrap items-center justify-between gap-6 bg-surface-container-low/50 backdrop-blur-md">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-4 h-4" />
              <input 
                className="w-full bg-surface-container border border-outline rounded-xl pl-12 pr-4 py-3 text-sm text-on-surface font-medium placeholder:text-on-surface-variant/50 focus:border-primary outline-none transition-all" 
                placeholder="Buscar por nome ou e-mail..." 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 border-b border-outline">
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Aluno</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Provas Realizadas</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Média Geral</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Último Acesso</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {currentStudents.length > 0 ? (
                  currentStudents.map((student, i) => (
                    <tr 
                      key={i} 
                      className="hover:bg-primary/[0.02] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/students/${student.slug}`)}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary font-bold text-lg">
                            {student.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface group-hover:text-primary transition-colors tracking-tight">{student.nome}</p>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-70">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={cn(
                          "px-3 py-1.5 text-[10px] font-bold rounded-xl uppercase tracking-widest shadow-sm",
                          student.status === 'Ativo' ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
                        )}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center text-on-surface font-semibold">
                        {student.provas_contagem}
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={cn(
                          "px-4 py-1.5 text-[10px] font-bold rounded-xl uppercase tracking-widest shadow-sm",
                          student.media_pontuacao >= 70 ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
                        )}>
                          {Math.round(student.media_pontuacao)}%
                        </span>
                      </td>
                      <td className="px-6 py-6 text-on-surface-variant text-sm font-medium">
                        {new Date(student.ultimo_acesso).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <ChevronRight className="w-5 h-5 text-on-surface-variant inline-block group-hover:text-primary transition-colors" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-on-surface-variant font-medium">
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-surface-container/30 border-t border-outline flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-on-surface-variant font-bold tracking-tight">
              Mostrando {currentStudents.length} de {filteredStudents.length} alunos
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-border bg-surface-container text-on-surface-variant hover:text-primary disabled:opacity-30 transition-all"
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
                        : "bg-surface-container text-on-surface-variant border border-border"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-border bg-surface-container text-on-surface-variant hover:text-primary disabled:opacity-30 transition-all"
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
