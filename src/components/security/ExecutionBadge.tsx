import React from 'react';
import { ExecutionStatus } from '../../types';
import { Clock, Check, X, RotateCw, HelpCircle, Ban } from 'lucide-react';

export const ExecutionBadge: React.FC<{
  status: ExecutionStatus;
  size?: 'sm' | 'md';
}> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  switch (status) {
    case 'NOT_EXECUTED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-mono rounded bg-slate-800/80 text-slate-300 border border-slate-700 ${sizeClasses}`} title="Authorization decision was rendered, but downstream action execution has not occurred.">
          <Clock className="w-3 h-3 text-slate-400" />
          NOT EXECUTED
        </span>
      );
    case 'SUCCEEDED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}>
          <Check className="w-3 h-3 text-emerald-400" />
          SUCCEEDED
        </span>
      );
    case 'FAILED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20 ${sizeClasses}`}>
          <X className="w-3 h-3 text-red-400" />
          FAILED
        </span>
      );
    case 'EXECUTING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-mono rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 ${sizeClasses}`}>
          <RotateCw className="w-3 h-3 animate-spin text-cyan-400" />
          EXECUTING
        </span>
      );
    case 'QUEUED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-amber-400" />
          QUEUED
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses}`}>
          <Ban className="w-3 h-3 text-rose-400" />
          CANCELLED
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-mono rounded bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}>
          <HelpCircle className="w-3 h-3" />
          UNKNOWN
        </span>
      );
  }
};
