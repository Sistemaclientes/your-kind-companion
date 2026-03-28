import React from 'react';
import { TopBar } from '../components/TopBar';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, useMotionValue, useTransform } from 'motion/react';
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

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [sliderIndex, setSliderIndex] = React.useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [carouselWidth, setCarouselWidth] = React.useState(0);

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
    { label: 'Total de provas', value: stats?.metrics.totalProvas.toString() || '0', trend: '0%', icon: FileText, color: 'blue' },
    { label: 'Alunos únicos', value: stats?.metrics.totalAlunos.toString() || '0', trend: '0%', icon: Users, color: 'purple' },
    { label: 'Provas realizadas', value: stats?.metrics.provasRealizadas.toString() || '0', trend: '0%', icon: CheckCircle2, color: 'orange' },
    { label: 'Média de desempenho', value: `${stats?.metrics.mediaGeral || 0}/100`, trend: '0', icon: TrendingUp, color: 'emerald' },
  ];

  const recentExams: Array<{ id: number | string; title: string; time: string; students: string }> = (stats?.recentResults || []).map((r: any) => ({
    id: r.prova_id,
    title: r.prova_titulo,
    time: new Date(r.data).toLocaleDateString(),
    students: r.nome_aluno
  }));

  const performanceData = [
    { name: 'Jan', value: 62 },
    { name: 'Fev', value: 68 },
    { name: 'Mar', value: 65 },
    { name: 'Abr', value: 74 },
    { name: 'Mai', value: 81 },
    { name: 'Jun', value: stats?.metrics.mediaGeral || 78 },
  ];

  const students = [
    { id: '1', name: 'Beatriz Helena Santos', stats: 'Média: 0 • 0 provas', status: 'Ativo', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '2', name: 'Ricardo Almeida', stats: 'Média: 0 • 0 provas', status: 'Ativo', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '3', name: 'Ana Carolina Lima', stats: 'Média: 0 • 0 provas', status: 'Ativo', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '4', name: 'Lucas Ferreira', stats: 'Média: 0 • 0 provas', status: 'Inativo', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '5', name: 'Mariana Costa', stats: 'Média: 0 • 0 provas', status: 'Ativo', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  ];

  React.useEffect(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setCarouselWidth(scrollWidth - offsetWidth);
    }
  }, [students.length, loading]);

  if (loading) return null;

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="pt-24 px-8 pb-12 max-w-[1600px] mx-auto">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight leading-tight">Bem-vindo, <span className="text-primary">Administrador</span></h1>
            <p className="text-on-surface-variant font-medium mt-2 text-lg">Aqui está o resumo do desempenho da sua instituição hoje.</p>
          </div>
          <button 
            className="btn-primary px-8 py-4 text-base"
            onClick={() => navigate('/admin/exams/new')}
          >
            <Plus className="w-5 h-5" />
            Criar Nova Prova
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {metrics.map((m) => (
            <div key={m.label} className="card-saas group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                  m.color === 'blue' && "bg-primary/10 text-primary",
                  m.color === 'purple' && "bg-purple-500/10 text-purple-500",
                  m.color === 'orange' && "bg-secondary/10 text-secondary",
                  m.color === 'emerald' && "bg-emerald-500/10 text-emerald-500",
                )}>
                  <m.icon className="w-6 h-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                  m.trend.startsWith('+') ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-error/10 text-error"
                )}>
                  {m.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-90" />}
                  {m.trend}
                </div>
              </div>
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">{m.label}</p>
              <h3 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">{m.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card-saas">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h4 className="text-xl font-bold text-on-surface font-headline tracking-tight">Desempenho Geral</h4>
                <p className="text-sm text-on-surface-variant font-medium mt-1">Evolução das notas médias nos últimos 6 meses</p>
              </div>
              <select className="input-saas text-xs font-bold uppercase tracking-widest py-2">
                <option>Últimos 6 meses</option>
                <option>Último ano</option>
              </select>
            </div>
            
            <div className="h-[320px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F8B8D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0F8B8D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline)" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontWeight: 600 }}
                    domain={[0, 10]}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface-container)', 
                      borderColor: 'var(--color-outline)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--color-on-surface)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#0F8B8D' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0F8B8D" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-8">
            <div className="card-saas">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-on-surface font-headline tracking-tight">Provas Recentes</h4>
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-4">
                {recentExams.map((exam: { id: number | string; title: string; time: string; students: string }, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group"
                    onClick={() => navigate(`/admin/exams/edit/${exam.id}`)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{exam.title}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">{exam.time} • {exam.students} alunos</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-6 py-3 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/20"
                onClick={() => navigate('/admin/exams')}
              >
                Ver Todas as Provas
              </button>
            </div>

            <div className="bg-primary p-8 rounded-[24px] shadow-2xl shadow-primary/30 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold font-headline mb-3 tracking-tight">Dica do Avaliador</h4>
                <p className="text-sm opacity-90 font-medium leading-relaxed mb-6">
                  Você sabia que provas com menos de 10 questões têm 30% mais engajamento entre os alunos?
                </p>
                <a className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all" href="#">
                  Saiba mais
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div>
              <h4 className="text-2xl font-bold text-on-surface font-headline tracking-tight">Status dos Alunos</h4>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Acompanhe o engajamento individual em tempo real</p>
            </div>
            <button 
              className="btn-primary py-2.5 px-6 text-xs uppercase tracking-widest"
              onClick={() => navigate('/admin/students')}
            >
              Ver Todos
            </button>
          </div>
          
          <motion.div 
            ref={carouselRef} 
            className="overflow-hidden cursor-grab active:cursor-grabbing -mx-4 px-4"
          >
            <motion.div 
              className="flex gap-6"
              drag="x"
              dragConstraints={{ right: 0, left: -carouselWidth }}
              dragElastic={0.1}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
            >
              {students.map((s) => (
                <motion.div 
                  key={s.id} 
                  className="min-w-[320px] card-saas flex items-center gap-5 cursor-pointer group/card border-transparent hover:border-primary/20 select-none"
                  onClick={() => navigate(`/admin/student/${s.id}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative shrink-0">
                    <img 
                      alt={s.name} 
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-transparent group-hover/card:ring-primary/20 transition-all shadow-md pointer-events-none" 
                      src={s.img}
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-container",
                      s.status === 'Ativo' ? "bg-green-500" : 
                      s.status === 'Inativo' ? "bg-red-500" :
                      "bg-orange-500"
                    )}></div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-lg text-on-surface group-hover/card:text-primary transition-colors truncate tracking-tight">{s.name}</p>
                    <p className="text-xs text-on-surface-variant font-semibold mt-0.5">{s.stats}</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shrink-0",
                    s.status === 'Ativo' && "bg-green-500/10 text-green-600 dark:text-green-400",
                    s.status === 'Inativo' && "bg-red-500/10 text-red-600 dark:text-red-400",
                    s.status === 'Pendente' && "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                  )}>
                    {s.status}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
