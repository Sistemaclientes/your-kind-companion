import React from 'react';
import { Search, Bell, Settings as SettingsIcon } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 py-3 border-b border-outline-variant">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h2 className="font-headline font-extrabold text-on-surface text-lg leading-tight">{title}</h2>
          {subtitle && <span className="text-xs text-on-surface-variant font-medium">{subtitle}</span>}
        </div>
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-on-surface-variant w-4 h-4" />
          <input 
            className="pl-10 pr-4 py-1.5 bg-surface-container-low text-on-surface border-none rounded-full text-xs w-64 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50" 
            placeholder="Buscar..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
          < Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
          <SettingsIcon className="w-5 h-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-surface-container-high overflow-hidden ml-2 border border-outline-variant">
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
