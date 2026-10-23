import React, { useEffect, useState } from 'react';
import { RouterProvider, useRouter } from './components/navigation/Router';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RequestsPage } from './pages/RequestsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AgentRegistryPage } from './pages/AgentRegistryPage';
import { AuditPage } from './pages/AuditPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { SettingsPage } from './pages/SettingsPage';
import { permissionService } from './services/permissionService';

const AppContent: React.FC = () => {
  const { currentPath } = useRouter();

  // Route matching (normalizes paths and hashes)
  const normalizedPath = currentPath.toLowerCase().replace(/\/+$/, '') || '/';

  switch (normalizedPath) {
    case '/':
      return <LandingPage />;
    case '/dashboard':
      return <DashboardPage />;
    case '/requests':
      return <RequestsPage />;
    case '/approvals':
      return <ApprovalsPage />;
    case '/policies':
      return <PoliciesPage />;
    case '/agents':
      return <AgentRegistryPage />;
    case '/audit':
      return <AuditPage />;
    case '/live-monitor':
      return <LiveMonitorPage />;
    case '/settings':
      return <SettingsPage />;
    default:
      // Fallback: if user went to /#how-it-works or similar anchor
      if (normalizedPath.startsWith('/#')) {
        return <LandingPage />;
      }
      return <DashboardPage />;
  }
};

export const App: React.FC = () => {
  const [boot, setBoot] = useState<'loading' | 'ready' | 'error'>('loading');
  const [bootError, setBootError] = useState('');

  const connect = () => {
    setBoot('loading');
    setBootError('');
    permissionService.initialize()
      .then(() => setBoot('ready'))
      .catch(error => {
        setBootError(error instanceof Error ? error.message : 'Could not connect to the PermissionGuard API.');
        setBoot('error');
      });
  };

  useEffect(() => { connect(); }, []);

  useEffect(() => {
    if (boot !== 'ready') return;
    const poll = window.setInterval(() => { permissionService.refresh().catch(() => undefined); }, 5000);
    return () => window.clearInterval(poll);
  }, [boot]);

  if (boot === 'loading') {
    return <div className="min-h-screen bg-[#070A12] text-slate-200 grid place-items-center font-mono text-sm">Connecting to PermissionGuard API…</div>;
  }
  if (boot === 'error') {
    return (
      <div className="min-h-screen bg-[#070A12] text-slate-200 grid place-items-center p-6">
        <div className="max-w-lg rounded-2xl border border-rose-500/30 bg-[#0B1020] p-6 shadow-xl">
          <h1 className="text-lg font-bold">PermissionGuard API is unavailable</h1>
          <p className="mt-2 text-sm text-slate-400">Start the backend and frontend with <code className="text-cyan-300">npm run dev</code>, then retry. {bootError}</p>
          <button onClick={connect} className="mt-5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950">Retry connection</button>
        </div>
      </div>
    );
  }
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
};

export default App;
