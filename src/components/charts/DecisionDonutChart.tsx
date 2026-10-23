import React, { useState } from 'react';
import { permissionService } from '../../services/permissionService';

export const DecisionDonutChart: React.FC = () => {
  const [hoveredSlice, setHoveredSlice] = useState<'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY' | null>(null);

  const metrics = permissionService.getDashboardMetrics();
  const total = metrics.totalEvaluated || 1;

  const allowCount = metrics.allowedActions;
  const approvalCount = metrics.pendingApprovals;
  const denyCount = metrics.deniedActions;

  const allowPct = Math.round((allowCount / total) * 100);
  const approvalPct = Math.round((approvalCount / total) * 100);
  const denyPct = Math.max(0, 100 - allowPct - approvalPct);

  // SVG Donut calculation
  const radius = 64;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  const allowOffset = circumference;
  const allowLength = (allowPct / 100) * circumference;

  const approvalOffset = circumference - allowLength;
  const approvalLength = (approvalPct / 100) * circumference;

  const denyOffset = circumference - allowLength - approvalLength;
  const denyLength = (denyPct / 100) * circumference;

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white tracking-wide">
          Decision Distribution
        </h4>
        <p className="text-xs text-slate-400">
          Proportional breakdown of evaluation decisions
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#131A33"
              strokeWidth={strokeWidth}
            />

            {/* ALLOW Segment */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#10B981"
              strokeWidth={hoveredSlice === 'ALLOW' ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={`${allowLength} ${circumference}`}
              strokeDashoffset={0}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredSlice('ALLOW')}
              onMouseLeave={() => setHoveredSlice(null)}
            />

            {/* REQUIRE_APPROVAL Segment */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#F59E0B"
              strokeWidth={hoveredSlice === 'REQUIRE_APPROVAL' ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={`${approvalLength} ${circumference}`}
              strokeDashoffset={-allowLength}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredSlice('REQUIRE_APPROVAL')}
              onMouseLeave={() => setHoveredSlice(null)}
            />

            {/* DENY Segment */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#EF4444"
              strokeWidth={hoveredSlice === 'DENY' ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={`${denyLength} ${circumference}`}
              strokeDashoffset={-(allowLength + approvalLength)}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredSlice('DENY')}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          </svg>

          {/* Center Info Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-bold font-mono text-white">
              {hoveredSlice === 'ALLOW' ? allowCount :
               hoveredSlice === 'REQUIRE_APPROVAL' ? approvalCount :
               hoveredSlice === 'DENY' ? denyCount : total}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {hoveredSlice || 'TOTAL ACTIONS'}
            </span>
          </div>
        </div>

        {/* Legend with Counts and Percentages */}
        <div className="space-y-3 w-full sm:w-auto font-mono text-xs">
          <div 
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              hoveredSlice === 'ALLOW' ? 'bg-[#151E38] border-emerald-500/40' : 'bg-transparent border-transparent'
            }`}
            onMouseEnter={() => setHoveredSlice('ALLOW')}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                ALLOW
              </span>
              <span className="text-white font-bold">{allowCount} ({allowPct}%)</span>
            </div>
          </div>

          <div 
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              hoveredSlice === 'REQUIRE_APPROVAL' ? 'bg-[#151E38] border-amber-500/40' : 'bg-transparent border-transparent'
            }`}
            onMouseEnter={() => setHoveredSlice('REQUIRE_APPROVAL')}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                APPROVAL
              </span>
              <span className="text-white font-bold">{approvalCount} ({approvalPct}%)</span>
            </div>
          </div>

          <div 
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              hoveredSlice === 'DENY' ? 'bg-[#151E38] border-red-500/40' : 'bg-transparent border-transparent'
            }`}
            onMouseEnter={() => setHoveredSlice('DENY')}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                DENY
              </span>
              <span className="text-white font-bold">{denyCount} ({denyPct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
