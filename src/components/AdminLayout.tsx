import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="pl-64">
        <Outlet />
      </div>
    </div>
  );
}
