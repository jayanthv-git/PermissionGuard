import React from 'react';
import { ShieldCheck, Lock, ExternalLink, Terminal } from 'lucide-react';
import { Link } from '../navigation/Router';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#1E294B] bg-[#070A12] py-12 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand column */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#46E5FF] to-[#8B7CFF] p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#070A12] rounded-[6px] flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#46E5FF]" />
              </div>
            </div>
            <div className="font-bold text-white text-sm">PermissionGuard</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            PermissionGuard evaluates proposed AI-agent actions, records review decisions, and keeps execution outside this local demo.
          </p>
          <div className="text-[11px] font-mono text-slate-500">
            Hackathon Demonstration Edition
          </div>
        </div>

        {/* Product navigation */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider mb-3">
            Core Modules
          </h4>
          <ul className="space-y-2">
            <li><Link href="/dashboard" className="hover:text-[#46E5FF] transition-colors">Security Dashboard</Link></li>
            <li><Link href="/requests" className="hover:text-[#46E5FF] transition-colors">Action Requests</Link></li>
            <li><Link href="/approvals" className="hover:text-[#46E5FF] transition-colors">Human Approval Queue</Link></li>
            <li><Link href="/policies" className="hover:text-[#46E5FF] transition-colors">Policy Engine</Link></li>
            <li><Link href="/agents" className="hover:text-[#46E5FF] transition-colors">Agent Registry</Link></li>
          </ul>
        </div>

        {/* Security & Architecture */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider mb-3">
            Security Architecture
          </h4>
          <ul className="space-y-2">
            <li><Link href="/audit" className="hover:text-[#46E5FF] transition-colors">Audit Trail Logs</Link></li>
            <li><Link href="/live-monitor" className="hover:text-[#46E5FF] transition-colors">Live Event Monitor</Link></li>
            <li><Link href="/settings" className="hover:text-[#46E5FF] transition-colors">System Diagnostics</Link></li>
            <li className="text-slate-500">Zero-Trust Boundaries</li>
            <li className="text-slate-500">Deterministic Policy Evaluation</li>
          </ul>
        </div>

        {/* Trust & Transparency statement */}
        <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E294B] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#46E5FF] font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Honest Evaluation Notice</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This local demonstration uses a deterministic API and SQLite storage. Authorization decisions and external execution remain separate.
          </p>
          <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
            Status: DEMO_SIMULATION_ACTIVE
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
        <div>
          &copy; {new Date().getFullYear()} PermissionGuard. Independent Hackathon Project.
        </div>
        <div className="flex items-center gap-4">
          <span>Decisions: ALLOW &middot; REQUIRE_APPROVAL &middot; DENY</span>
        </div>
      </div>
    </footer>
  );
};
