import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  Terminal,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { permissionService } from '../../services/permissionService';
import { ActionCategory, RiskLevel, EvaluationResult } from '../../types';
import { DecisionBadge } from '../security/DecisionBadge';

export const PolicySimulator: React.FC<{ onEvaluationCompleted?: () => void }> = ({ onEvaluationCompleted }) => {
  const agents = permissionService.getAgents();

  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || 'AGT-8401');
  const [actionType, setActionType] = useState<ActionCategory>('READ_DOCUMENT');
  const [resource, setResource] = useState('doc://enterprise/handbooks/security-standards-2026.md');
  const [sensitivity, setSensitivity] = useState<RiskLevel>('LOW');
  const [scope, setScope] = useState('READ_ONLY');
  const [justification, setJustification] = useState('Auditing security compliance handbook.');

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<EvaluationResult | null>(null);

  // Preset quick scenarios
  const applyPreset = (preset: 'safe_read' | 'sensitive_email' | 'admin_escalation' | 'bulk_export') => {
    if (preset === 'safe_read') {
      setSelectedAgentId('AGT-8401');
      setActionType('READ_DOCUMENT');
      setResource('doc://enterprise/handbooks/security-standards-2026.md');
      setSensitivity('LOW');
      setScope('READ_ONLY');
      setJustification('Standard research indexing for employee handbook.');
    } else if (preset === 'sensitive_email') {
      setSelectedAgentId('AGT-8402');
      setActionType('SEND_EMAIL');
      setResource('smtp://gateway.mail.com/vendor-contract');
      setSensitivity('HIGH');
      setScope('EXTERNAL_OUTREACH');
      setJustification('Transmitting contractual agreement to partner procurement.');
    } else if (preset === 'admin_escalation') {
      setSelectedAgentId('AGT-8404');
      setActionType('MODIFY_PERMISSIONS');
      setResource('iam://roles/AdministratorAccess');
      setSensitivity('CRITICAL');
      setScope('ADMIN_ELEVATION');
      setJustification('Autonomous role elevation to bypass permissions denial.');
    } else if (preset === 'bulk_export') {
      setSelectedAgentId('AGT-8403');
      setActionType('EXPORT_DATA');
      setResource('s3://analytics-lake/exports/q3-customer-financials.parquet');
      setSensitivity('HIGH');
      setScope('BULK_EXTRACT');
      setJustification('Quarterly business review analytical CSV extract.');
    }
  };

  const handleRunEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource.trim()) return;

    setIsEvaluating(true);
    try {
      const { result } = await permissionService.evaluateRequest({
        agentId: selectedAgentId,
        actionType,
        resource,
        sensitivity,
        scope,
        justification,
      });

      setLastEvaluation(result);
      if (onEvaluationCompleted) onEvaluationCompleted();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Policy evaluation failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0B1020] border border-[#1E294B] p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#1E294B]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              INTERACTIVE POLICY SIMULATOR
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/30">
                Deterministic Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Submit proposed agent actions to test policy rule matching, risk calculation, and gated decisions
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-slate-500 mr-1">PRESETS:</span>
          <button
            type="button"
            onClick={() => applyPreset('safe_read')}
            className="px-2 py-1 rounded bg-[#10162A] hover:bg-[#151E38] border border-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            Safe Read
          </button>
          <button
            type="button"
            onClick={() => applyPreset('sensitive_email')}
            className="px-2 py-1 rounded bg-[#10162A] hover:bg-[#151E38] border border-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            External Email
          </button>
          <button
            type="button"
            onClick={() => applyPreset('admin_escalation')}
            className="px-2 py-1 rounded bg-[#10162A] hover:bg-[#151E38] border border-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            Admin Escalation
          </button>
          <button
            type="button"
            onClick={() => applyPreset('bulk_export')}
            className="px-2 py-1 rounded bg-[#10162A] hover:bg-[#151E38] border border-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            Bulk Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <form onSubmit={handleRunEvaluation} className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                REQUESTING AGENT
              </label>
              <select
                value={selectedAgentId}
                onChange={e => setSelectedAgentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-white focus:outline-none focus:border-[#46E5FF]"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                ACTION CATEGORY
              </label>
              <select
                value={actionType}
                onChange={e => setActionType(e.target.value as ActionCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-white focus:outline-none focus:border-[#46E5FF]"
              >
                <option value="READ_DOCUMENT">READ_DOCUMENT</option>
                <option value="SEND_EMAIL">SEND_EMAIL</option>
                <option value="UPDATE_RECORD">UPDATE_RECORD</option>
                <option value="EXPORT_DATA">EXPORT_DATA</option>
                <option value="MODIFY_PERMISSIONS">MODIFY_PERMISSIONS</option>
                <option value="DATABASE_MUTATION">DATABASE_MUTATION</option>
                <option value="API_INVOCATION">API_INVOCATION</option>
                <option value="SYSTEM_COMMAND">SYSTEM_COMMAND</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">
              TARGET RESOURCE URI
            </label>
            <input
              type="text"
              value={resource}
              onChange={e => setResource(e.target.value)}
              placeholder="e.g. s3://vault-prod/keys.json or iam://roles/Admin"
              required
              className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-[#46E5FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                CLASSIFIED SENSITIVITY
              </label>
              <select
                value={sensitivity}
                onChange={e => setSensitivity(e.target.value as RiskLevel)}
                className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-white focus:outline-none focus:border-[#46E5FF]"
              >
                <option value="LOW">LOW — Standard / Certified Non-Sensitive</option>
                <option value="MEDIUM">MEDIUM — Internal / Operational Impact</option>
                <option value="HIGH">HIGH — PII / Financial / Bulk Volume</option>
                <option value="CRITICAL">CRITICAL — Root IAM / Vault Secrets</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                AUTHORIZATION SCOPE
              </label>
              <input
                type="text"
                value={scope}
                onChange={e => setScope(e.target.value)}
                placeholder="e.g. READ_ONLY or ADMIN_ELEVATION"
                className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs font-mono text-white focus:outline-none focus:border-[#46E5FF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">
              AGENT CONTEXT JUSTIFICATION
            </label>
            <textarea
              rows={2}
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Rationale provided by AI agent in proposed action payload..."
              className="w-full px-3 py-2 rounded-lg bg-[#0E1428] border border-[#1E294B] text-xs text-white focus:outline-none focus:border-[#46E5FF]"
            />
          </div>

          <button
            type="submit"
            disabled={isEvaluating}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#46E5FF] to-[#8B7CFF] text-[#070A12] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-glow-cyan flex items-center justify-center gap-2"
          >
            {isEvaluating ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-black" />
                Evaluating Against Zero-Trust Policies...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black text-black" />
                Evaluate Action Request
              </>
            )}
          </button>
        </form>

        {/* Output Results Panel */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0E1428] border border-[#1E294B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E294B] mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Evaluation Findings
              </span>
              {lastEvaluation ? (
                <DecisionBadge decision={lastEvaluation.decision} size="sm" />
              ) : (
                <span className="text-[11px] font-mono text-slate-500">AWAITING INPUT</span>
              )}
            </div>

            {lastEvaluation ? (
              <div className="space-y-4 animate-fadeIn text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                    POLICY EVALUATED
                  </span>
                  <div className="text-white font-semibold flex items-center gap-2">
                    <span className="text-[#8B7CFF] font-mono">{lastEvaluation.policyName}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                    HIGHEST-PRIORITY RULE MATCHED
                  </span>
                  <div className="text-amber-300 font-mono font-medium">
                    {lastEvaluation.matchedRule}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#070A12] border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    DECISION RATIONALE
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {lastEvaluation.reason}
                  </p>
                </div>

                {/* Rules Considered Breakdown */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5">
                    RULES EVALUATED
                  </span>
                  <div className="space-y-1.5">
                    {lastEvaluation.rulesConsidered.map((rc: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2 rounded text-[11px] font-mono flex items-center justify-between border ${
                          rc.matched
                            ? 'bg-[#151E38] border-[#46E5FF]/40 text-cyan-300'
                            : 'bg-[#0B1020] border-slate-800 text-slate-500 line-through'
                        }`}
                      >
                        <span>{rc.name} ({rc.ruleId})</span>
                        <span className="text-[10px] uppercase font-bold">{rc.outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500">
                <Layers className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">Select or configure an action and click Evaluate</p>
                <p className="text-[11px] text-slate-600 mt-1">Simulates live zero-trust policy matching</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E294B] text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>ENGINE: PERMISSIONGUARD API</span>
            <span className="text-emerald-400">SERVER: PERMISSIONGUARD API</span>
          </div>
        </div>
      </div>
    </div>
  );
};
