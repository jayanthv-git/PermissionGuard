import React, { useEffect, useState } from 'react';
import { permissionService } from '../../services/permissionService';
import { ActivityPoint, permissionApi } from '../../services/permissionApi';

export const RequestActivityChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState<ActivityPoint[]>([]);

  useEffect(() => permissionService.subscribe(() => setRefreshKey(key => key + 1)), []);
  useEffect(() => {
    let active = true;
    permissionApi.loadActivity(timeRange)
      .then(points => { if (active) setData(points); })
      .catch(error => console.error('Could not load request activity:', error));
    return () => { active = false; };
  }, [timeRange, refreshKey]);

  const maxVal = Math.max(...data.map(d => d.total), 10);
  const chartHeight = 180;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 25;

  const getX = (idx: number) => paddingX + (idx / (data.length - 1)) * (chartWidth - paddingX * 2);
  const getY = (val: number) => chartHeight - paddingY - (val / (maxVal * 1.15)) * (chartHeight - paddingY * 2);

  // Generate SVG path points
  const pointsAllow = data.map((d, i) => `${getX(i)},${getY(d.allow)}`).join(' ');
  const pointsApproval = data.map((d, i) => `${getX(i)},${getY(d.approval)}`).join(' ');
  const pointsDeny = data.map((d, i) => `${getX(i)},${getY(d.deny)}`).join(' ');

  return (
    <div className="w-full">
      {/* Header with Time Window Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide">
            Request Activity Over Time
          </h4>
          <p className="text-xs text-slate-400">
            Authorization evaluations classified by decision outcome
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#070A12] border border-[#1E294B] text-xs">
          {(['1h', '6h', '24h', '7d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded font-mono transition-all ${
                timeRange === range
                  ? 'bg-[#151E38] text-[#46E5FF] font-semibold border border-[#46E5FF]/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Responsive Area Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48 overflow-visible"
        >
          <defs>
            <linearGradient id="allowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="approvalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="denyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#1E294B"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {Math.round(ratio * maxVal * 1.15)}
                </text>
              </g>
            );
          })}

          {/* Area under Allow curve */}
          <polygon
            points={`${getX(0)},${chartHeight - paddingY} ${pointsAllow} ${getX(data.length - 1)},${chartHeight - paddingY}`}
            fill="url(#allowGrad)"
          />

          {/* Lines */}
          <polyline
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            points={pointsAllow}
          />
          <polyline
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.8"
            points={pointsApproval}
          />
          <polyline
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.8"
            points={pointsDeny}
          />

          {/* Data point markers and hover hit areas */}
          {data.map((d, idx) => {
            const cx = getX(idx);
            const cyAllow = getY(d.allow);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={chartHeight - paddingY}
                    stroke="#46E5FF"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Circles for each curve */}
                <circle cx={cx} cy={cyAllow} r={isHovered ? 4 : 2.5} fill="#10B981" />
                <circle cx={cx} cy={getY(d.approval)} r={isHovered ? 4 : 2.5} fill="#F59E0B" />
                <circle cx={cx} cy={getY(d.deny)} r={isHovered ? 4 : 2.5} fill="#EF4444" />

                {/* Bottom X-axis label */}
                <text
                  x={cx}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fill={isHovered ? '#46E5FF' : '#64748B'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {d.time}
                </text>

                {/* Hit area */}
                <rect
                  x={cx - 15}
                  y={0}
                  width="30"
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#0B1020]/95 backdrop-blur-md border border-[#2A3766] px-3 py-2 rounded-lg shadow-xl text-xs font-mono pointer-events-none flex items-center gap-4 z-20"
          >
            <span className="text-slate-400 font-bold">{data[hoveredIndex].time}</span>
            <span className="text-emerald-400">Allow: {data[hoveredIndex].allow}</span>
            <span className="text-amber-400">Approval: {data[hoveredIndex].approval}</span>
            <span className="text-red-400">Deny: {data[hoveredIndex].deny}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-[#1E294B] text-xs font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>ALLOW</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>REQUIRE APPROVAL</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          <span>DENY</span>
        </div>
      </div>
    </div>
  );
};
