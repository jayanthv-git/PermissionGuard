import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Download, 
  Search, 
  Filter, 
  RotateCcw, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X, 
  FileJson,
  FileSpreadsheet,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { DecisionBadge } from '../components/security/DecisionBadge';
import { permissionService } from '../services/permissionService';
import { AuditEvent } from '../types';

export const AuditPage: React.FC = () => {
  const [, setRefreshKey] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const [query, setQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');

  useEffect(() => {
    return permissionService.subscribe(() => setRefreshKey(k => k + 1));
  }, []);

  const events = permissionService.getAuditEvents({
    query,
    decision: decisionFilter,
    eventType: eventTypeFilter,
  });

  return (
    <AppShell>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Security Audit Trail</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {events.length} Events Logged
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Deterministic traceability log for AI-agent evaluations, policy matches, and human review decisions
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => permissionService.exportAuditCSV()}
              className="px-3.5 py-1.5 rounded-lg bg-[#0E152B] hover:bg-[#151E38] border border-[#233157] text-xs font-mono text-white transition-all flex items-center gap-1.5 shadow-sm"
              title="Download visible logs as structured CSV file"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => permissionService.exportAuditJSON()}
              className="px-3.5 py-1.5 rounded-lg bg-[#0E152B] hover:bg-[#151E38] border border-[#233157] text-xs font-mono text-white transition-all flex items-center gap-1.5 shadow-sm"
              title="Download structured JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-[#46E5FF]" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Audit Integrity Disclosure Banner */}
        <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E294B] flex items-start gap-3">
          <Lock className="w-4 h-4 text-[#46E5FF] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-white block mb-0.5">Audit Integrity & Disclosure Notice</span>
            <p className="text-slate-400 leading-relaxed">
              These events are stored by the local PermissionGuard API in SQLite. This demo does not provide immutable storage, user authentication, or a production audit guarantee.
            </p>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-md grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Event ID, Request ID, Actor..."
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
              value={eventTypeFilter}
              onChange={e => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-slate-300 focus:outline-none focus:border-[#46E5FF]"
            >
              <option value="ALL">Event Type: All Types</option>
              <option value="EVALUATION_COMPLETED">EVALUATION_COMPLETED</option>
              <option value="APPROVAL_REQUESTED">APPROVAL_REQUESTED</option>
              <option value="APPROVAL_GRANTED">APPROVAL_GRANTED</option>
              <option value="APPROVAL_DENIED">APPROVAL_DENIED</option>
              <option value="POLICY_EVALUATION">POLICY_EVALUATION</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-2xl bg-[#0B1020] border border-[#1E294B] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-mono text-slate-500 uppercase border-b border-[#1E294B] bg-[#070A12]/60">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Request Ref</th>
                  <th className="py-3 px-4">Agent Identity</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Policy Reference</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17203A]">
                {events.length > 0 ? (
                  events.map(ev => (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="hover:bg-[#11172E] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {ev.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {ev.timestamp}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#46E5FF]">
                        {ev.requestId}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {ev.agentName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] uppercase text-slate-300">
                        {ev.eventType}
                      </td>
                      <td className="py-3 px-4">
                        <DecisionBadge decision={ev.decision} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px] truncate max-w-xs">
                        {ev.policyReference}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                        {ev.actor}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[#46E5FF] group-hover:underline font-mono text-xs">
                          View &rarr;
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-mono">
                      No audit records match the selected search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Event Detail Drawer */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
            <div 
              className="w-full max-w-xl bg-[#090D1A] border-l border-[#1E294B] h-full shadow-2xl flex flex-col justify-between overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#1E294B] bg-[#0B1020] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">{selectedEvent.id}</h3>
                    <span className="text-xs text-slate-400 font-mono">{selectedEvent.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B] space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">EVENT TYPE</span>
                    <span className="text-white font-bold">{selectedEvent.eventType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">TARGET REQUEST</span>
                    <span className="text-[#46E5FF] font-bold">{selectedEvent.requestId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">REQUESTING AGENT</span>
                    <span className="text-white">{selectedEvent.agentName} ({selectedEvent.agentId})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">AUTHORIZATION DECISION</span>
                    <DecisionBadge decision={selectedEvent.decision} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">RECORDED ACTOR</span>
                    <span className="text-slate-200">{selectedEvent.actor}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B]">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    RECORDED AUDIT OUTCOME
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedEvent.outcome}
                  </p>
                </div>

                {selectedEvent.details && (
                  <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B]">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">
                      EVENT CONTEXT PAYLOAD
                    </span>
                    <pre className="p-3 rounded bg-[#070A12] border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                      {JSON.stringify(selectedEvent.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[#1E294B] bg-[#0B1020] flex items-center justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
