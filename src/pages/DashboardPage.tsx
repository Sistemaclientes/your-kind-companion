import React from 'react';
import { TopBar } from '../components/TopBar';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { buildStudentSlug, cn, getStudentSlugMap, setStudentSlugMap } from '../lib/utils';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip
} from 'recharts';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/authStore';
import { motion } from 'motion/react';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metrics = [
    { label: 'Total de provas', value: stats?.metrics.totalProvas.toString() || '0', trend: '0%', icon: FileText, color: 'primary' },
    { label: 'Total de alunos', value: stats?.metrics.totalAlunos.toString() || '0', trend: '0%', icon: Users, color: 'violet' },
    { label: 'Provas realizadas', value: stats?.metrics.provasRealizadas.toString() || '0', trend: '0%', icon: CheckCircle2, color: 'amber' },
    { label: 'Média de desempenho', value: `${stats?.metrics.mediaGeral || 0}/100`, trend: '0', icon: TrendingUp, color: 'orange' },
  ];

  const recentExams: Array<{ id: number | string; slug?: string; title: string; time: string; students: string }> = (stats?.recentResults || []).map((r: any) => ({
    id: r.prova_id,
    slug: r.prova_slug || r.slug,
    title: r.prova_titulo,
    time: r.data ? new Date(r.data).toLocaleDateString('pt-BR') : 'Recentemente',
    students: r.nome_aluno
  }));

  const performanceData = [
    { name: 'Jan', value: 0 },
    { name: 'Fev', value: 0 },
    { name: 'Mar', value: 0 },
    { name: 'Abr', value: 0 },
    { name: 'Mai', value: 0 },
    { name: 'Jun', value: Math.round(stats?.metrics.mediaGeral || 0) },
  ];

  const [students, setStudents] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await api.get('/dashboard/students');
        const map = getStudentSlugMap();
        const mapped = data.slice(0, 8).map((student: any) => {
          const slug = buildStudentSlug(student.nome, student.email);
          map[slug] = student.email;
          return { ...student, slug };
        });
        setStudentSlugMap(map);
        setStudents(mapped);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <>
        <TopBar title="Dashboard" />
        <main className="pt-24 px-4 sm:px-8 pb-12 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 skeleton h-96 rounded-2xl" />
            <div className="skeleton h-96 rounded-2xl" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="Dashboard" />
      <motion.main 
        initial="hidden" animate="visible" variants={stagger}
        className="pt-24 px-4 sm:px-8 pb-12 max-w-[1600px] mx-auto"
      >
        {/* Welcome */}
        <motion.div variants={fadeUp} className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-tight">
              Bem-vindo, <span className="text-primary">{user?.nome?.split(' ')[0] || 'Administrador'}</span>
            </h1>
            <p className="text-on-surface-variant font-medium mt-2 text-base md:text-lg">Resumo do desempenho da sua instituição.</p>
          </div>
          <button 
            className="btn-primary px-6 py-3.5 text-sm"
            onClick={() => navigate('/admin/exams/new')}
          >
            <Plus className="w-4 h-4" />
            Criar Nova Prova
          </button>
        </motion.div>

        {/* Metrics */}
        <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {metrics.map((m) => (
            <motion.div 
              key={m.label} 
              variants={fadeUp}
              className="card-saas group"
            >
              <div className="flex justify-between items-start mb-5">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  m.color === 'primary' && "bg-primary/10 text-primary",
                  m.color === 'violet' && "bg-violet-500/10 text-violet-500",
                  m.color === 'amber' && "bg-amber-500/10 text-amber-500",
                  m.color === 'orange' && "bg-orange-500/10 text-orange-500",
                )}>
                  <m.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider mb-1">{m.label}</p>
              <h3 className="text-3xl font-bold text-on-surface tracking-tight">{m.value}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Chart + Sidebar */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-saas">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h4 className="text-lg font-bold text-on-surface tracking-tight">Desempenho Geral</h4>
                <p className="text-sm text-on-surface-variant font-medium mt-0.5">Últimos 6 meses</p>
              </div>
              <select className="input-saas text-xs font-semibold py-2 px-3">
                <option>Últimos 6 meses</option>
                <option>Último ano</option>
              </select>
            </div>
            
            <div className="h-[250px] sm:h-[300px] -ml-2 sm:ml-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline)" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontWeight: 500 }}
                    dy={12}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontWeight: 500 }}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    dx={-8}
                    width={35}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface-container)', 
                      borderColor: 'var(--color-outline)',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--color-on-surface)',
                      boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.15)',
                      border: '1px solid var(--color-outline)'
                    }}
                    itemStyle={{ color: 'var(--color-primary)' }}
                    formatter={(value: any) => [`${value}%`, 'Desempenho']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-saas">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-base font-bold text-on-surface tracking-tight">Provas Recentes</h4>
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-2">
                {recentExams.map((exam: { id: number | string; title: string; time: string; students: string; slug?: string }, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-all cursor-pointer group"
                    onClick={() => navigate(exam.slug ? `/admin/exams/editar/${exam.slug}` : '/admin/exams')}
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{exam.title}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{exam.time} • {exam.students}</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-4 py-2.5 text-primary font-semibold text-xs hover:bg-primary/5 rounded-xl transition-all"
                onClick={() => navigate('/admin/exams')}
              >
                Ver Todas as Provas
              </button>
            </div>

          </div>
        </motion.div>

        {/* Students */}
        {students.length > 0 && (
          <motion.div variants={fadeUp} className="mt-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h4 className="text-xl font-bold text-on-surface tracking-tight">Status dos Alunos</h4>
                <p className="text-sm text-on-surface-variant font-medium mt-0.5">Engajamento individual em tempo real</p>
              </div>
            </div>
            
            <div className="overflow-hidden -mx-4 px-4 group/marquee">
              <div className="flex gap-5 animate-marquee group-hover/marquee:[animation-play-state:paused] w-max">
                {[...students, ...students].map((s, i) => (
                  <div 
                    key={`${s.email}-${i}`} 
                    className="min-w-[280px] card-saas flex items-center gap-4 cursor-pointer group/card select-none"
                    onClick={() => navigate(`/admin/students/${s.slug}`)}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-outline">
                        {s.nome?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface-container",
                        s.provas_contagem > 0 ? "bg-orange-500" : "bg-red-500"
                      )}></div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-on-surface group-hover/card:text-primary transition-colors truncate">{s.nome}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Média: {Math.round(s.media_pontuacao)}% • {s.provas_contagem} provas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.main>
    </>
  );
}

export default DashboardPage;
