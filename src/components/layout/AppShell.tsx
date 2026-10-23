import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GuidedDemoModal } from '../demo/GuidedDemoModal';

export const AppShell: React.FC<{
  children: React.ReactNode;
  onOpenGuidedDemo?: () => void;
}> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guidedDemoOpen, setGuidedDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenGuidedDemo={() => setGuidedDemoOpen(true)}
      />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenGuidedDemo={() => setGuidedDemoOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <GuidedDemoModal
        isOpen={guidedDemoOpen}
        onClose={() => setGuidedDemoOpen(false)}
      />
    </div>
  );
};
