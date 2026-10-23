import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Menu, X, Play, ShieldAlert, Cpu } from 'lucide-react';
import { Link, useRouter } from '../navigation/Router';

export const Navbar: React.FC<{ onOpenGuidedDemo?: () => void }> = ({ onOpenGuidedDemo }) => {
  const { currentPath, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E294B] bg-[#070A12]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#46E5FF] to-[#8B7CFF] p-0.5 shadow-glow-cyan flex items-center justify-center">
            <div className="w-full h-full bg-[#070A12] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#46E5FF] group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-white tracking-tight">Permission</span>
              <span className="text-base font-extrabold text-[#46E5FF] tracking-tight">Guard</span>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block -mt-0.5">
              AI Security Gateway
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <Link 
            href="/" 
            className={`transition-colors hover:text-[#46E5FF] ${currentPath === '/' ? 'text-[#46E5FF]' : ''}`}
          >
            Overview
          </Link>
          <a 
            href="#how-it-works" 
            className="transition-colors hover:text-[#46E5FF]"
          >
            How It Works
          </a>
          <a 
            href="#threat-gateway" 
            className="transition-colors hover:text-[#46E5FF]"
          >
            Security Gateway
          </a>
          <Link 
            href="/policies" 
            className="transition-colors hover:text-[#46E5FF]"
          >
            Policy Engine
          </Link>
          <Link 
            href="/approvals" 
            className="transition-colors hover:text-[#46E5FF]"
          >
            Approvals
          </Link>
          <Link 
            href="/audit" 
            className="transition-colors hover:text-[#46E5FF]"
          >
            Audit Trail
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {onOpenGuidedDemo && (
            <button
              onClick={onOpenGuidedDemo}
              className="px-3.5 py-1.5 rounded-lg bg-[#11172E] hover:bg-[#182142] border border-[#2A3766] text-xs font-mono text-[#46E5FF] transition-all flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              Guided Demo
            </button>
          )}

          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#46E5FF] to-[#8B7CFF] text-[#070A12] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-glow-cyan flex items-center gap-1.5"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-[#46E5FF] text-[#070A12] font-bold text-xs"
          >
            Dashboard
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E294B] bg-[#090D1A] px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-300 py-1"
          >
            Overview
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-300 py-1"
          >
            Security Dashboard
          </Link>
          <Link
            href="/requests"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-300 py-1"
          >
            Action Requests
          </Link>
          <Link
            href="/approvals"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-300 py-1"
          >
            Approval Queue
          </Link>
          <Link
            href="/policies"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-300 py-1"
          >
            Policy Engine
          </Link>
          <Link
            href="/agents"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-300 py-1"
          >
            Agent Registry
          </Link>
          <Link
            href="/audit"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-300 py-1"
          >
            Audit Logs
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-300 py-1"
          >
            Settings & System Status
          </Link>

          {onOpenGuidedDemo && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGuidedDemo();
              }}
              className="w-full mt-2 py-2 rounded-lg bg-[#11172E] border border-[#2A3766] text-xs font-mono text-[#46E5FF] flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Launch Guided Demo
            </button>
          )}
        </div>
      )}
    </header>
  );
};
