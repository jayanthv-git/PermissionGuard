export type AuthorizationDecision = 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ExecutionStatus = 
  | 'NOT_EXECUTED'
  | 'QUEUED'
  | 'EXECUTING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNKNOWN';

export type ActionCategory = 
  | 'READ_DOCUMENT'
  | 'SEND_EMAIL'
  | 'UPDATE_RECORD'
  | 'EXPORT_DATA'
  | 'MODIFY_PERMISSIONS'
  | 'DATABASE_MUTATION'
  | 'API_INVOCATION'
  | 'SYSTEM_COMMAND';

export interface Agent {
  id: string;
  name: string;
  description: string;
  environment: 'production' | 'staging' | 'sandbox';
  status: 'active' | 'paused' | 'restricted';
  permittedCategories: ActionCategory[];
  assignedPolicies: string[];
  lastActive: string;
  totalRequests: number;
  riskProfile: RiskLevel;
  avatarSeed?: string;
}

export interface PolicyRule {
  id: string;
  name: string;
  condition: string;
  actionOutcome: AuthorizationDecision;
  explanation: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  scope: string;
  ruleType: 'ALLOW_LIST' | 'DENY_LIST' | 'RISK_THRESHOLD' | 'CONTEXTUAL_HEURISTIC';
  riskThreshold: RiskLevel;
  priority: number;
  enabled: boolean;
  rules: PolicyRule[];
  defaultDecision: AuthorizationDecision;
  lastUpdated: string;
}

export interface ActionRequest {
  id: string;
  agentId: string;
  agentName: string;
  actionType: ActionCategory;
  resource: string;
  requestedOperation: string;
  context: {
    justification?: string;
    sensitivityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recipient?: string;
    rowsAffected?: number;
    destinationIp?: string;
    targetRole?: string;
    scope?: string;
    [key: string]: any;
  };
  riskLevel: RiskLevel;
  applicablePolicyId: string;
  applicablePolicyName: string;
  decision: AuthorizationDecision;
  decisionReason: string;
  matchedRuleId?: string;
  createdAt: string;
  executionStatus: ExecutionStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  auditEventId?: string;
}

export interface ApprovalItem {
  id: string;
  requestId: string;
  request: ActionRequest;
  assignedReviewerRole: string;
  submittedAt: string;
  urgency: 'STANDARD' | 'ELEVATED' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  requestId: string;
  agentId: string;
  agentName: string;
  eventType: 
    | 'EVALUATION_COMPLETED'
    | 'APPROVAL_REQUESTED'
    | 'APPROVAL_GRANTED'
    | 'APPROVAL_DENIED'
    | 'POLICY_EVALUATION'
    | 'SIMULATION_RESET';
  decision: AuthorizationDecision;
  policyReference: string;
  actor: string;
  outcome: string;
  details: {
    resource?: string;
    actionType?: string;
    riskLevel?: RiskLevel;
    reason?: string;
    reviewerNotes?: string;
    [key: string]: any;
  };
}

export interface DashboardMetrics {
  totalEvaluated: number;
  allowedActions: number;
  pendingApprovals: number;
  deniedActions: number;
  criticalBlockedToday: number;
  avgLatencyMs: number | null;
  environment: 'DEMO_SIMULATION' | 'CONNECTED_BACKEND';
}

export interface EvaluationResult {
  decision: AuthorizationDecision;
  policyId: string;
  policyName: string;
  matchedRule: string;
  reason: string;
  riskLevel: RiskLevel;
  rulesConsidered: { ruleId: string; name: string; matched: boolean; outcome: AuthorizationDecision }[];
}

export interface SimulatorInput {
  agentId: string;
  actionType: ActionCategory;
  resource: string;
  sensitivity: RiskLevel;
  scope: string;
  justification: string;
}
