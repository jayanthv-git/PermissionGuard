import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  RotateCcw, 
  Bot, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { DecisionBadge } from '../components/security/DecisionBadge';
import { RiskBadge } from '../components/security/RiskBadge';
import { ExecutionBadge } from '../components/security/ExecutionBadge';
import { RequestDetailDrawer } from '../components/security/RequestDetailDrawer';
import { permissionService } from '../services/permissionService';
import { ActionRequest, AuthorizationDecision, RiskLevel } from '../types';

export const RequestsPage: React.FC = () => {
  const [, setRefreshKey] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<ActionRequest | null>(null);

  const [query, setQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'RISK_HIGH'>('NEWEST');

  useEffect(() => {
    return permissionService.subscribe(() => setRefreshKey(k => k + 1));
  }, []);

  const agents = permissionService.getAgents();
  let requests = permissionService.getRequests({
    query,
    decision: decisionFilter,
    riskLevel: riskFilter,
    agentId: agentFilter,
  });

  // Sort
  if (sortBy === 'RISK_HIGH') {
    const riskOrder: Record<RiskLevel, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    requests.sort((a, b) => riskOrder[b.riskLevel] - riskOrder[a.riskLevel]);
  }

  const resetFilters = () => {
    setQuery('');
    setDecisionFilter('ALL');
    setRiskFilter('ALL');
    setAgentFilter('ALL');
    setSortBy('NEWEST');
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Proposed Action Requests</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {requests.length} Records
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Requests evaluated and recorded by the local PermissionGuard API
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#0E152B] hover:bg-[#151E38] border border-[#233157] text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3 text-[#46E5FF]" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Agent, Resource, Reason..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-white focus:outline-none focus:border-[#46E5FF]"
            />
          </div>

          <div>
            <select
              value={decisionFilter}
              onChange={e => setDecisionFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-slate-300 focus:outline-none focus:border-[#46E5FF]"
            >
              <option value="ALL">Decision: All Outcomes</option>
              <option value="ALLOW">ALLOW</option>
              <option value="REQUIRE_APPROVAL">REQUIRE APPROVAL</option>
              <option value="DENY">DENY</option>
            </select>
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-slate-300 focus:outline-none focus:border-[#46E5FF]"
            >
              <option value="ALL">Risk: All Profiles</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div>
            <select
              value={agentFilter}
              onChange={e => setAgentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-slate-300 focus:outline-none focus:border-[#46E5FF]"
            >
              <option value="ALL">Agent: All Registered</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Structured Requests List Table */}
        <div className="rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-mono text-slate-500 uppercase border-b border-[#1E294B] bg-[#070A12]/60">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Agent Identifier</th>
                  <th className="py-3 px-4">Action & Resource Target</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Execution Status</th>
                  <th className="py-3 px-4">Policy Reference</th>
                  <th className="py-3 px-4 text-right">Action</th>
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
                      <td className="py-3.5 px-4 font-mono font-bold text-[#46E5FF]">
                        {req.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{req.agentName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{req.agentId}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="text-slate-200 font-medium truncate">
                          {req.requestedOperation}
                        </div>
                        <div className="text-[10px] font-mono text-cyan-300 truncate">
                          {req.resource}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={req.riskLevel} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <DecisionBadge decision={req.decision} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <ExecutionBadge status={req.executionStatus} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        <div>{req.applicablePolicyName}</div>
                        {req.matchedRuleId && (
                          <div className="text-slate-500 text-[10px]">{req.matchedRuleId}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[#46E5FF] group-hover:underline font-mono text-xs">
                          Inspect &rarr;
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                      No action requests match the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RequestDetailDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </AppShell>
  );
};
