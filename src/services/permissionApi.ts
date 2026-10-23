import { ActionRequest, Agent, ApprovalItem, AuditEvent, DashboardMetrics, EvaluationResult, Policy, SimulatorInput } from '../types';

const API_ROOT = import.meta.env.VITE_API_BASE_URL
  ? `${String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')}/api`
  : '/api';

export interface PermissionGuardState {
  agents: Agent[];
  policies: Policy[];
  requests: ActionRequest[];
  approvals: ApprovalItem[];
  audit: AuditEvent[];
  activity: Array<{ time: string; allow: number; approval: number; deny: number; total: number }>;
  metrics: DashboardMetrics;
}
export type ActivityRange = '1h' | '6h' | '24h' | '7d';
export type ActivityPoint = PermissionGuardState['activity'][number];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `PermissionGuard API error: HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const permissionApi = {
  async loadState(): Promise<PermissionGuardState> {
    const [state, activity, metrics] = await Promise.all([
      request<Omit<PermissionGuardState, 'activity' | 'metrics'>>('/state'),
      request<PermissionGuardState['activity']>('/activity'),
      request<DashboardMetrics>('/metrics'),
    ]);
    return { ...state, activity, metrics };
  },
  loadActivity(range: ActivityRange) {
    return request<ActivityPoint[]>(`/activity?range=${range}`);
  },
  setPolicyEnabled(policyId: string, enabled: boolean) {
    return request<Policy>(`/policies/${encodeURIComponent(policyId)}`, {
      method: 'PATCH', body: JSON.stringify({ enabled }),
    });
  },
  evaluate(input: SimulatorInput) {
    return request<{ request: ActionRequest; result: EvaluationResult }>('/evaluate', {
      method: 'POST', body: JSON.stringify(input),
    });
  },
  resolveApproval(approvalId: string, decision: 'APPROVE' | 'DENY', notes: string, reviewer: string) {
    return request<{ success: boolean; message: string; request?: ActionRequest }>(`/approvals/${encodeURIComponent(approvalId)}/resolve`, {
      method: 'POST', body: JSON.stringify({ decision, notes, reviewer }),
    });
  },
  reset() {
    return request<{ message: string; state: unknown }>('/reset', { method: 'POST' });
  },
};
