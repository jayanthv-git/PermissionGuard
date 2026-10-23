import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play, 
  Pause, 
  Search, 
  Filter, 
  ExternalLink, 
  ChevronRight,
  Layers,
  Bot,
  Clock,
  Sparkles
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { RequestActivityChart } from '../components/charts/RequestActivityChart';
import { DecisionDonutChart } from '../components/charts/DecisionDonutChart';
import { DecisionBadge } from '../components/security/DecisionBadge';
import { RiskBadge } from '../components/security/RiskBadge';
import { ExecutionBadge } from '../components/security/ExecutionBadge';
import { RequestDetailDrawer } from '../components/security/RequestDetailDrawer';
import { permissionService } from '../services/permissionService';
import { ActionRequest, AuthorizationDecision, RiskLevel } from '../types';
import { Link, useRouter } from '../components/navigation/Router';

export const DashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const [, setRefreshKey] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<ActionRequest | null>(null);

  // Filters for recent activity table
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to service updates (approvals resolved, simulator runs, etc.)
  useEffect(() => {
    const unsubscribe = permissionService.subscribe(() => {
      setRefreshKey(k => k + 1);
    });
    return unsubscribe;
  }, []);

  const metrics = permissionService.getDashboardMetrics();
  const requests = permissionService.getRequests({
    decision: decisionFilter,
    riskLevel: riskFilter,
    query: searchQuery,
  });

  const isPaused = permissionService.isLiveFeedPaused();
  const liveEvents = permissionService.getAuditEvents().slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6 animate-fadeIn">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Security Operations Dashboard</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/30">
                Zero-Trust Active
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Local PermissionGuard API &middot; Persisted policy evaluations and review history
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/policies"
              className="px-3 py-1.5 rounded-lg bg-[#0E152B] hover:bg-[#151E38] border border-[#233157] text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <span>Test Simulator</span>
              <ExternalLink className="w-3 h-3 text-[#46E5FF]" />
            </Link>

            <Link
              href="/approvals"
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-mono text-amber-400 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Review Queue ({metrics.pendingApprovals})</span>
            </Link>
          </div>
        </div>

        {/* 4 OVERVIEW METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Evaluated */}
          <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E294B] flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Total Evaluated Requests
              </span>
              <div className="p-1.5 rounded-lg bg-[#46E5FF]/10 text-[#46E5FF]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {metrics.totalEvaluated}
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>Deterministic checks</span>
                <span className="text-emerald-400 font-mono">{metrics.avgLatencyMs === null ? 'No samples yet' : `${metrics.avgLatencyMs}ms avg`}</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#17203A] text-[10px] font-mono text-slate-500">
              SOURCE: DEMO SIMULATION
            </div>
          </div>

          {/* Card 2: Allowed Actions */}
          <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E294B] flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Allowed Actions
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
                {metrics.allowedActions}
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>Satisfied policies</span>
                <span className="text-slate-300 font-mono">
                  {Math.round((metrics.allowedActions / (metrics.totalEvaluated || 1)) * 100)}% of total
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#17203A] text-[10px] font-mono text-slate-500">
              EXECUTION: SEPARATELY BOUNDED
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="p-5 rounded-2xl bg-[#0B1020] border border-amber-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden shadow-glow-amber">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-300 uppercase tracking-wider font-semibold">
                Pending Approvals
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
                {metrics.pendingApprovals}
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-300">
                <span>Awaiting human reviewer</span>
                <Link href="/approvals" className="text-amber-300 underline font-mono">
                  Open queue &rarr;
                </Link>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-500/20 text-[10px] font-mono text-amber-400/80">
              STATUS: ACTION GATED AT GATEWAY
            </div>
          </div>

          {/* Card 4: Denied Actions */}
          <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E294B] flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Denied Actions
              </span>
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold font-mono text-red-400 tracking-tight">
                {metrics.deniedActions}
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>Violated security rules</span>
                <span className="text-red-400 font-mono">{metrics.criticalBlockedToday} Critical</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#17203A] text-[10px] font-mono text-slate-500">
              ENFORCEMENT: ZERO-TRUST BLOCKED
            </div>
          </div>
        </div>

        {/* CHARTS GRID: Request Activity Area Chart & Decision Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Time Series Area Chart */}
          <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-lg">
            <RequestActivityChart />
          </div>

          {/* Decision Outcome Donut Chart */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-lg flex flex-col justify-between">
            <DecisionDonutChart />
          </div>
        </div>

        {/* LIVE MONITOR FEED STRIP */}
        <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1E294B]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#46E5FF]/10 text-[#46E5FF]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                  Live Event Monitor
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {isPaused ? 'PAUSED' : 'STREAMING'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous simulated event feed &middot; Visibly labeled demo stream
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => permissionService.setLiveFeedPaused(!isPaused)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono transition-colors ${
                  isPaused 
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-[#151E38] border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                <span>{isPaused ? 'Resume Feed' : 'Pause Feed'}</span>
              </button>

              <Link
                href="/live-monitor"
                className="text-xs font-mono text-[#46E5FF] hover:underline flex items-center gap-1"
              >
                <span>Full Monitor</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Event Timeline Cards */}
          <div className="space-y-2">
            {liveEvents.map(event => (
              <div
                key={event.id}
                className="p-3 rounded-xl bg-[#0E1428] border border-[#1E294B] hover:border-[#46E5FF]/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {event.timestamp.slice(11, 19)}
                  </div>
                  <DecisionBadge decision={event.decision} size="sm" />
                  <div className="font-mono text-[#46E5FF] font-semibold">
                    {event.requestId}
                  </div>
                  <span className="text-slate-300 font-medium truncate max-w-xs">
                    {event.agentName}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                  <span className="truncate max-w-sm text-slate-300">{event.policyReference}</span>
                  <span className="text-slate-500 hidden lg:inline">Actor: {event.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY TABLE */}
        <div className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#1E294B]">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Recent Action Requests & Policy Evaluations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any row to open the complete inspection drawer and lifecycle trace
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter requests..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-white focus:outline-none focus:border-[#46E5FF] w-44"
                />
              </div>

              <select
                value={decisionFilter}
                onChange={e => setDecisionFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-slate-300 focus:outline-none focus:border-[#46E5FF]"
              >
                <option value="ALL">All Decisions</option>
                <option value="ALLOW">ALLOW</option>
                <option value="REQUIRE_APPROVAL">REQUIRE APPROVAL</option>
                <option value="DENY">DENY</option>
              </select>

              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-slate-300 focus:outline-none focus:border-[#46E5FF]"
              >
                <option value="ALL">All Risks</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-mono text-slate-500 uppercase border-b border-[#1E294B] bg-[#070A12]/50">
                <tr>
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Requested Action</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Decision</th>
                  <th className="py-2.5 px-3">Execution</th>
                  <th className="py-2.5 px-3">Policy ID</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17203A]">
                {requests.length > 0 ? (
                  requests.map(req => (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className="hover:bg-[#11172E] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3 font-mono font-semibold text-[#46E5FF]">
                        {req.id}
                      </td>
                      <td className="py-3 px-3 text-white font-medium">
                        {req.agentName}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-200 font-medium truncate max-w-xs">
                          {req.requestedOperation}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">
                          {req.resource}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <RiskBadge level={req.riskLevel} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <DecisionBadge decision={req.decision} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <ExecutionBadge status={req.executionStatus} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {req.applicablePolicyId}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-[#46E5FF] group-hover:underline font-mono text-[11px]">
                          Inspect &rarr;
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                      No requests matched the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Details Drawer */}
      <RequestDetailDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </AppShell>
  );
};
