import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  ShieldCheck, 
  Radio, 
  Clock, 
  Bot, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { DecisionBadge } from '../components/security/DecisionBadge';
import { ExecutionBadge } from '../components/security/ExecutionBadge';
import { RequestDetailDrawer } from '../components/security/RequestDetailDrawer';
import { permissionService } from '../services/permissionService';
import { ActionRequest } from '../types';

export const LiveMonitorPage: React.FC = () => {
  const [, setRefreshKey] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<ActionRequest | null>(null);

  useEffect(() => {
    return permissionService.subscribe(() => setRefreshKey(k => k + 1));
  }, []);

  const isPaused = permissionService.isLiveFeedPaused();
  const requests = permissionService.getRequests();
  const auditLogs = permissionService.getAuditEvents();

  return (
    <AppShell>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Live Authorization Event Monitor</span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                isPaused
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-cyan-400 animate-ping'}`}></span>
                {isPaused ? 'FEED PAUSED' : 'LIVE STREAM ACTIVE'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Recent demo requests and decisions loaded from the PermissionGuard API
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => permissionService.setLiveFeedPaused(!isPaused)}
              className={`px-4 py-2 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-sm ${
                isPaused
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-[#151E38] border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume Simulation Feed' : 'Pause Live Feed'}</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Status Strip */}
        <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E294B] flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isPaused ? 'text-amber-400' : 'text-[#46E5FF] animate-pulse'}`} />
            <span>INGESTION PROTOCOL: ZERO-TRUST PROXY</span>
          </div>
          <div>SIMULATION MODE: <strong className="text-cyan-300">ACTIVE</strong></div>
        </div>

        {/* Live Timeline Feed */}
        <div className="space-y-3">
          {requests.map(req => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="p-4 rounded-2xl bg-[#0B1020] border border-[#1E294B] hover:border-[#46E5FF]/40 transition-all cursor-pointer shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                  req.decision === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  req.decision === 'REQUIRE_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {req.decision === 'ALLOW' && <CheckCircle2 className="w-5 h-5" />}
                  {req.decision === 'REQUIRE_APPROVAL' && <AlertTriangle className="w-5 h-5" />}
                  {req.decision === 'DENY' && <XCircle className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono font-bold text-white text-xs">{req.id}</span>
                    <span className="font-mono text-xs text-slate-400">&middot; {req.agentName}</span>
                    <DecisionBadge decision={req.decision} size="sm" />
                    <ExecutionBadge status={req.executionStatus} size="sm" />
                  </div>

                  <div className="text-xs font-semibold text-slate-200">
                    {req.requestedOperation}
                  </div>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {req.decisionReason}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0 self-end md:self-auto">
                <div className="text-right">
                  <div className="text-slate-300">{req.applicablePolicyName}</div>
                  <div className="text-[11px] text-slate-500">{req.createdAt}</div>
                </div>

                <span className="text-[#46E5FF] group-hover:underline text-xs">
                  Inspect &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RequestDetailDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </AppShell>
  );
};
