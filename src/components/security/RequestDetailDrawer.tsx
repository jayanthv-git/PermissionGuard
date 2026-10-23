import React from 'react';
import { 
  X, 
  Bot, 
  ShieldCheck, 
  Clock, 
  Layers, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileText,
  Terminal,
  Database,
  ExternalLink
} from 'lucide-react';
import { ActionRequest } from '../../types';
import { DecisionBadge } from './DecisionBadge';
import { RiskBadge } from './RiskBadge';
import { ExecutionBadge } from './ExecutionBadge';

interface RequestDetailDrawerProps {
  request: ActionRequest | null;
  onClose: () => void;
}

export const RequestDetailDrawer: React.FC<RequestDetailDrawerProps> = ({ request, onClose }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#090D1A] border-l border-[#1E294B] h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#1E294B] flex items-center justify-between bg-[#0B1020]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{request.id}</h3>
                <DecisionBadge decision={request.decision} size="sm" />
                <RiskBadge level={request.riskLevel} size="sm" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{request.requestedOperation}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Overview Card */}
          <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B]">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#46E5FF]" />
              Agent & Action Context
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-mono block">AGENT NAME</span>
                <span className="text-white font-medium">{request.agentName} ({request.agentId})</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono block">ACTION CATEGORY</span>
                <span className="text-[#46E5FF] font-mono font-semibold">{request.actionType}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 font-mono block mb-1">TARGET RESOURCE</span>
                <div className="p-2 rounded bg-[#070A12] border border-slate-800 font-mono text-[11px] text-cyan-300 break-all select-all">
                  {request.resource}
                </div>
              </div>
              {request.context.justification && (
                <div className="col-span-2">
                  <span className="text-slate-500 font-mono block mb-1">AGENT JUSTIFICATION</span>
                  <div className="p-2.5 rounded bg-[#070A12] border border-slate-800 text-slate-300 text-xs italic">
                    "{request.context.justification}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Policy Evaluation Explanation */}
          <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B]">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B7CFF]" />
              Policy Engine Findings
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Applicable Policy:</span>
                <span className="font-mono text-[#8B7CFF] font-semibold">{request.applicablePolicyName}</span>
              </div>
              {request.matchedRuleId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Matched Rule:</span>
                  <span className="font-mono text-amber-300">{request.matchedRuleId}</span>
                </div>
              )}
              <div className="p-3 rounded-lg bg-[#070A12] border border-slate-800">
                <span className="text-slate-500 font-mono text-[10px] block uppercase mb-1">Evaluation Reason</span>
                <p className="text-slate-300 leading-relaxed">{request.decisionReason}</p>
              </div>
            </div>
          </div>

          {/* Execution Boundary Diagnostic */}
          <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Operational Execution Status
              </h4>
              <ExecutionBadge status={request.executionStatus} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              PermissionGuard enforces policy evaluation at the authorization gateway. Downstream systems 
              are responsible for executing permitted actions and returning status confirmations.
            </p>
          </div>

          {/* Lifecycle Event Timeline */}
          <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B]">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Traceable Lifecycle Timeline
            </h4>
            
            <div className="relative pl-6 space-y-5 border-l-2 border-[#1E294B] ml-2 text-xs font-mono">
              {/* Event 1: Created */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-[#46E5FF] ring-4 ring-[#090D1A]"></span>
                <div className="text-white font-semibold">REQUEST CREATED</div>
                <div className="text-slate-500 text-[11px]">{request.createdAt}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Proposed by agent {request.agentName}</div>
              </div>

              {/* Event 2: Evaluated */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-[#8B7CFF] ring-4 ring-[#090D1A]"></span>
                <div className="text-white font-semibold">POLICY EVALUATED</div>
                <div className="text-slate-500 text-[11px]">Matched against {request.applicablePolicyName}</div>
              </div>

              {/* Event 3: Decision Issued */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-3 h-3 rounded-full ring-4 ring-[#090D1A] ${
                  request.decision === 'ALLOW' ? 'bg-emerald-400' :
                  request.decision === 'REQUIRE_APPROVAL' ? 'bg-amber-400' : 'bg-red-400'
                }`}></span>
                <div className="text-white font-semibold">DECISION ISSUED: {request.decision}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{request.decisionReason}</div>
              </div>

              {/* Event 4: Human Review (if applicable) */}
              {request.reviewedBy && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-[#090D1A]"></span>
                  <div className="text-white font-semibold">REVIEW DECISION RECORDED</div>
                  <div className="text-slate-500 text-[11px]">{request.reviewedAt} by {request.reviewedBy}</div>
                  {request.reviewNotes && (
                    <div className="text-slate-300 text-[11px] mt-1 italic">Notes: "{request.reviewNotes}"</div>
                  )}
                </div>
              )}

              {/* Event 5: Audit Event */}
              {request.auditEventId && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-[#090D1A]"></span>
                  <div className="text-white font-semibold">AUDIT EVENT WRITTEN</div>
                  <div className="text-slate-500 text-[11px]">Record reference ID: {request.auditEventId}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#1E294B] bg-[#0B1020] flex items-center justify-between text-xs font-mono text-slate-500">
          <span>EVENT TRACE ID: {request.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-sans transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
