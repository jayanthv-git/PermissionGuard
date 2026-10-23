import React from 'react';
import { AuthorizationDecision } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const DecisionBadge: React.FC<{
  decision: AuthorizationDecision;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}> = ({ decision, size = 'md', showIcon = true }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-mono gap-1',
    md: 'text-xs px-2.5 py-1 font-mono gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 font-mono gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  if (decision === 'ALLOW') {
    return (
      <span className={`inline-flex items-center font-semibold rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 ${sizeClasses}`}>
        {showIcon && <CheckCircle2 className={iconSizes} />}
        ALLOW
      </span>
    );
  }

  if (decision === 'REQUIRE_APPROVAL') {
    return (
      <span className={`inline-flex items-center font-semibold rounded-md bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 ${sizeClasses}`}>
        {showIcon && <AlertTriangle className={iconSizes} />}
        REQUIRE APPROVAL
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-semibold rounded-md bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 ${sizeClasses}`}>
      {showIcon && <XCircle className={iconSizes} />}
      DENY
    </span>
  );
};
