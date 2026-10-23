import React, { useState } from 'react';
import { 
  FileText, 
  Mail, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { DecisionBadge } from '../security/DecisionBadge';
import { AuthorizationDecision } from '../../types';

interface GatewayScenario {
  id: string;
  name: string;
  type: string;
  agent: string;
  actionDetails: string;
  resource: string;
  decision: AuthorizationDecision;
  policy: string;
  ruleMatched: string;
  reason: string;
  icon: React.FC<{ className?: string }>;
}

export const GatewayVisualizer: React.FC = () => {
  const scenarios: GatewayScenario[] = [
    {
      id: 'scen-1',
      name: 'Safe Documentation Read',
      type: 'READ_DOCUMENT',
      agent: 'Research Assistant (AGT-8401)',
      actionDetails: 'Retrieve compliance guidelines handbook from internal knowledge bucket',
      resource: 'doc://enterprise/handbooks/security-standards-2026.md',
      decision: 'ALLOW',
      policy: 'POL-READ-01 (Safe Read Operations)',
      ruleMatched: 'RULE-R01: Whitelisted documentation prefix match',
      reason: 'Resource matches public enterprise handbook whitelist; no sensitive PII or credentials detected.',
      icon: FileText,
    },
    {
      id: 'scen-2',
      name: 'Sensitive Outbound Email',
      type: 'SEND_EMAIL',
      agent: 'Email Workflow Agent (AGT-8402)',
      actionDetails: 'Dispatch contract proposal to external vendor domain',
      resource: 'smtp://gateway.mail.com/vendor-contract',
      decision: 'REQUIRE_APPROVAL',
      policy: 'POL-EMAIL-02 (Sensitive Outbound Communication)',
      ruleMatched: 'RULE-E02: External recipient or bulk dispatch trigger',
      reason: 'Outbound dispatch targets external domain outside enterprise perimeter; human reviewer must authorize.',
      icon: Mail,
    },
    {
      id: 'scen-3',
      name: 'Unauthorized Permission Escalation',
      type: 'MODIFY_PERMISSIONS',
      agent: 'Administrative Agent (AGT-8404)',
      actionDetails: 'Attach AdministratorAccess policy to service-worker-09 role',
      resource: 'iam://roles/AdministratorAccess',
      decision: 'DENY',
      policy: 'POL-IAM-03 (Restricted Permission Changes)',
      ruleMatched: 'RULE-I01: Zero-Trust autonomous admin privilege block',
      reason: 'Policy unconditionally denies autonomous agents from granting root or administrator IAM roles.',
      icon: Lock,
    },
  ];

  const [activeScenario, setActiveScenario] = useState<GatewayScenario>(scenarios[0]);

  const Icon = activeScenario.icon;

  return (
    <div className="w-full py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B7CFF]/10 border border-[#8B7CFF]/30 text-[#8B7CFF] text-xs font-mono uppercase tracking-wider mb-2">
            Interactive Gateway Demo
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Threat-Control Policy Gateway
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Observe how proposed AI-agent operations pass through the evaluation boundary in real time.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-[#090D1A] border border-[#1E294B]">
          {scenarios.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeScenario.id === s.id
                  ? 'bg-[#151E38] text-white border border-[#46E5FF]/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gateway Visualization Board */}
      <div className="rounded-2xl bg-[#090D1A] border border-[#1E294B] p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* 1. Left: AI Agent Proposed Intent */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-[#0E1428] border border-[#1E294B] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-[#46E5FF] font-semibold uppercase tracking-wider">
                  01. PROPOSED INTENT
                </span>
                <span className="p-1.5 rounded-lg bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/20">
                  <Icon className="w-4 h-4" />
                </span>
              </div>

              <div className="text-sm font-semibold text-white mb-1">
                {activeScenario.name}
              </div>
              <div className="text-xs text-slate-400 mb-3 font-mono">
                {activeScenario.agent}
              </div>

              <div className="p-3 rounded-lg bg-[#070A12] border border-slate-800/80 mb-3 text-xs text-slate-300">
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">Target Resource:</div>
                <div className="font-mono text-[11px] text-[#46E5FF] break-all">
                  {activeScenario.resource}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {activeScenario.actionDetails}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>ACTION TYPE</span>
              <span className="text-slate-300">{activeScenario.type}</span>
            </div>
          </div>

          {/* 2. Middle: Policy Gateway Barrier */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-[#11172E] border border-[#2A3766] shadow-glow-violet text-center relative">
            <div className="w-12 h-12 rounded-full bg-[#8B7CFF]/15 border border-[#8B7CFF]/40 text-[#8B7CFF] flex items-center justify-center mb-3 shadow-glow-violet">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>

            <span className="text-[11px] font-mono text-[#8B7CFF] font-bold uppercase tracking-wider mb-1">
              02. POLICY GATEWAY EVALUATION
            </span>
            <div className="text-xs font-semibold text-white mb-2">
              {activeScenario.policy}
            </div>

            <div className="p-2.5 rounded-lg bg-[#0B1020] border border-[#1E294B] text-[11px] font-mono text-slate-300 w-full mb-3 text-left">
              <div className="text-slate-500 text-[10px] mb-0.5">RULE MATCHED:</div>
              <div className="text-amber-300 font-medium truncate">{activeScenario.ruleMatched}</div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-[#46E5FF]" />
              <span>Zero-Trust Policy Verification Active</span>
            </div>
          </div>

          {/* 3. Right: Authorization Decision Outcome */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-[#0E1428] border border-[#1E294B] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                  03. DECISION OUTCOME
                </span>
                <DecisionBadge decision={activeScenario.decision} size="md" />
              </div>

              <div className="p-3.5 rounded-lg bg-[#070A12] border border-slate-800/80 mb-3">
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">Authorization Reason:</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeScenario.reason}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-tight">
                <strong>Execution Boundary:</strong> This demo stores the decision only. No downstream service receives or executes the action.
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>DOWNSTREAM EXECUTION</span>
              <span className="text-slate-400 font-bold">NOT EXECUTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
