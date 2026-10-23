import {
  ActionRequest, ApprovalItem, AuditEvent, Agent, Policy, DashboardMetrics,
  EvaluationResult, SimulatorInput,
} from '../types';
import { permissionApi, PermissionGuardState } from './permissionApi';

type Listener = () => void;

class PermissionService {
  private agents: Agent[] = [];
  private policies: Policy[] = [];
  private requests: ActionRequest[] = [];
  private approvals: ApprovalItem[] = [];
  private auditLogs: AuditEvent[] = [];
  private activity: PermissionGuardState['activity'] = [];
  private metrics: DashboardMetrics = {
    totalEvaluated: 0, allowedActions: 0, pendingApprovals: 0,
    deniedActions: 0, criticalBlockedToday: 0, avgLatencyMs: null,
    environment: 'DEMO_SIMULATION',
  };
  private listeners: Set<Listener> = new Set();
  private liveFeedPaused = false;
  private ready = false;

  public isReady(): boolean { return this.ready; }

  public async initialize(): Promise<void> {
    await this.refresh();
    this.ready = true;
    this.notify();
  }

  public async refresh(): Promise<void> {
    const state = await permissionApi.loadState();
    this.applyState(state);
    this.notify();
  }

  private applyState(state: PermissionGuardState): void {
    this.agents = state.agents;
    this.policies = state.policies;
    this.requests = state.requests;
    this.approvals = state.approvals;
    this.auditLogs = state.audit;
    this.activity = state.activity;
    this.metrics = state.metrics;
    this.ready = true;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error('Listener notification error:', e); }
    });
  }

  public isLiveFeedPaused(): boolean { return this.liveFeedPaused; }
  public setLiveFeedPaused(paused: boolean): void { this.liveFeedPaused = paused; this.notify(); }
  public getAgents(): Agent[] { return [...this.agents]; }
  public getAgentById(id: string): Agent | undefined { return this.agents.find(a => a.id === id); }
  public getPolicies(): Policy[] { return [...this.policies]; }
  public getPolicyById(id: string): Policy | undefined { return this.policies.find(p => p.id === id); }

  public async togglePolicyEnabled(id: string): Promise<void> {
    const policy = this.getPolicyById(id);
    if (!policy) throw new Error('Policy not found');
    await permissionApi.setPolicyEnabled(id, !policy.enabled);
    await this.refresh();
  }

  public getRequests(filters?: { decision?: string; riskLevel?: string; agentId?: string; query?: string }): ActionRequest[] {
    let result = [...this.requests];
    if (!filters) return result;
    if (filters.decision && filters.decision !== 'ALL') result = result.filter(r => r.decision === filters.decision);
    if (filters.riskLevel && filters.riskLevel !== 'ALL') result = result.filter(r => r.riskLevel === filters.riskLevel);
    if (filters.agentId && filters.agentId !== 'ALL') result = result.filter(r => r.agentId === filters.agentId);
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(r => [r.id, r.agentName, r.resource, r.requestedOperation, r.decisionReason].some(v => v.toLowerCase().includes(q)));
    }
    return result;
  }

  public getRequestById(id: string): ActionRequest | undefined { return this.requests.find(r => r.id === id); }
  public getApprovals(): ApprovalItem[] { return this.approvals.filter(a => a.status === 'PENDING'); }
  public getAllApprovalsHistory(): ApprovalItem[] { return [...this.approvals]; }

  public async resolveApproval(approvalId: string, decision: 'APPROVE' | 'DENY', notes = '', reviewer = 'SecOps Reviewer') {
    const result = await permissionApi.resolveApproval(approvalId, decision, notes, reviewer);
    await this.refresh();
    return result;
  }

  public getAuditEvents(filters?: { query?: string; decision?: string; eventType?: string }): AuditEvent[] {
    let result = [...this.auditLogs];
    if (!filters) return result;
    if (filters.decision && filters.decision !== 'ALL') result = result.filter(a => a.decision === filters.decision);
    if (filters.eventType && filters.eventType !== 'ALL') result = result.filter(a => a.eventType === filters.eventType);
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(a => [a.id, a.requestId, a.agentName, a.actor, a.outcome, a.policyReference].some(v => v.toLowerCase().includes(q)));
    }
    return result;
  }

  public getDashboardMetrics(): DashboardMetrics { return { ...this.metrics }; }
  public getActivitySeries() { return [...this.activity]; }

  public async evaluateRequest(input: SimulatorInput): Promise<{ request: ActionRequest; result: EvaluationResult }> {
    const result = await permissionApi.evaluate(input);
    await this.refresh();
    return result;
  }

  public async resetDemoData(): Promise<void> {
    await permissionApi.reset();
    await this.refresh();
  }

  public exportAuditCSV(): void {
    const headers = ['Event ID', 'Timestamp', 'Request ID', 'Agent ID', 'Agent Name', 'Event Type', 'Decision', 'Policy Reference', 'Actor', 'Outcome'];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = this.auditLogs.map(log => [log.id, log.timestamp, log.requestId, log.agentId, log.agentName, log.eventType, log.decision, log.policyReference, log.actor, log.outcome].map(escape));
    const blob = new Blob([[headers.map(escape).join(','), ...rows.map(row => row.join(','))].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permissionguard-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  public exportAuditJSON(): void {
    const blob = new Blob([JSON.stringify(this.auditLogs, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permissionguard-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}

export const permissionService = new PermissionService();
