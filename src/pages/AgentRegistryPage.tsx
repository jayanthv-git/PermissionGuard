import React, { useState } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  Activity, 
  Lock, 
  X, 
  ExternalLink,
  ChevronRight,
  Layers,
  Terminal,
  FileText
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { RiskBadge } from '../components/security/RiskBadge';
import { permissionService } from '../services/permissionService';
import { Agent } from '../types';

export const AgentRegistryPage: React.FC = () => {
  const agents = permissionService.getAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <AppShell>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>AI Agent Registry</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {agents.length} Registered
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Autonomous agents under zero-trust governance &middot; Configured action scopes and policy associations
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-500 px-3 py-1.5 rounded-lg bg-[#0B1020] border border-[#1E294B]">
            FICTIONAL DEMO AGENTS &middot; BOUNDED SCOPES
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map(agent => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className="p-5 rounded-2xl bg-[#0B1020] border border-[#1E294B] hover:border-[#46E5FF]/40 transition-all duration-200 cursor-pointer shadow-lg flex flex-col justify-between group"
            >
              <div>
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#46E5FF]/20 to-[#8B7CFF]/20 text-[#46E5FF] border border-[#46E5FF]/30 flex items-center justify-center font-bold font-mono">
                      <Bot className="w-5 h-5 text-[#46E5FF]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#46E5FF] transition-colors">
                        {agent.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500">{agent.id}</span>
                    </div>
                  </div>

                  <RiskBadge level={agent.riskProfile} size="sm" />
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {agent.description}
                </p>

                {/* Permitted Action Categories */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">
                    Permitted Action Scopes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {agent.permittedCategories.map(cat => (
                      <span
                        key={cat}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0E1428] text-cyan-300 border border-[#1E294B]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-[#17203A] flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Active {agent.lastActive}</span>
                <span className="text-[#46E5FF] group-hover:underline flex items-center gap-1">
                  Inspect &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Agent Details Modal / Drawer */}
        {selectedAgent && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
            <div 
              className="w-full max-w-xl bg-[#090D1A] border-l border-[#1E294B] h-full shadow-2xl flex flex-col justify-between overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1E294B] bg-[#0B1020] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/30">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedAgent.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-cyan-300">{selectedAgent.id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {selectedAgent.environment.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B]">
                  <span className="text-xs font-mono text-slate-500 uppercase block mb-1">
                    AGENT SPECIFICATION & PURPOSE
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedAgent.description}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B] space-y-3">
                  <span className="text-xs font-mono text-slate-500 uppercase block">
                    SECURITY POSTURE & GOVERNANCE
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">STATUS</span>
                      <span className="text-emerald-400 font-bold uppercase">{selectedAgent.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">RISK CLASSIFICATION</span>
                      <RiskBadge level={selectedAgent.riskProfile} size="sm" />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TOTAL REQUESTS</span>
                      <span className="text-white font-bold">{selectedAgent.totalRequests}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">LAST OBSERVED</span>
                      <span className="text-slate-300">{selectedAgent.lastActive}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1428] border border-[#1E294B] space-y-2">
                  <span className="text-xs font-mono text-slate-500 uppercase block mb-1">
                    ASSIGNED SECURITY POLICIES
                  </span>
                  <div className="space-y-1.5">
                    {selectedAgent.assignedPolicies.map(polId => (
                      <div
                        key={polId}
                        className="p-2.5 rounded-lg bg-[#070A12] border border-slate-800 font-mono text-xs flex items-center justify-between text-slate-300"
                      >
                        <span className="text-[#8B7CFF] font-semibold">{polId}</span>
                        <span className="text-slate-500 text-[10px]">Active Enforcement</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#1E294B] bg-[#0B1020] flex items-center justify-end">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
