import React, { useEffect, useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  Pause, 
  ExternalLink,
  ChevronRight,
  User,
  Info
} from 'lucide-react';
import { useRouter } from '../navigation/Router';
import { permissionService } from '../../services/permissionService';

export const Header: React.FC<{
  onToggleSidebar: () => void;
  onOpenGuidedDemo?: () => void;
}> = ({ onToggleSidebar, onOpenGuidedDemo }) => {
  const [, setRefreshKey] = useState(0);
  useEffect(() => permissionService.subscribe(() => setRefreshKey(key => key + 1)), []);
  const { currentPath } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const isPaused = permissionService.isLiveFeedPaused();

  // Compute breadcrumbs
  const pathName = currentPath === '/dashboard' || currentPath === '/' ? 'Overview' :
    currentPath.replace(/^\//, '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const pendingApprovals = permissionService.getApprovals().length;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#1E294B] bg-[#070A12]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 hidden sm:inline">PermissionGuard</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
          <span className="text-white font-semibold">{pathName}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Environment Indicator (Explicit honest demo label) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#11172E] border border-[#2A3766] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#46E5FF] animate-pulse"></span>
          <span className="text-slate-400">ENVIRONMENT:</span>
          <span className="text-[#46E5FF] font-semibold">DEMO SIMULATION</span>
        </div>

        {/* Live Stream Pause / Resume Control */}
        <button
          onClick={() => permissionService.setLiveFeedPaused(!isPaused)}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            isPaused
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-[#0E1428] border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isPaused ? 'Resume simulated event feed' : 'Pause simulated event feed'}
        >
          {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
          <span>{isPaused ? 'Stream Paused' : 'Live Stream'}</span>
        </button>

        {/* Guided Demo Button */}
        {onOpenGuidedDemo && (
          <button
            onClick={onOpenGuidedDemo}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#46E5FF]/20 to-[#8B7CFF]/20 border border-[#46E5FF]/40 text-xs font-mono text-white hover:border-[#46E5FF] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#46E5FF]" />
            <span className="hidden sm:inline">Guided Demo</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {pendingApprovals > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0B1020] border border-[#233157] shadow-2xl p-4 z-50 animate-fadeIn"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1E294B]">
                <h4 className="text-xs font-bold text-white font-mono uppercase">
                  Security Notifications
                </h4>
                <span className="text-[10px] font-mono text-slate-500">
                  {pendingApprovals} pending
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {pendingApprovals > 0 ? (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-slate-300">
                    <span className="text-amber-400 font-semibold block mb-0.5">
                      Approvals Pending Review
                    </span>
                    {pendingApprovals} sensitive action request(s) require human reviewer authorization.
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-3">
                    No pending security alerts.
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-[#070A12] border border-slate-800 text-[11px] text-slate-400">
                  <span className="text-[#46E5FF] font-semibold block mb-0.5">Zero-Trust Gateway</span>
                  All agent activity is continuously evaluated against configured policies.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-[11px] font-bold text-black">
            PG
          </div>
          <span className="text-slate-300 font-mono hidden md:inline">SecOps Admin</span>
        </div>
      </div>
    </header>
  );
};
