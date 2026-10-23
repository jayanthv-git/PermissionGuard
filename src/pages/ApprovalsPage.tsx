import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Bot, 
  ShieldAlert, 
  Lock, 
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { ApprovalModal } from '../components/approvals/ApprovalModal';
import { RiskBadge } from '../components/security/RiskBadge';
import { ExecutionBadge } from '../components/security/ExecutionBadge';
import { permissionService } from '../services/permissionService';
import { ApprovalItem } from '../types';

export const ApprovalsPage: React.FC = () => {
  const [, setRefreshKey] = useState(0);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return permissionService.subscribe(() => setRefreshKey(k => k + 1));
  }, []);

  const pendingApprovals = permissionService.getApprovals();
  const allHistory = permissionService.getAllApprovalsHistory().filter(a => a.status !== 'PENDING');

  // Sort: CRITICAL -> ELEVATED -> STANDARD
  pendingApprovals.sort((a, b) => {
    const urgencyWeight = { CRITICAL: 3, ELEVATED: 2, STANDARD: 1 };
    return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
  });

  const handleResolved = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fadeIn">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-xl animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Human Approval Queue</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                {pendingApprovals.length} Pending
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sensitive operations paused at the zero-trust authorization boundary awaiting verified human sign-off
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0B1020] border border-[#1E294B] text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#46E5FF]" />
            <span>Local demo: Approving records the reviewer decision and changes the request to ALLOW. No token is issued and no downstream action runs.</span>
          </div>
        </div>

        {/* PENDING APPROVAL CARDS */}
        {pendingApprovals.length > 0 ? (
          <div className="space-y-4">
            {pendingApprovals.map(item => {
              const req = item.request;
              const isCritical = item.urgency === 'CRITICAL';

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl bg-[#0B1020] border transition-all duration-200 shadow-xl ${
                    isCritical
                      ? 'border-red-500/40 shadow-glow-red'
                      : item.urgency === 'ELEVATED'
                      ? 'border-amber-500/40 shadow-glow-amber'
                      : 'border-[#1E294B] hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#1E294B]">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${
                        isCritical 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white">{item.id}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {req.id}
                          </span>
                          <RiskBadge level={req.riskLevel} size="sm" />
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                            isCritical ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            item.urgency === 'ELEVATED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {item.urgency} URGENCY
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Assigned Role: <span className="text-slate-200 font-medium">{item.assignedReviewerRole}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Submitted: <span className="text-slate-300">{item.submittedAt}</span>
                    </div>
                  </div>

                  {/* Proposed Action Payload details */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 space-y-2">
                      <div className="text-sm font-semibold text-white">
                        {req.requestedOperation}
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#070A12] border border-slate-800 text-xs font-mono">
                        <span className="text-slate-500 text-[10px] block uppercase mb-0.5">Target Resource</span>
                        <div className="text-cyan-300 break-all select-all">{req.resource}</div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300">
                        <span className="text-amber-400 font-mono text-[10px] uppercase font-bold block mb-0.5">
                          Triggering Reason for Review
                        </span>
                        {req.decisionReason}
                      </div>
                    </div>

                    {/* Action Review Button */}
                    <div className="md:col-span-4 flex flex-col gap-2 justify-center">
                      <button
                        onClick={() => setSelectedApproval(item)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-glow-amber flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-black" />
                        <span>Inspect & Authorize</span>
                      </button>

                      <div className="text-center text-[10px] font-mono text-slate-500">
                        Zero-Trust policy requires affirmative review
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-[#0B1020] border border-[#1E294B] text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Approval Queue is Clear</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All sensitive AI-agent action requests have been reviewed and resolved. 
              New requests matching review triggers will appear here automatically.
            </p>
          </div>
        )}

        {/* RECENTLY RESOLVED APPROVALS HISTORY */}
        {allHistory.length > 0 && (
          <div className="pt-6">
            <h3 className="text-sm font-semibold text-white tracking-wide mb-3">
              Recently Resolved Decisions
            </h3>
            <div className="rounded-2xl bg-[#0B1020] border border-[#1E294B] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-mono text-slate-500 uppercase border-b border-[#1E294B] bg-[#070A12]/60">
                    <tr>
                      <th className="py-2.5 px-3">Item ID</th>
                      <th className="py-2.5 px-3">Request ID</th>
                      <th className="py-2.5 px-3">Agent</th>
                      <th className="py-2.5 px-3">Resolution Decision</th>
                      <th className="py-2.5 px-3">Resolved By</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17203A]">
                    {allHistory.map(hist => (
                      <tr key={hist.id} className="hover:bg-[#0E1428]">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{hist.id}</td>
                        <td className="py-2.5 px-3 font-mono text-[#46E5FF] font-semibold">{hist.requestId}</td>
                        <td className="py-2.5 px-3 text-white">{hist.request.agentName}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            hist.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {hist.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{hist.resolvedBy}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{hist.resolvedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ApprovalModal
        approval={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onResolved={handleResolved}
      />
    </AppShell>
  );
};
