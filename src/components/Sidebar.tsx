import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeContext';
import logoUplife from '../assets/logo-uplife.png';

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Provas', path: '/admin/exams' },
    { icon: Users, label: 'Alunos', path: '/admin/students' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col p-4 gap-2 z-50 border-r border-outline">
      <div className="px-2 py-4 mb-2 flex flex-col items-center gap-3">
        <img src={logoUplife} alt="UpLife Educacional" className="w-14 h-14 rounded-full object-cover" />
        <div className="text-center flex flex-col gap-0.5">
          <p className="text-[11px] font-bold text-on-surface leading-tight">
            Hora: {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[10px] font-semibold text-on-surface-variant leading-tight">
            Data: {currentTime.toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "sidebar-item-saas",
              isActive 
                ? "bg-primary/10 text-primary border-l-3 border-primary shadow-sm" 
                : "text-on-surface-variant"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <button
          onClick={toggleTheme}
          className="sidebar-item-saas w-full text-on-surface-variant"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-5 h-5" />
              <span>Modo Escuro</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5" />
              <span>Modo Claro</span>
            </>
          )}
        </button>

        <div className="p-4 bg-surface-container-high rounded-2xl border border-outline">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary text-xs font-bold shadow-lg shadow-primary/20">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-on-surface">Admin Master</p>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase truncate">admin@avaliapro.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
