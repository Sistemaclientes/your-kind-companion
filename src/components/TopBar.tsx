import React from 'react';
import { Search, Bell } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-40 bg-surface/70 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-outline">
      <div className="flex items-center gap-4 sm:gap-6 ml-12 lg:ml-0">
        <div className="flex flex-col">
          <h2 className="font-semibold text-on-surface text-base sm:text-lg leading-tight tracking-tight">{title}</h2>
          {subtitle && <span className="text-xs text-on-surface-variant font-medium hidden sm:block mt-0.5">{subtitle}</span>}
        </div>
        <div className="relative items-center hidden md:flex">
          <Search className="absolute left-3.5 text-on-surface-variant w-4 h-4" />
          <input 
            className="pl-10 pr-4 py-2 bg-surface-container-low text-on-surface border border-outline rounded-xl text-sm w-64 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40 outline-none" 
            placeholder="Buscar..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
          <Bell className="w-[18px] h-[18px]" />
        </button>
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary-container overflow-hidden ml-1 ring-2 ring-outline shadow-md">
          <img 
            alt="Avatar" 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
