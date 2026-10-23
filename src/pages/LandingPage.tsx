import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Cpu, 
  UserCheck, 
  Sliders, 
  FileCheck2, 
  Lock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Bot,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SecurityCore3D } from '../components/visualizations/SecurityCore3D';
import { RequestLifecycleFlow } from '../components/visualizations/RequestLifecycleFlow';
import { GatewayVisualizer } from '../components/visualizations/GatewayVisualizer';
import { GuidedDemoModal } from '../components/demo/GuidedDemoModal';
import { Link, useRouter } from '../components/navigation/Router';
import { permissionService } from '../services/permissionService';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();
  const [guidedDemoOpen, setGuidedDemoOpen] = useState(false);
  const [, setRefreshKey] = useState(0);

  useEffect(() => permissionService.subscribe(() => setRefreshKey(key => key + 1)), []);

  const metrics = permissionService.getDashboardMetrics();

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-[#46E5FF]/20 selection:text-[#46E5FF]">
      {/* Top Navbar */}
      <Navbar onOpenGuidedDemo={() => setGuidedDemoOpen(true)} />

      {/* Main Container */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
          {/* Subtle background glow spheres */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#46E5FF]/10 via-[#8B7CFF]/10 to-transparent blur-[120px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline, Description & CTAs */}
              <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
                {/* Category Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11172E] border border-[#2A3766] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#46E5FF] animate-pulse"></span>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    AI-Agent Action Authorization
                  </span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                  Give Every AI Action <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#46E5FF] via-cyan-200 to-[#8B7CFF]">
                    a Permission Check.
                  </span>
                </h1>

                {/* Supporting description */}
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  PermissionGuard evaluates AI-agent actions against defined security policies, 
                  routes sensitive operations for human approval, and records decisions in an auditable workflow.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#46E5FF] to-[#8B7CFF] text-[#070A12] font-bold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-glow-cyan flex items-center justify-center gap-2"
                  >
                    <span>Launch Security Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setGuidedDemoOpen(true)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0E152B] hover:bg-[#151E38] border border-[#233157] text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 text-[#46E5FF] fill-current" />
                    <span>Explore Live Demo</span>
                  </button>
                </div>

                {/* Technical Trust Strip */}
                <div className="pt-6 border-t border-[#1E294B]/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                  <div className="p-2">
                    <span className="text-white font-mono text-xs font-semibold block flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#46E5FF]" />
                      Policy-Based
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Explicit zero-trust rules</span>
                  </div>
                  <div className="p-2">
                    <span className="text-white font-mono text-xs font-semibold block flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      Human Approval
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Sensitive gate sign-off</span>
                  </div>
                  <div className="p-2">
                    <span className="text-white font-mono text-xs font-semibold block flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                      Auditable Trace
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Timestamped decisions</span>
                  </div>
                  <div className="p-2">
                    <span className="text-white font-mono text-xs font-semibold block flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#8B7CFF]" />
                      Enforcement
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Bounded boundaries</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Security Core Experience */}
              <div className="lg:col-span-6 w-full">
                <SecurityCore3D />
              </div>
            </div>
          </div>
        </section>

        {/* HERO METRICS STRIP */}
        <section className="border-y border-[#1E294B] bg-[#090D1A]/60 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#46E5FF]" />
                Live Authorization Telemetry
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                SIMULATED DEMO METRICS
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E294B]">
                <span className="text-slate-400 text-xs font-mono block">REQUESTS EVALUATED</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">{metrics.totalEvaluated}</div>
                <span className="text-[11px] text-emerald-400 mt-0.5 block">100% policy analyzed</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E294B]">
                <span className="text-slate-400 text-xs font-mono block">REQUIRING APPROVAL</span>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{metrics.pendingApprovals}</div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Human gate pending</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E294B]">
                <span className="text-slate-400 text-xs font-mono block">ACTIVE POLICIES</span>
                <div className="text-2xl font-bold font-mono text-[#46E5FF] mt-1">5</div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Deterministic rulesets</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E294B]">
                <span className="text-slate-400 text-xs font-mono block">RECENT BLOCKED DENIALS</span>
                <div className="text-2xl font-bold font-mono text-red-400 mt-1">{metrics.deniedActions}</div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Zero-Trust enforced</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT EXPLANATION: 4 CONNECTED STAGES */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RequestLifecycleFlow />
        </section>

        {/* THREAT-CONTROL POLICY GATEWAY DEMONSTRATION */}
        <section id="threat-gateway" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GatewayVisualizer />
        </section>

        {/* 4 PREMIUM FEATURE CARDS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B7CFF]/10 border border-[#8B7CFF]/30 text-[#8B7CFF] text-xs font-mono uppercase tracking-wider mb-4">
              Core Capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Enterprise AI Action Governance
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              A local prototype of policy evaluation, review, and audit workflows for proposed agent actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#0B1020] border border-[#1E294B] hover:border-[#46E5FF]/40 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-[#46E5FF]/10 text-[#46E5FF] border border-[#46E5FF]/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Policy Engine</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Evaluate proposed agent operations against explicit rule sets, resource whitelists, 
                and contextual risk thresholds. Configurable priorities ensure sensitive conditions trigger immediate safeguards.
              </p>
              <div className="mt-4 pt-4 border-t border-[#17203A] text-xs font-mono text-[#46E5FF]">
                Deterministic Rule Matching &middot; Risk Scoring
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#0B1020] border border-[#1E294B] hover:border-amber-500/40 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Human-in-the-Loop</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Route high-consequence operations—such as outbound client communications, batch database updates, or data exports—to authorized human reviewers with full context and justification.
              </p>
              <div className="mt-4 pt-4 border-t border-[#17203A] text-xs font-mono text-amber-400">
                Action Hold &middot; Escalation Queues &middot; Dual Review
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#0B1020] border border-[#1E294B] hover:border-[#8B7CFF]/40 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-[#8B7CFF]/10 text-[#8B7CFF] border border-[#8B7CFF]/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Action Enforcement</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                This demo records authorization decisions locally and keeps execution separate. It has no connected service adapter, so approvals do not issue tokens or perform external actions.
              </p>
              <div className="mt-4 pt-4 border-t border-[#17203A] text-xs font-mono text-[#8B7CFF]">
                Zero-Trust Boundary &middot; Decoupled Execution
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#0B1020] border border-[#1E294B] hover:border-emerald-500/40 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Auditability</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Every policy evaluation, human review event, and decision outcome is recorded with agent identities, timestamps, and matching policy rules, providing comprehensive operational traceability.
              </p>
              <div className="mt-4 pt-4 border-t border-[#17203A] text-xs font-mono text-emerald-400">
                CSV Export &middot; Event Timelines &middot; Forensic History
              </div>
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl bg-gradient-to-b from-[#11172E] to-[#0B1020] border border-[#2A3766] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#46E5FF]/10 rounded-full blur-[100px] pointer-events-none"></div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Make AI Actions Accountable.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
              Explore how policy evaluation, human oversight, and auditable decisions 
              can bring greater control to AI-powered workflows.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setGuidedDemoOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#46E5FF] to-[#8B7CFF] text-[#070A12] font-bold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Open Interactive Demo</span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#070A12] hover:bg-[#151E38] border border-slate-700 text-white font-medium text-sm transition-all"
              >
                Launch Dashboard
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Enterprise Footer */}
      <Footer />

      {/* Guided Demo Modal */}
      <GuidedDemoModal
        isOpen={guidedDemoOpen}
        onClose={() => setGuidedDemoOpen(false)}
      />
    </div>
  );
};
