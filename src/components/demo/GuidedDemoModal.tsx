import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Bot, 
  Layers, 
  UserCheck, 
  FileCheck2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { permissionService } from '../../services/permissionService';
import { DecisionBadge } from '../security/DecisionBadge';
import { ExecutionBadge } from '../security/ExecutionBadge';
import { ActionRequest, AuthorizationDecision } from '../../types';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToQueue?: () => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({ 
  isOpen, 
  onClose,
  onNavigateToQueue 
}) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);
  const [evaluating, setEvaluating] = useState(false);
  const [stepResult, setStepResult] = useState<{
    request: ActionRequest;
    decision: AuthorizationDecision;
    policyName: string;
    reason: string;
  } | null>(null);

  const [humanReviewOutcome, setHumanReviewOutcome] = useState<'PENDING' | 'APPROVED' | 'DENIED'>('PENDING');

  const scenarios = [
    {
      title: 'Scenario A — Permitted Read',
      badge: 'ALLOW WORKFLOW',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      agent: 'Research Assistant (AGT-8401)',
      action: 'READ_DOCUMENT',
      resource: 'doc://enterprise/handbooks/security-standards-2026.md',
      intent: 'Agent retrieves internal security guidelines for employee orientation compilation.',
      policy: 'POL-READ-01 (Safe Read Operations)',
      expectedDecision: 'ALLOW' as AuthorizationDecision,
      rule: 'RULE-R01 (Certified Knowledge Whitelist)',
      reason: 'Resource matches certified public enterprise documentation prefix. Zero PII or live secrets detected.',
    },
    {
      title: 'Scenario B — Human-in-the-Loop Approval',
      badge: 'APPROVAL WORKFLOW',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      agent: 'Email Workflow Agent (AGT-8402)',
      action: 'SEND_EMAIL',
      resource: 'smtp://gateway.mail.com/vendor-partner-outreach',
      intent: 'Agent proposes dispatching enterprise service agreement renewal to an external third-party partner.',
      policy: 'POL-EMAIL-02 (Sensitive Outbound Communication)',
      expectedDecision: 'REQUIRE_APPROVAL' as AuthorizationDecision,
      rule: 'RULE-E02 (External Outreach Boundary)',
      reason: 'Outbound communication targets an external domain outside enterprise perimeter; routed to human security queue.',
    },
    {
      title: 'Scenario C — Denied Operation',
      badge: 'DENIAL WORKFLOW',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30',
      agent: 'Administrative Agent (AGT-8404)',
      action: 'MODIFY_PERMISSIONS',
      resource: 'iam://roles/AdministratorAccess',
      intent: 'Agent encountered access restriction during job and autonomously attempted to grant itself AdministratorAccess.',
      policy: 'POL-IAM-03 (Restricted Permission Changes)',
      expectedDecision: 'DENY' as AuthorizationDecision,
      rule: 'RULE-I01 (Privilege Escalation Block)',
      reason: 'Zero-Trust rule strictly blocks non-human autonomous agents from attaching administrator IAM policies.',
    },
  ];

  const activeScenario = scenarios[currentStep];

  const handleRunScenario = () => {
    setEvaluating(true);
    setHumanReviewOutcome('PENDING');

    setTimeout(async () => {
      try {
      const evaluation = await permissionService.evaluateRequest({
        agentId: activeScenario.agent.includes('8401') ? 'AGT-8401' : activeScenario.agent.includes('8402') ? 'AGT-8402' : 'AGT-8404',
        actionType: activeScenario.action as any,
        resource: activeScenario.resource,
        sensitivity: activeScenario.expectedDecision === 'DENY' ? 'CRITICAL' : activeScenario.expectedDecision === 'REQUIRE_APPROVAL' ? 'HIGH' : 'LOW',
        scope: 'GUIDED_DEMO',
        justification: activeScenario.intent,
      });

      setStepResult({
        request: evaluation.request,
        decision: evaluation.result.decision,
        policyName: evaluation.result.policyName,
        reason: evaluation.result.reason,
      });
      setEvaluating(false);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Could not run this scenario.');
        setEvaluating(false);
      }
    }, 450);
  };

  const handleSimulateHumanReview = async (decision: 'APPROVE' | 'DENY') => {
    if (!stepResult) return;
    const approvals = permissionService.getApprovals();
    const targetApproval = approvals.find(a => a.requestId === stepResult.request.id);

    if (!targetApproval) {
      window.alert('This scenario has no pending approval to review.');
      return;
    }
    try {
      await permissionService.resolveApproval(
        targetApproval.id, 
        decision, 
        `Guided Demo simulated ${decision.toLowerCase()} by hackathon reviewer.`, 
        'Judge Reviewer'
      );
      setHumanReviewOutcome(decision === 'APPROVE' ? 'APPROVED' : 'DENIED');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not record the review.');
    }
  };

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep((currentStep + 1) as any);
      setStepResult(null);
      setHumanReviewOutcome('PENDING');
    }
  };

  const handleResetDemo = async () => {
    try {
      await permissionService.resetDemoData();
      setCurrentStep(0);
      setStepResult(null);
      setHumanReviewOutcome('PENDING');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not reset demo data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="w-full max-w-3xl bg-[#090D1A] border border-[#233157] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1E294B] bg-[#0B1020] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#46E5FF]/20 to-[#8B7CFF]/20 text-[#46E5FF] border border-[#46E5FF]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  HACKATHON GUIDED DEMO
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Judges Walkthrough
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Step-by-step verification of AI action authorization, human oversight, and auditable decisions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              title="Reset Demo State"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-3 border-b border-[#1E294B] bg-[#070A12] text-xs font-mono">
          {scenarios.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx as any);
                setStepResult(null);
                setHumanReviewOutcome('PENDING');
              }}
              className={`p-3 text-left border-r last:border-r-0 border-[#1E294B] transition-colors flex items-center gap-2 ${
                currentStep === idx
                  ? 'bg-[#0E1428] text-white border-b-2 border-b-[#46E5FF]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === idx ? 'bg-[#46E5FF] text-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {idx + 1}
              </span>
              <span className="truncate">{s.title.split('—')[1] || s.title}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh]">
          {/* Active Scenario Card */}
          <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B]">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${activeScenario.badgeColor}`}>
                {activeScenario.badge}
              </span>
              <span className="text-xs font-mono text-slate-500">
                SCENARIO {currentStep + 1} OF 3
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mb-1">
              {activeScenario.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {activeScenario.intent}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono p-3 rounded-lg bg-[#070A12] border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">AGENT</span>
                <span className="text-white">{activeScenario.agent}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ACTION</span>
                <span className="text-[#46E5FF]">{activeScenario.action}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-[10px]">TARGET RESOURCE</span>
                <span className="text-cyan-300 break-all">{activeScenario.resource}</span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          {!stepResult ? (
            <div className="text-center py-4">
              <button
                onClick={handleRunScenario}
                disabled={evaluating}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#46E5FF] to-[#8B7CFF] text-[#070A12] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-glow-cyan inline-flex items-center gap-2"
              >
                {evaluating ? (
                  <>
                    <Layers className="w-4 h-4 animate-spin text-black" />
                    Evaluating Scenario Policy...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 text-black" />
                    Dispatch AI Action to PermissionGuard
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Live Evaluation Findings */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#11172E] border border-[#2A3766] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                    EVALUATION FINDINGS
                  </span>
                  <DecisionBadge decision={stepResult.decision} size="sm" />
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-slate-400 font-mono text-[11px]">
                    Policy Matched: <span className="text-[#8B7CFF] font-semibold">{stepResult.policyName}</span>
                  </div>
                  <p className="text-slate-200 mt-2 leading-relaxed">
                    {stepResult.reason}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#070A12] border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>AUDIT COMMIT: <strong className="text-emerald-400">RECORDED</strong></span>
                  <span>EXECUTION: <ExecutionBadge status={stepResult.request.executionStatus} size="sm" /></span>
                </div>
              </div>

              {/* Special interactive step for Scenario B (Human Review) */}
              {currentStep === 1 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase">
                    <UserCheck className="w-4 h-4" />
                    Interactive Human Review Step
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This action was flagged as sensitive and paused at the authorization boundary. 
                    As the authorized reviewer, you can simulate approval or denial:
                  </p>

                  {humanReviewOutcome === 'PENDING' ? (
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => handleSimulateHumanReview('APPROVE')}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Request
                      </button>
                      <button
                        onClick={() => handleSimulateHumanReview('DENY')}
                        className="flex-1 py-2 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Deny Request
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-[#070A12] border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                      <span>HUMAN DECISION RECORDED:</span>
                      <span className={humanReviewOutcome === 'APPROVED' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {humanReviewOutcome}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[#1E294B] bg-[#0B1020] flex items-center justify-between text-xs font-mono">
          <button
            onClick={handleResetDemo}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Reset All Scenarios
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 2 ? (
              <button
                onClick={handleNextStep}
                disabled={!stepResult}
                className="px-4 py-2 rounded-lg bg-[#151E38] hover:bg-[#1E294B] text-white border border-[#2A3766] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next Scenario</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#46E5FF]" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#46E5FF] to-[#8B7CFF] text-[#070A12] font-bold"
              >
                Complete Guided Demo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
