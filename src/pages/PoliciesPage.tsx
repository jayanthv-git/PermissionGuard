import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sliders, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  Terminal,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PolicySimulator } from '../components/policies/PolicySimulator';
import { RiskBadge } from '../components/security/RiskBadge';
import { permissionService } from '../services/permissionService';
import { Policy } from '../types';

export const PoliciesPage: React.FC = () => {
  const [, setRefreshKey] = useState(0);
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>('POL-READ-01');

  useEffect(() => {
    return permissionService.subscribe(() => setRefreshKey(k => k + 1));
  }, []);

  const policies = permissionService.getPolicies();

  const togglePolicy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    permissionService.togglePolicyEnabled(id).catch(error => window.alert(error.message || 'Could not update policy.'));
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Policy Engine & Guardrail Rules</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {policies.length} Active Policies
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Zero-Trust authorization policies evaluated in real time against every autonomous AI-agent proposal
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-500 px-3 py-1.5 rounded-lg bg-[#0B1020] border border-[#1E294B]">
            EVALUATION ENGINE: DETERMINISTIC PRECEDENCE
          </div>
        </div>

        {/* INTERACTIVE POLICY SIMULATOR */}
        <PolicySimulator />

        {/* POLICIES LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#8B7CFF]" />
              Configured Security Policies
            </h3>
            <span className="text-xs text-slate-400">Click a policy to view its internal evaluation rules</span>
          </div>

          <div className="space-y-3">
            {policies.map(pol => {
              const isExpanded = expandedPolicyId === pol.id;

              return (
                <div
                  key={pol.id}
                  className={`rounded-2xl bg-[#0B1020] border transition-all duration-200 overflow-hidden shadow-lg ${
                    isExpanded ? 'border-[#8B7CFF]/50 shadow-glow-violet' : 'border-[#1E294B] hover:border-slate-700'
                  }`}
                >
                  {/* Policy Accordion Header */}
                  <div
                    onClick={() => setExpandedPolicyId(isExpanded ? null : pol.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#0E152B] transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 rounded-xl bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 mt-0.5">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-mono font-bold text-[#8B7CFF]">{pol.id}</span>
                          <span className="text-sm font-bold text-white">{pol.name}</span>
                          <RiskBadge level={pol.riskThreshold} size="sm" />
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            PRIORITY {pol.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                          {pol.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono self-end md:self-auto">
                      <div className="text-right hidden sm:block">
                        <span className="text-slate-500 block text-[10px]">RULE TYPE</span>
                        <span className="text-slate-300">{pol.ruleType}</span>
                      </div>

                      <button
                        onClick={e => togglePolicy(pol.id, e)}
                        className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                          pol.enabled 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                        title="Toggle Policy Active State"
                      >
                        <span className={`w-2 h-2 rounded-full ${pol.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                        <span>{pol.enabled ? 'ENABLED' : 'DISABLED'}</span>
                      </button>

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Rules Section */}
                  {isExpanded && (
                    <div className="p-5 border-t border-[#1E294B] bg-[#070A12]/60 space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>DETAILED LOGICAL RULES [{pol.rules.length}]</span>
                        <span>SCOPE: {pol.scope} &middot; UPDATED: {pol.lastUpdated}</span>
                      </div>

                      <div className="space-y-2.5">
                        {pol.rules.map(rule => (
                          <div
                            key={rule.id}
                            className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800/80 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#46E5FF]">{rule.id}</span>
                                <span className="text-white font-medium">{rule.name}</span>
                              </div>
                              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                                rule.actionOutcome === 'ALLOW' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                                rule.actionOutcome === 'REQUIRE_APPROVAL' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                                'bg-red-500/15 text-red-400 border border-red-500/30'
                              }`}>
                                OUTCOME &rarr; {rule.actionOutcome}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-[#070A12] border border-slate-800 font-mono text-[11px] text-slate-300">
                              <span className="text-slate-500 text-[10px] uppercase block mb-0.5">Condition Expression</span>
                              {rule.condition}
                            </div>

                            <p className="text-slate-400 text-xs italic">
                              "{rule.explanation}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
