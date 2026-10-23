import React from 'react';
import { Bot, Cpu, GitFork, FileCheck2, ArrowRight, ArrowDown } from 'lucide-react';

export const RequestLifecycleFlow: React.FC = () => {
  const stages = [
    {
      number: '01',
      title: 'PROPOSE',
      subtitle: 'Structured Intent',
      desc: 'An AI agent proposes a structured action containing target resource, operation payload, and contextual parameters.',
      icon: Bot,
      accent: 'text-[#46E5FF]',
      border: 'border-[#46E5FF]/30',
      bg: 'bg-[#46E5FF]/10',
      tag: 'Agent Ingestion',
    },
    {
      number: '02',
      title: 'EVALUATE',
      subtitle: 'Policy & Risk Assessment',
      desc: 'The policy engine matches the requested operation against configured security policies, risk thresholds, and scope constraints.',
      icon: Cpu,
      accent: 'text-[#8B7CFF]',
      border: 'border-[#8B7CFF]/30',
      bg: 'bg-[#8B7CFF]/10',
      tag: 'Deterministic Logic',
    },
    {
      number: '03',
      title: 'DECIDE',
      subtitle: 'Three-Way Authorization',
      desc: 'Records ALLOW, routes REQUIRE_APPROVAL to the local review queue, or records DENY. No external action is executed in this demo.',
      icon: GitFork,
      accent: 'text-amber-400',
      border: 'border-amber-400/30',
      bg: 'bg-amber-400/10',
      tag: 'Gated Decision',
    },
    {
      number: '04',
      title: 'RECORD',
      subtitle: 'Auditable Event Trail',
      desc: 'The decision, policy identifier, timestamp, and review metadata are saved to the local SQLite audit history.',
      icon: FileCheck2,
      accent: 'text-emerald-400',
      border: 'border-emerald-400/30',
      bg: 'bg-emerald-400/10',
      tag: 'Traceable Log',
    },
  ];

  return (
    <div className="w-full py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#46E5FF]/10 border border-[#46E5FF]/30 text-[#46E5FF] text-xs font-mono uppercase tracking-wider mb-4">
          Lifecycle Architecture
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Security Between Intent and Execution
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
          Intelligent automation should never have unmediated access to critical systems. 
          PermissionGuard introduces an explicit, deterministic evaluation barrier.
        </p>
      </div>

      {/* 4 Connected Stages */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={stage.number} className="relative group">
              <div className="h-full p-6 rounded-xl bg-[#0B1020] border border-[#1E294B] hover:border-[#46E5FF]/40 transition-all duration-300 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      STAGE {stage.number}
                    </span>
                    <span className={`p-2 rounded-lg ${stage.bg} ${stage.accent} border ${stage.border}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {stage.title}
                  </h3>
                  <div className="text-xs font-medium text-slate-400 mb-3">
                    {stage.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#17203A] flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>LAYER</span>
                  <span className={`${stage.accent} font-semibold`}>{stage.tag}</span>
                </div>
              </div>

              {/* Connecting arrow on desktop (between 1-2, 2-3, 3-4) */}
              {idx < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#070A12] border border-[#233157] items-center justify-center text-slate-400">
                  <ArrowRight className="w-3 h-3 text-[#46E5FF]" />
                </div>
              )}

              {/* Connecting arrow on mobile */}
              {idx < stages.length - 1 && (
                <div className="md:hidden flex justify-center py-2 text-slate-500">
                  <ArrowDown className="w-4 h-4 text-[#46E5FF]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
