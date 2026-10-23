import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  UserCheck, 
  FileText, 
  Bot,
  Layers,
  Lock
} from 'lucide-react';
import { ApprovalItem } from '../../types';
import { permissionService } from '../../services/permissionService';
import { RiskBadge } from '../security/RiskBadge';

interface ApprovalModalProps {
  approval: ApprovalItem | null;
  onClose: () => void;
  onResolved: (message: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ approval, onClose, onResolved }) => {
  if (!approval) return null;

  const [decisionType, setDecisionType] = useState<'APPROVE' | 'DENY' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('SecOps Lead (You)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPrompt, setConfirmPrompt] = useState(false);

  const req = approval.request;

  const handleExecuteDecision = () => {
    if (!decisionType) return;
    setIsSubmitting(true);

    setTimeout(async () => {
      try {
      const res = await permissionService.resolveApproval(
        approval.id, 
        decisionType, 
        reviewNotes, 
        reviewerName
      );

      if (res.success) {
        onResolved(res.message);
        onClose();
      } else {
        alert(res.message);
      }
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Could not save the review.');
      } finally {
        setIsSubmitting(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#090D1A] border border-[#233157] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1E294B] bg-[#0B1020] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">HUMAN AUTHORIZATION REVIEW</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                  {approval.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Request: <span className="font-mono text-[#46E5FF]">{req.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Action Overview Box */}
          <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Bot className="w-4 h-4 text-[#46E5FF]" />
                <span>REQUESTING AGENT:</span>
                <span className="text-white font-semibold">{req.agentName} ({req.agentId})</span>
              </div>
              <RiskBadge level={req.riskLevel} />
            </div>

            <div>
              <span className="text-slate-500 text-xs font-mono block">PROPOSED OPERATION:</span>
              <div className="text-sm font-semibold text-white mt-0.5">
                {req.requestedOperation}
              </div>
            </div>

            <div>
              <span className="text-slate-500 text-xs font-mono block mb-1">TARGET RESOURCE:</span>
              <div className="p-2 rounded bg-[#070A12] border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                {req.resource}
              </div>
            </div>

            {req.context.justification && (
              <div className="p-3 rounded-lg bg-[#070A12] border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-500 font-mono text-[10px] uppercase block mb-1">Agent Justification</span>
                "{req.context.justification}"
              </div>
            )}
          </div>

          {/* Why Approval is Required Box */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-amber-400">
                  Why Human Oversight is Required
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {req.decisionReason}
                </p>
                <div className="mt-2 text-[11px] font-mono text-slate-400">
                  Triggered Policy: <span className="text-slate-200">{req.applicablePolicyName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explicit Operational Notice */}
          <div className="p-3 rounded-lg bg-[#070A12] border border-[#1E294B] text-[11px] font-mono text-slate-400 flex items-start gap-2">
            <Lock className="w-4 h-4 text-[#46E5FF] shrink-0 mt-0.5" />
            <span>
              <strong>Local Demo:</strong> Approving records a human decision in this browser and changes the request to ALLOW. 
              No authorization token is issued and no downstream service or action is called; execution remains NOT EXECUTED.
            </span>
          </div>

          {/* Review Decision Form */}
          {!confirmPrompt ? (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  REVIEWER IDENTITY
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-white focus:outline-none focus:border-[#46E5FF]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  REVIEW NOTES / RATIONALE (Mandatory for Denials)
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Enter audit rationale, conditions, or reason for denial..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-white focus:outline-none focus:border-[#46E5FF] placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDecisionType('DENY');
                    setConfirmPrompt(true);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  DENY REQUEST
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecisionType('APPROVE');
                    setConfirmPrompt(true);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-semibold text-xs transition-colors shadow-glow-emerald"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  APPROVE REQUEST
                </button>
              </div>
            </div>
          ) : (
            /* Explicit Confirmation Step */
            <div className="p-4 rounded-xl bg-[#11172E] border border-[#2A3766] space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-mono text-white">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>CONFIRM AUTHORIZATION DECISION</span>
              </div>
              <p className="text-xs text-slate-300">
                You are about to issue a <strong>{decisionType}</strong> decision for action{' '}
                <span className="font-mono text-[#46E5FF]">{req.id}</span>.
                This decision will be permanently committed to the audit trail under actor{' '}
                <span className="font-mono text-white">{reviewerName}</span>.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmPrompt(false)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDecision}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    decisionType === 'APPROVE'
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-red-500 text-white hover:bg-red-400'
                  }`}
                >
                  {isSubmitting ? 'Recording Audit...' : `Confirm & Commit ${decisionType}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
