import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Sun,
  Moon,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/ThemeContext';
import { useMobile } from '@/hooks/useMobile';
import { AnimatePresence, motion } from 'motion/react';

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useMobile();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Provas', path: '/admin/exams' },
    { icon: Users, label: 'Alunos', path: '/admin/students' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  const sidebarContent = (
    <>
      <div className="px-4 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Zap className="w-5 h-5 text-on-primary" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-lg font-headline font-extrabold text-on-surface tracking-tight leading-none">AvaliaPro</h1>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Plataforma SaaS</p>
        </div>
        {isMobile && (
          <button onClick={() => setOpen(false)} className="ml-auto p-2 text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container-high transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex flex-col gap-1 flex-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setOpen(false)}
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

      <div className="mt-auto flex flex-col gap-4 px-3 pb-4">
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
    </>
  );

  // Mobile: hamburger trigger + overlay drawer
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-surface-container border border-outline flex items-center justify-center text-on-surface-variant shadow-md hover:shadow-lg transition-all"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
                onClick={() => setOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-screen w-72 bg-surface-container flex flex-col z-[80] border-r border-outline shadow-2xl"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col z-50 border-r border-outline">
      {sidebarContent}
    </aside>
  );
}
