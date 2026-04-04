import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
import { api } from '../lib/api';
import { useAuthStore } from '../lib/authStore';
import logoUplife from '../assets/logo-uplife.png';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [customLogo, setCustomLogo] = React.useState<string | null>(null);
  const user = api.getUser();

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const loadLogo = () => {
      const saved = localStorage.getItem('institution_logo');
      setCustomLogo(saved);
    };
    loadLogo();
    window.addEventListener('logo-updated', loadLogo);
    return () => window.removeEventListener('logo-updated', loadLogo);
  }, []);

  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Provas', path: '/admin/exams' },
    { icon: Users, label: 'Alunos', path: '/admin/students' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  return (
    <aside className={cn(
      "h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col p-4 gap-1 z-50 border-r border-outline transition-transform duration-300 ease-out",
      "lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo & Time */}
      <div className="px-3 py-5 mb-3 flex flex-col items-start gap-3">
        <img src={customLogo || logoUplife} alt="Logo" className="w-12 h-12 rounded-xl object-cover ring-2 ring-outline shadow-md" />
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-on-surface tabular-nums">
            Hora: {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-on-surface-variant font-medium tabular-nums">
            Data: {currentTime.toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onClose?.()}
            className={({ isActive }) => cn(
              "sidebar-item-saas group",
              isActive 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <item.icon className="w-[18px] h-[18px] transition-transform group-hover:scale-110" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-outline">
        <button
          onClick={toggleTheme}
          className="sidebar-item-saas w-full text-on-surface-variant group"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              <span>Modo Escuro</span>
            </>
          ) : (
            <>
              <Sun className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              <span>Modo Claro</span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="sidebar-item-saas w-full text-error/60 hover:text-error hover:bg-error/5 group"
        >
          <LogOut className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
          <span>Sair</span>
        </button>

        <div className="p-3.5 bg-surface-container-high/50 rounded-2xl border border-outline mt-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-xs font-bold shadow-lg shadow-primary/20">
              {user?.nome?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold truncate text-on-surface">{user?.nome || 'Admin'}</p>
              <p className="text-[10px] text-on-surface-variant font-medium truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
