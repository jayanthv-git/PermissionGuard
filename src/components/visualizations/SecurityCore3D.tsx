import React, { useEffect, useRef, useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Mail, 
  Database, 
  DownloadCloud, 
  Lock, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { permissionService } from '../../services/permissionService';
import { ActionCategory, AuthorizationDecision } from '../../types';

interface ScenarioAction {
  id: string;
  label: string;
  category: ActionCategory;
  resource: string;
  icon: React.FC<{ className?: string }>;
  expectedDecision: AuthorizationDecision;
  explanation: string;
  ruleName: string;
}

const DEMO_ACTIONS: ScenarioAction[] = [
  {
    id: 'read_doc',
    label: 'Read Document',
    category: 'READ_DOCUMENT',
    resource: 'doc://enterprise/handbooks/security-standards-2026.md',
    icon: FileText,
    expectedDecision: 'ALLOW',
    explanation: 'Target matches low-risk verified documentation whitelist.',
    ruleName: 'RULE-R01 (Safe Read List)',
  },
  {
    id: 'send_email',
    label: 'Send Email',
    category: 'SEND_EMAIL',
    resource: 'smtp://gateway.mail.com/vendor-contract',
    icon: Mail,
    expectedDecision: 'REQUIRE_APPROVAL',
    explanation: 'External recipient detected; human reviewer must authorize dispatch.',
    ruleName: 'RULE-E02 (External Outreach Check)',
  },
  {
    id: 'update_record',
    label: 'Update Record',
    category: 'DATABASE_MUTATION',
    resource: 'postgres://db-cluster/users',
    icon: Database,
    expectedDecision: 'REQUIRE_APPROVAL',
    explanation: 'Batch mutation impacts >50 rows; requires DBA review before execution.',
    ruleName: 'RULE-D01 (Mass Mutation Threshold)',
  },
  {
    id: 'export_data',
    label: 'Export Sensitive Data',
    category: 'EXPORT_DATA',
    resource: 's3://analytics-lake/exports/q3-customer-financials.parquet',
    icon: DownloadCloud,
    expectedDecision: 'REQUIRE_APPROVAL',
    explanation: 'Bulk export exceeds 1,000 records threshold and contains financial data.',
    ruleName: 'RULE-X01 (High-Volume Extraction)',
  },
  {
    id: 'modify_permissions',
    label: 'Modify Permissions',
    category: 'MODIFY_PERMISSIONS',
    resource: 'iam://roles/AdministratorAccess',
    icon: Lock,
    expectedDecision: 'DENY',
    explanation: 'Zero-Trust rule strictly blocks autonomous administrative privilege escalation.',
    ruleName: 'RULE-I01 (Privilege Escalation Block)',
  },
];

export const SecurityCore3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedAction, setSelectedAction] = useState<ScenarioAction>(DEMO_ACTIONS[0]);
  const [evaluatingStage, setEvaluatingStage] = useState<'idle' | 'requesting' | 'evaluating' | 'decided'>('idle');
  const [lastResult, setLastResult] = useState<{
    decision: AuthorizationDecision;
    reason: string;
    rule: string;
    timestamp: string;
  } | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  // Animation & Particle state refs
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const pulseRef = useRef(0);
  const activeColorRef = useRef('#46E5FF'); // cyan default

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setWebglSupported(false);
      return;
    }

    let animationFrameId: number;
    let angle = 0;

    // Check media query for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize 3D particles along the 3 orbits
    interface Particle {
      orbit: number; // 1, 2, or 3
      angle: number;
      speed: number;
      radius: number;
      size: number;
      color: string;
      yOffset: number;
    }

    const particles: Particle[] = [];
    // Orbit 1: Agent Requests (cyan)
    for (let i = 0; i < 24; i++) {
      particles.push({
        orbit: 1,
        angle: (i / 24) * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.004,
        radius: 175,
        size: 2.2 + Math.random() * 1.5,
        color: '#46E5FF',
        yOffset: (Math.random() - 0.5) * 12,
      });
    }
    // Orbit 2: Policy Evaluation (violet)
    for (let i = 0; i < 28; i++) {
      particles.push({
        orbit: 2,
        angle: (i / 28) * Math.PI * 2,
        speed: -0.006 - Math.random() * 0.003,
        radius: 130,
        size: 2.5 + Math.random() * 1.5,
        color: '#8B7CFF',
        yOffset: (Math.random() - 0.5) * 10,
      });
    }
    // Orbit 3: Decision & Enforcement (dynamic green/amber/red)
    for (let i = 0; i < 20; i++) {
      particles.push({
        orbit: 3,
        angle: (i / 20) * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.005,
        radius: 85,
        size: 2.0 + Math.random() * 1.2,
        color: '#10B981',
        yOffset: (Math.random() - 0.5) * 8,
      });
    }

    // Resize handler
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse movement for 3D parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.targetX = x * 0.35;
      mouseRef.current.targetY = y * 0.25;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // 3D Rendering Loop
    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      if (!prefersReducedMotion) {
        angle += 0.008;
        pulseRef.current += 0.03;
      }

      const rotX = 0.55 + mouseRef.current.y * 0.3;
      const rotY = angle * 0.3 + mouseRef.current.x * 0.3;

      // 1. Draw subtle background coordinate grid
      ctx.save();
      ctx.strokeStyle = 'rgba(70, 229, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = -200; x <= 200; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(centerX + x, centerY - 140);
        ctx.lineTo(centerX + x, centerY + 140);
        ctx.stroke();
      }
      for (let y = -120; y <= 120; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(centerX - 200, centerY + y);
        ctx.lineTo(centerX + 200, centerY + y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw 3 Concentric 3D Orbital Rings with Depth
      const drawOrbitRing = (
        radiusX: number, 
        tiltY: number, 
        color: string, 
        strokeW: number, 
        isPulsing: boolean
      ) => {
        ctx.save();
        ctx.beginPath();
        const pulseGlow = isPulsing ? Math.sin(pulseRef.current * 2) * 0.4 + 0.6 : 0.2;
        ctx.strokeStyle = color.replace(')', `, ${pulseGlow})`).replace('rgb', 'rgba').replace('#46E5FF', `rgba(70, 229, 255, ${pulseGlow})`).replace('#8B7CFF', `rgba(139, 124, 255, ${pulseGlow})`);
        ctx.lineWidth = strokeW;
        ctx.ellipse(
          centerX, 
          centerY, 
          radiusX, 
          radiusX * Math.cos(rotX) * 0.65, 
          rotY * 0.2, 
          0, 
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
      };

      // Orbit 01 - Agent Requests (Outer)
      drawOrbitRing(175, rotX, '#46E5FF', 1.2, evaluatingStage === 'requesting');
      // Orbit 02 - Policy Evaluation (Middle)
      drawOrbitRing(130, rotX, '#8B7CFF', 1.5, evaluatingStage === 'evaluating');
      // Orbit 03 - Decision & Enforcement (Inner)
      const decisionColor = lastResult?.decision === 'ALLOW' 
        ? '#10B981' 
        : lastResult?.decision === 'DENY' 
        ? '#EF4444' 
        : '#F59E0B';
      drawOrbitRing(85, rotX, decisionColor, 1.8, evaluatingStage === 'decided');

      // 3. Draw Orbit Nodes & Moving Data Particles
      particles.forEach(p => {
        if (!prefersReducedMotion) {
          p.angle += p.speed;
        }
        const currentRadius = p.radius;
        const flatX = Math.cos(p.angle) * currentRadius;
        const flatZ = Math.sin(p.angle) * currentRadius;

        // Apply 3D rotation projection
        const projX = centerX + flatX * Math.cos(rotY * 0.2) - flatZ * Math.sin(rotY * 0.2);
        const projY = centerY + (flatZ * Math.cos(rotX) * 0.65) + p.yOffset;
        const depth = (flatZ + 200) / 400; // 0 to 1 for depth shading

        ctx.save();
        ctx.beginPath();
        ctx.arc(projX, projY, p.size * (0.6 + depth * 0.7), 0, Math.PI * 2);
        
        // Active color during stages
        let particleColor = p.color;
        if (p.orbit === 1 && evaluatingStage === 'requesting') particleColor = '#46E5FF';
        if (p.orbit === 2 && evaluatingStage === 'evaluating') particleColor = '#8B7CFF';
        if (p.orbit === 3 && evaluatingStage === 'decided') particleColor = decisionColor;

        ctx.fillStyle = particleColor;
        ctx.shadowColor = particleColor;
        ctx.shadowBlur = depth > 0.6 ? 10 : 3;
        ctx.globalAlpha = 0.3 + depth * 0.7;
        ctx.fill();
        ctx.restore();
      });

      // 4. Central Geometric Security Core (Layered Shield Emblem)
      const coreSize = 36 + Math.sin(pulseRef.current) * 2;
      
      // Central Volumetric Glow
      const coreGlow = ctx.createRadialGradient(
        centerX, centerY, 5,
        centerX, centerY, 70
      );
      coreGlow.addColorStop(0, evaluatingStage === 'decided' ? decisionColor : activeColorRef.current);
      coreGlow.addColorStop(0.3, 'rgba(70, 229, 255, 0.25)');
      coreGlow.addColorStop(1, 'rgba(7, 10, 18, 0)');
      
      ctx.save();
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Layered Hexagonal/Shield Security Core with 3D wireframe facets
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotY * 0.15);

      // Outer facet
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const x = Math.cos(a) * coreSize;
        const y = Math.sin(a) * coreSize * 1.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(11, 16, 32, 0.9)';
      ctx.fill();
      ctx.strokeStyle = activeColorRef.current;
      ctx.lineWidth = 2;
      ctx.shadowColor = activeColorRef.current;
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Inner facet (Security emblem)
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const x = Math.cos(a) * (coreSize * 0.6);
        const y = Math.sin(a) * (coreSize * 0.66);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#46E5FF';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Connecting spokes
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * coreSize, Math.sin(a) * coreSize * 1.1);
        ctx.strokeStyle = 'rgba(70, 229, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();

      // 5. Orbital System Labels
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';

      // Orbit 1 label
      ctx.fillStyle = 'rgba(70, 229, 255, 0.7)';
      ctx.fillText('ORBIT 01 — AGENT REQUESTS', centerX + 110, centerY - 125);

      // Orbit 2 label
      ctx.fillStyle = 'rgba(139, 124, 255, 0.7)';
      ctx.fillText('ORBIT 02 — POLICY EVALUATION', centerX + 95, centerY - 85);

      // Orbit 3 label
      ctx.fillStyle = decisionColor;
      ctx.fillText('ORBIT 03 — DECISION & ENFORCEMENT', centerX + 80, centerY - 45);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [evaluatingStage, lastResult]);

  // Handle Interactive 3D Demonstration Trigger
  const handleTriggerSimulation = (action: ScenarioAction) => {
    setSelectedAction(action);
    setEvaluatingStage('requesting');
    activeColorRef.current = '#46E5FF';

    // 1. Animate request particle entering core (400ms)
    setTimeout(() => {
      setEvaluatingStage('evaluating');
      activeColorRef.current = '#8B7CFF';

      // 2. Policy evaluation in progress (700ms)
      setTimeout(async () => {
        try {
        // Deterministic evaluation through centralized service
        const evaluation = await permissionService.evaluateRequest({
          agentId: 'AGT-8401',
          actionType: action.category,
          resource: action.resource,
          sensitivity: action.expectedDecision === 'DENY' ? 'CRITICAL' : action.expectedDecision === 'REQUIRE_APPROVAL' ? 'HIGH' : 'LOW',
          scope: 'DEMO_INTERACTION',
          justification: `Interactive 3D Demo simulation for ${action.label}`
        });

        const colorMap: Record<AuthorizationDecision, string> = {
          ALLOW: '#10B981',
          REQUIRE_APPROVAL: '#F59E0B',
          DENY: '#EF4444'
        };
        activeColorRef.current = colorMap[evaluation.result.decision];

        setLastResult({
          decision: evaluation.result.decision,
          reason: evaluation.result.reason,
          rule: evaluation.result.matchedRule,
          timestamp: new Date().toLocaleTimeString(),
        });
        setEvaluatingStage('decided');

        // Reset to idle state after 5 seconds
        setTimeout(() => {
          setEvaluatingStage('idle');
          activeColorRef.current = '#46E5FF';
        }, 5000);
        } catch (error) {
          const reason = error instanceof Error ? error.message : 'Policy API request failed.';
          setLastResult({ decision: 'DENY', reason, rule: 'API_ERROR', timestamp: new Date().toLocaleTimeString() });
          activeColorRef.current = '#EF4444';
          setEvaluatingStage('decided');
        }
      }, 700);
    }, 400);
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#090D1A]/90 border border-[#1E294B] p-4 lg:p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1E294B]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              PERMISSIONGUARD SECURITY CORE
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/30">
                3D Interactive
              </span>
            </h3>
            <p className="text-xs text-slate-400">Interactive visualization powered by the local policy API</p>
          </div>
        </div>

        {/* Live Stage Status Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">STATE:</span>
          {evaluatingStage === 'idle' && (
            <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              STANDBY
            </span>
          )}
          {evaluatingStage === 'requesting' && (
            <span className="px-2.5 py-1 rounded-md bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#46E5FF] animate-ping"></span>
              INGESTING REQUEST
            </span>
          )}
          {evaluatingStage === 'evaluating' && (
            <span className="px-2.5 py-1 rounded-md bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/40 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              EVALUATING POLICIES
            </span>
          )}
          {evaluatingStage === 'decided' && lastResult && (
            <span className={`px-2.5 py-1 rounded-md border font-semibold flex items-center gap-1.5 ${
              lastResult.decision === 'ALLOW' 
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                : lastResult.decision === 'REQUIRE_APPROVAL'
                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
            }`}>
              {lastResult.decision === 'ALLOW' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {lastResult.decision === 'REQUIRE_APPROVAL' && <AlertTriangle className="w-3.5 h-3.5" />}
              {lastResult.decision === 'DENY' && <XCircle className="w-3.5 h-3.5" />}
              {lastResult.decision}
            </span>
          )}
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[320px] md:h-[360px] rounded-xl bg-[#060810] border border-[#17203A] overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair block"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Fallback overlay if WebGL / Canvas is disabled */}
        {!webglSupported && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070A12] p-6 text-center">
            <ShieldCheck className="w-16 h-16 text-[#46E5FF] mb-3" />
            <h4 className="text-white font-medium">PermissionGuard Geometric Security Core</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Standard 2D fallback mode. Interactive policy authorization workflows remain fully active below.
            </p>
          </div>
        )}

        {/* Floating Quick Stats on Canvas */}
        <div className="absolute bottom-3 left-3 bg-[#0B1020]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[#1E294B] text-[11px] font-mono text-slate-300 pointer-events-none flex items-center gap-3">
          <div><span className="text-slate-500">ORBITS:</span> 3 ACTIVE</div>
          <div className="w-px h-3 bg-slate-700"></div>
          <div><span className="text-slate-500">LATENCY:</span> 14ms</div>
          <div className="w-px h-3 bg-slate-700"></div>
          <div><span className="text-slate-500">ENGINE:</span> ZERO-TRUST</div>
        </div>
      </div>

      {/* Interactive Scenario Selection Bar */}
      <div className="mt-4 pt-3 border-t border-[#1E294B]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#46E5FF]" />
            Test Simulated Action Workflow:
          </span>
          <span className="text-[11px] text-slate-500">Click any action to animate the evaluation path</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {DEMO_ACTIONS.map(action => {
            const Icon = action.icon;
            const isSelected = selectedAction.id === action.id;
            return (
              <button
                key={action.id}
                onClick={() => handleTriggerSimulation(action)}
                disabled={evaluatingStage !== 'idle' && evaluatingStage !== 'decided'}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#151E38] border-[#46E5FF]/50 text-white shadow-glow-cyan'
                    : 'bg-[#0E1428] border-[#1C2646] text-slate-400 hover:text-white hover:border-slate-600'
                } ${evaluatingStage !== 'idle' && evaluatingStage !== 'decided' ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className={`p-1.5 rounded-md ${
                  isSelected ? 'bg-[#46E5FF]/20 text-[#46E5FF]' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{action.label}</div>
                  <div className={`text-[10px] font-mono uppercase ${
                    action.expectedDecision === 'ALLOW' ? 'text-emerald-400' :
                    action.expectedDecision === 'REQUIRE_APPROVAL' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {action.expectedDecision === 'REQUIRE_APPROVAL' ? 'Approval' : action.expectedDecision}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Decision Result Explanation Card */}
      {lastResult && (
        <div className="mt-4 p-3.5 rounded-xl bg-[#0E152B] border border-[#233157] flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-2 rounded-lg ${
              lastResult.decision === 'ALLOW' 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : lastResult.decision === 'REQUIRE_APPROVAL'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}>
              {lastResult.decision === 'ALLOW' && <CheckCircle2 className="w-5 h-5" />}
              {lastResult.decision === 'REQUIRE_APPROVAL' && <AlertTriangle className="w-5 h-5" />}
              {lastResult.decision === 'DENY' && <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">EVALUATION OUTCOME:</span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  lastResult.decision === 'ALLOW' ? 'text-emerald-400 bg-emerald-950/60' :
                  lastResult.decision === 'REQUIRE_APPROVAL' ? 'text-amber-400 bg-amber-950/60' : 'text-red-400 bg-red-950/60'
                }`}>
                  {lastResult.decision}
                </span>
                <span className="text-[11px] font-mono text-slate-500">[{lastResult.rule}]</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {lastResult.reason}
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4 whitespace-nowrap">
            <div>EXECUTION: <span className="text-amber-400">SEPARATE / UNCONFIRMED</span></div>
            <div className="text-slate-500 mt-0.5">Recorded to Audit Trail at {lastResult.timestamp}</div>
          </div>
        </div>
      )}
    </div>
  );
};
