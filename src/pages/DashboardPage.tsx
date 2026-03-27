import React from 'react';
import { TopBar } from '@/components/TopBar';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { storage } from '@/lib/storage';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
} from 'recharts';

const performanceData = [
  { name: 'Jan', value: 6.2 },
  { name: 'Fev', value: 6.8 },
  { name: 'Mar', value: 6.5 },
  { name: 'Abr', value: 7.4 },
  { name: 'Mai', value: 8.1 },
  { name: 'Jun', value: 7.8 },
];

const students = [
  { name: 'Beatriz Helena Santos', stats: 'Média: 0 • 0 provas', status: 'Ativo', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { name: 'Ricardo Almeida', stats: 'Média: 0 • 0 provas', status: 'Ativo', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { name: 'Juliana Ferreira', stats: 'Média: 0 • 0 provas', status: 'Inativo', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { name: 'Marcos Vinícius', stats: 'Média: 0 • 0 provas', status: 'Pendente', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { name: 'Lucas Oliveira', stats: 'Média: 0 • 0 provas', status: 'Ativo', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const exams = storage.getExams();

  const metrics = [
    { label: 'Total de provas', value: exams.length.toString(), trend: '0%', icon: FileText, color: 'blue' },
    { label: 'Alunos cadastrados', value: '5', trend: '0%', icon: Users, color: 'purple' },
    { label: 'Provas realizadas', value: '0', trend: '0%', icon: CheckCircle2, color: 'orange' },
    { label: 'Média de desempenho', value: '0/10', trend: '0', icon: TrendingUp, color: 'emerald' },
  ];

  const recentExams = exams.slice(0, 3).map(exam => ({
    id: exam.id,
    title: exam.title,
    time: 'Recentemente',
    students: parseInt(exam.students) || 0
  }));

  const [sliderIndex, setSliderIndex] = React.useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(students.length / itemsPerPage);

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="pt-20 md:pt-24 px-4 md:px-8 pb-12 max-w-[1600px] mx-auto">
        {/* Hero */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-on-surface font-headline tracking-tight leading-tight">
              Bem-vindo, <span className="text-primary">Administrador</span>
            </h1>
            <p className="text-on-surface-variant font-medium mt-1 md:mt-2 text-sm md:text-lg">
              Aqui está o resumo do desempenho da sua instituição hoje.
            </p>
          </div>
          <button 
            className="btn-primary px-6 md:px-8 py-3 md:py-4 text-sm"
            onClick={() => navigate('/admin/exams/new')}
          >
            <Plus className="w-5 h-5" />
            Criar Nova Prova
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">
          {metrics.map((m) => (
            <div key={m.label} className="card-saas group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                  m.color === 'blue' && "bg-primary/10 text-primary",
                  m.color === 'purple' && "bg-purple-500/10 text-purple-500",
                  m.color === 'orange' && "bg-secondary/10 text-secondary",
                  m.color === 'emerald' && "bg-emerald-500/10 text-emerald-500",
                )}>
                  <m.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className={cn(
                  "hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                  m.trend.startsWith('+') ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-error/10 text-error"
                )}>
                  <ArrowUpRight className="w-3 h-3" />
                  {m.trend}
                </div>
              </div>
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">{m.label}</p>
              <h3 className="text-xl md:text-3xl font-extrabold text-on-surface font-headline tracking-tight">{m.value}</h3>
            </div>
          ))}
        </div>

        {/* Chart + Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 card-saas">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <div>
                <h4 className="text-lg md:text-xl font-bold text-on-surface font-headline tracking-tight">Desempenho Geral</h4>
                <p className="text-xs md:text-sm text-on-surface-variant font-medium mt-1">Evolução das notas médias nos últimos 6 meses</p>
              </div>
              <select className="input-saas text-xs font-bold uppercase tracking-widest py-2">
                <option>Últimos 6 meses</option>
                <option>Último ano</option>
              </select>
            </div>
            
            <div className="h-[240px] md:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
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
                    hide={typeof window !== 'undefined' && window.innerWidth < 640}
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
                    itemStyle={{ color: 'var(--color-primary)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="card-saas">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h4 className="text-base md:text-lg font-bold text-on-surface font-headline tracking-tight">Provas Recentes</h4>
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-3 md:space-y-4">
                {recentExams.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
                    <p className="text-sm text-on-surface-variant font-medium">Nenhuma prova criada ainda</p>
                    <button 
                      onClick={() => navigate('/admin/exams/new')}
                      className="mt-3 text-xs font-bold text-primary hover:underline"
                    >
                      Criar primeira prova →
                    </button>
                  </div>
                )}
                {recentExams.map((exam, i) => (
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
              {recentExams.length > 0 && (
                <button 
                  className="w-full mt-4 md:mt-6 py-3 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/20"
                  onClick={() => navigate('/admin/exams')}
                >
                  Ver Todas as Provas
                </button>
              )}
            </div>

            <div className="bg-primary p-6 md:p-8 rounded-[24px] shadow-2xl shadow-primary/30 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-lg md:text-xl font-bold font-headline mb-2 md:mb-3 tracking-tight">Dica do Avaliador</h4>
                <p className="text-xs md:text-sm opacity-90 font-medium leading-relaxed mb-4 md:mb-6">
                  Provas com menos de 10 questões têm 30% mais engajamento entre os alunos.
                </p>
                <a className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all" href="#">
                  Saiba mais
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Students Slider */}
        <div className="mt-8 md:mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div>
              <h4 className="text-xl md:text-2xl font-bold text-on-surface font-headline tracking-tight">Status dos Alunos</h4>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium mt-1">Acompanhe o engajamento individual</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl border border-outline">
                <button 
                  onClick={() => setSliderIndex(p => Math.max(0, p - 1))}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-surface-container border border-outline flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all disabled:opacity-30 btn-icon-saas"
                  disabled={sliderIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="text-[10px] font-bold uppercase tracking-widest px-2 text-on-surface-variant">
                  {sliderIndex + 1} / {totalPages}
                </div>
                <button 
                  onClick={() => setSliderIndex(p => Math.min(totalPages - 1, p + 1))}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-surface-container border border-outline flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all disabled:opacity-30 btn-icon-saas"
                  disabled={sliderIndex === totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex"
              animate={{ x: `-${sliderIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
            >
              {Array.from({ length: totalPages }).map((_, pageIdx) => (
                <div key={pageIdx} className="flex gap-4 md:gap-6 min-w-full px-1">
                  {students.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage).map((s, i) => (
                    <div 
                      key={i} 
                      className="flex-1 card-saas flex items-center gap-3 md:gap-5 cursor-pointer group/card border-transparent hover:border-primary/20"
                      onClick={() => navigate('/admin/student/1')}
                    >
                      <div className="relative shrink-0">
                        <img 
                          alt={s.name} 
                          className="w-12 h-12 md:w-16 md:h-16 rounded-2xl object-cover ring-4 ring-transparent group-hover/card:ring-primary/20 transition-all shadow-md" 
                          src={s.img}
                          referrerPolicy="no-referrer"
                        />
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-surface-container",
                          s.status === 'Ativo' ? "bg-green-500" : 
                          s.status === 'Inativo' ? "bg-red-500" :
                          "bg-orange-500"
                        )}></div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm md:text-lg text-on-surface group-hover/card:text-primary transition-colors truncate tracking-tight">{s.name}</p>
                        <p className="text-[10px] md:text-xs text-on-surface-variant font-semibold mt-0.5">{s.stats}</p>
                      </div>
                      <div className={cn(
                        "hidden sm:block px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                        s.status === 'Ativo' && "bg-green-500/10 text-green-600 dark:text-green-400",
                        s.status === 'Inativo' && "bg-red-500/10 text-red-600 dark:text-red-400",
                        s.status === 'Pendente' && "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                      )}>
                        {s.status}
                      </div>
                    </div>
                  ))}
                  {students.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage).length < itemsPerPage && 
                    Array.from({ length: itemsPerPage - students.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage).length }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex-1 invisible" />
                    ))
                  }
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
