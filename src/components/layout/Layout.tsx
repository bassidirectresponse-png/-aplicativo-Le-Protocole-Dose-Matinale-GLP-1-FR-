import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { InstallPrompt } from '../pwa/InstallPrompt';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center">
      <main className="flex-1 w-full max-w-md bg-white min-h-screen relative shadow-sm">
        <Outlet />
        <InstallPrompt />
      </main>
      <BottomNav />
    </div>
  );
};
