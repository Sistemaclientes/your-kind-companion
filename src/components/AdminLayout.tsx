import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useMobile } from '@/hooks/useMobile';

export function AdminLayout() {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className={isMobile ? '' : 'pl-64'}>
        <Outlet />
      </div>
    </div>
  );
}
