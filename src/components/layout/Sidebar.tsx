import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Layers, 
  UserCheck, 
  Cpu, 
  Bot, 
  FileCheck2, 
  Settings, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Link, useRouter } from '../navigation/Router';
import { permissionService } from '../../services/permissionService';

export const Sidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenGuidedDemo?: () => void;
}> = ({ isOpen, onClose, onOpenGuidedDemo }) => {
  const [, setRefreshKey] = useState(0);
  useEffect(() => permissionService.subscribe(() => setRefreshKey(key => key + 1)), []);
  const { currentPath } = useRouter();
  const pendingApprovalsCount = permissionService.getApprovals().length;

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Monitor', path: '/live-monitor', icon: Activity, badge: 'LIVE' },
    { label: 'Action Requests', path: '/requests', icon: Layers },
    { 
      label: 'Approval Queue', 
      path: '/approvals', 
      icon: UserCheck, 
      count: pendingApprovalsCount,
      countColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    { label: 'Policy Engine', path: '/policies', icon: Cpu },
    { label: 'Agent Registry', path: '/agents', icon: Bot },
    { label: 'Audit Logs', path: '/audit', icon: FileCheck2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#090D1A] border-r border-[#1E294B] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 border-b border-[#1E294B] flex items-center justify-between bg-[#070A12]">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#46E5FF] to-[#8B7CFF] p-0.5 flex items-center justify-center shadow-glow-cyan">
                <div className="w-full h-full bg-[#070A12] rounded-[6px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#46E5FF]" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm text-white">Permission</span>
                <span className="font-extrabold text-sm text-[#46E5FF]">Guard</span>
              </div>
            </Link>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              v1.0
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Platform Modules
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/');

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#151E38] text-white border border-[#46E5FF]/30 shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1428]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#46E5FF]' : 'text-slate-500 group-hover:text-slate-300'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.countColor}`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Guided Demo & Status Card */}
        <div className="p-4 border-t border-[#1E294B] bg-[#070A12] space-y-3">
          {onOpenGuidedDemo && (
            <button
              onClick={onOpenGuidedDemo}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#46E5FF]/15 to-[#8B7CFF]/15 border border-[#46E5FF]/40 text-xs font-mono text-white hover:border-[#46E5FF] transition-all flex items-center justify-center gap-2 group shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#46E5FF] group-hover:scale-110 transition-transform" />
              <span>Run Guided Demo</span>
            </button>
          )}

          <div className="p-2.5 rounded-lg bg-[#0E1428] border border-[#1E294B] text-[11px] font-mono">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>ENVIRONMENT</span>
              <span className="text-[#46E5FF] font-semibold">DEMO MODE</span>
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              Local API active · external actions disabled
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
