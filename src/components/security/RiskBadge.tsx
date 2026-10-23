import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

export const RiskBadge: React.FC<{
  level: RiskLevel;
  size?: 'sm' | 'md';
}> = ({ level, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  const styles: Record<RiskLevel, string> = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MEDIUM: 'bg-blue-500/10 text-cyan-400 border-cyan-500/20',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20 font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-mono rounded border uppercase ${styles[level] || styles.LOW} ${sizeClasses}`}>
      {level === 'CRITICAL' && <ShieldAlert className="w-3 h-3 text-red-400" />}
      {level === 'HIGH' && <AlertCircle className="w-3 h-3 text-amber-400" />}
      {level === 'LOW' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
      {level}
    </span>
  );
};
