import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  RotateCcw, 
  Server, 
  ShieldCheck, 
  Sliders, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Sparkles,
  Info
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { permissionService } from '../services/permissionService';
import { checkBackendHealth, BackendStatus, API_BASE_URL } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Display preferences
  const [timeDisplayFormat, setTimeDisplayFormat] = useState<'UTC' | 'LOCAL'>('UTC');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    handleCheckBackend();
  }, []);

  const handleCheckBackend = async () => {
    setIsCheckingBackend(true);
    const status = await checkBackendHealth();
    setBackendStatus(status);
    setIsCheckingBackend(false);
  };

  const handleResetData = async () => {
    try {
      await permissionService.resetDemoData();
      setResetMessage('Demonstration state successfully reset to initial seed dataset.');
      setTimeout(() => setResetMessage(null), 4000);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not reset demo data.');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fadeIn max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Settings & System Status</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Platform preferences, simulation controls, and backend integration diagnostics
            </p>
          </div>
        </div>

        {/* Reset Confirmation Toast */}
        {resetMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{resetMessage}</span>
            </div>
            <button onClick={() => setResetMessage(null)} className="text-emerald-400 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* SECTION 1: SIMULATION & DEMO CONTROLS */}
        <div className="p-6 rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-lg space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E294B]">
            <Radio className="w-5 h-5 text-[#46E5FF]" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Simulation & Demonstration Controls
              </h3>
              <p className="text-xs text-slate-400">
                Manage deterministic demo datasets, streaming telemetry, and scenario states
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#0E1428] border border-[#1E294B]">
              <span className="text-slate-500 block text-[10px] uppercase mb-1">DEMO MODE STATUS</span>
              <span className="text-[#46E5FF] font-bold text-sm block">ACTIVE (LOCAL SIMULATION)</span>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
              Requests are evaluated by the local API and stored in SQLite. No external services are called.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E1428] border border-[#1E294B] flex flex-col justify-between">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase mb-1">RESET DEMONSTRATION</span>
                <p className="text-slate-400 text-[11px] font-sans">
                  Restores all requests, pending approvals, and audit records to default seed state.
                </p>
              </div>
              <button
                onClick={handleResetData}
                className="mt-3 py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Demo Data Now
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: BACKEND INTEGRATION STATUS */}
        <div className="p-6 rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E294B]">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-[#8B7CFF]" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Backend Integration Diagnostics
                </h3>
                <p className="text-xs text-slate-400">
                  Target API configuration and live connectivity status
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckBackend}
              disabled={isCheckingBackend}
              className="px-3 py-1.5 rounded-lg bg-[#151E38] hover:bg-[#1E294B] border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
            >
              {isCheckingBackend ? 'Pinging...' : 'Check Health'}
            </button>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#0E1428] border border-[#1E294B] flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase mb-0.5">PERMISSIONGUARD API URL</span>
                <span className="text-cyan-300">{API_BASE_URL}</span>
              </div>
              <div>
                {backendStatus?.isConnected ? (
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    CONNECTED ({backendStatus.latencyMs}ms)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    DISCONNECTED (LOCAL API UNAVAILABLE)
                  </span>
                )}
              </div>
            </div>

            {backendStatus?.error && (
              <div className="p-3 rounded-lg bg-[#070A12] border border-slate-800 text-[11px] text-slate-400">
                <span className="text-slate-500 font-bold block mb-0.5">DIAGNOSTIC STATUS:</span>
                {backendStatus.error}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: SECURITY ARCHITECTURE & BOUNDARIES */}
        <div className="p-6 rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E294B]">
            <Lock className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Security Boundaries & Enforcement Realism
              </h3>
              <p className="text-xs text-slate-400">
                Explicit architectural separation of authorization from execution
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-[#0E1428] border border-[#1E294B]">
              <strong className="text-white block mb-1">What PermissionGuard Enforces:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Deterministic zero-trust policy evaluation against proposed action payloads.</li>
                <li>Dynamic risk classification (LOW &middot; MEDIUM &middot; HIGH &middot; CRITICAL).</li>
                <li>Human authorization hold on sensitive operations (emails, bulk exports, database mutations).</li>
                <li>Audit trail event logging recording every evaluation and reviewer decision.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E1428] border border-[#1E294B]">
              <strong className="text-white block mb-1">Execution Boundary Disclosure:</strong>
              <p className="text-slate-400 text-xs">
                Rendering an <code>ALLOW</code> or <code>APPROVED</code> decision does not prove that an action 
                was executed against a real external service. The API stores approvals and decisions in local SQLite; 
                no PermissionGuard execution adapter is connected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
