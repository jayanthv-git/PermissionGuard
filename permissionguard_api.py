"""Local PermissionGuard API with a SQLite-backed demonstration state.

This service evaluates and records proposed actions. It intentionally has no
connectors that send email, alter IAM, mutate a database, or execute commands.
"""

from __future__ import annotations

import json
import os
import sqlite3
import threading
import time
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parent
SEED_PATH = ROOT / "permissionguard_seed.json"
DB_PATH = Path(os.environ.get("PERMISSIONGUARD_DB", ROOT / "permissionguard.sqlite3"))
DB_LOCK = threading.RLock()
Risk = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
Decision = Literal["ALLOW", "REQUIRE_APPROVAL", "DENY"]
Action = Literal[
    "READ_DOCUMENT", "SEND_EMAIL", "UPDATE_RECORD", "EXPORT_DATA",
    "MODIFY_PERMISSIONS", "DATABASE_MUTATION", "API_INVOCATION", "SYSTEM_COMMAND",
]

app = FastAPI(
    title="PermissionGuard API",
    version="1.0.0",
    description="Local persistent policy evaluation and review API. No external actions are executed.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type"],
)


def now_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


def db_connect() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH, timeout=10)
    con.row_factory = sqlite3.Row
    return con


@contextmanager
def db_session():
    con = db_connect()
    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def seed_state() -> dict[str, Any]:
    with SEED_PATH.open(encoding="utf-8") as seed_file:
        return json.load(seed_file)


def init_database() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with DB_LOCK, db_session() as con:
        con.execute(
            "CREATE TABLE IF NOT EXISTS permissionguard_state "
            "(id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL)"
        )
        existing = con.execute("SELECT id FROM permissionguard_state WHERE id=1").fetchone()
        if existing is None:
            con.execute(
                "INSERT INTO permissionguard_state (id, payload) VALUES (1, ?)",
                (json.dumps(seed_state()),),
            )


def read_state() -> dict[str, Any]:
    with DB_LOCK, db_session() as con:
        row = con.execute("SELECT payload FROM permissionguard_state WHERE id=1").fetchone()
        if row is None:
            raise RuntimeError("PermissionGuard database was not initialized")
        return json.loads(row["payload"])


def change_state(mutator):
    """Apply a change under one SQLite transaction, returning its result."""
    with DB_LOCK, db_session() as con:
        con.execute("BEGIN IMMEDIATE")
        row = con.execute("SELECT payload FROM permissionguard_state WHERE id=1").fetchone()
        if row is None:
            con.rollback()
            raise RuntimeError("PermissionGuard database was not initialized")
        state = json.loads(row["payload"])
        result = mutator(state)
        con.execute(
            "UPDATE permissionguard_state SET payload=? WHERE id=1",
            (json.dumps(state, separators=(",", ":")),),
        )
        con.commit()
        return result


init_database()


class EvaluationInput(BaseModel):
    agentId: str = Field(min_length=1, max_length=80)
    actionType: Action
    resource: str = Field(min_length=1, max_length=1000)
    sensitivity: Risk = "LOW"
    scope: str = Field(default="", max_length=500)
    justification: str = Field(default="", max_length=2000)


class ResolutionInput(BaseModel):
    decision: Literal["APPROVE", "DENY"]
    notes: str = Field(default="", max_length=2000)
    reviewer: str = Field(default="SecOps Reviewer", min_length=1, max_length=120)


class PolicyToggleInput(BaseModel):
    enabled: bool


def evaluate(state: dict[str, Any], data: EvaluationInput) -> tuple[dict[str, Any], dict[str, Any]]:
    started = time.perf_counter()
    agent = next((a for a in state["agents"] if a["id"] == data.agentId), None)
    known_agent = agent is not None
    if agent is None:
        agent = {"id": data.agentId, "name": "Unknown Agent", "status": "restricted", "permittedCategories": [], "assignedPolicies": []}

    decision: Decision = "ALLOW"
    policy_id = "POL-READ-01"
    rule_id = "RULE-R01"
    reason = "Action satisfies the standard safe-read policy."
    risk: Risk = data.sensitivity
    considered: list[dict[str, Any]] = []

    resource_lower = data.resource.lower()
    scope_lower = data.scope.lower()

    if data.actionType == "MODIFY_PERMISSIONS" or "iam" in resource_lower or "admin" in resource_lower:
        policy_id = "POL-IAM-03"
        risk = "CRITICAL"
        escalation = any(term in resource_lower for term in ("admin", "attach")) or "admin" in scope_lower
        considered.append({"ruleId": "RULE-I01", "name": "Privilege Escalation Block", "matched": escalation, "outcome": "DENY"})
        if escalation:
            decision, rule_id = "DENY", "RULE-I01"
            reason = "Zero-Trust policy blocks autonomous privilege escalation or administrative role grants."
        else:
            decision, rule_id = "REQUIRE_APPROVAL", "RULE-I02"
            reason = "Identity boundary changes require human security review."
    elif data.actionType == "READ_DOCUMENT":
        policy_id = "POL-READ-01"
        secret_resource = any(term in resource_lower for term in ("vault", "secret", "credential", "key", "token", "pii"))
        whitelisted_resource = resource_lower.startswith(("doc://enterprise/", "s3://knowledge-base/"))
        considered.extend([
            {"ruleId": "RULE-R02", "name": "Exclude Vault & PII Buckets", "matched": secret_resource, "outcome": "DENY"},
            {"ruleId": "RULE-R01", "name": "Public & Verified Internal Repos", "matched": whitelisted_resource and not secret_resource, "outcome": "ALLOW"},
        ])
        if secret_resource:
            decision, rule_id, risk = "DENY", "RULE-R02", "CRITICAL"
            reason = "Reading credential, vault, or PII resources is blocked by the read policy."
        elif not whitelisted_resource:
            decision, rule_id = "REQUIRE_APPROVAL", "RULE-R-DEFAULT"
            reason = "The resource is outside the certified read allow-list; human review is required."
            considered.append({"ruleId": rule_id, "name": "Unlisted Read Review", "matched": True, "outcome": decision})
        else:
            decision, rule_id = "ALLOW", "RULE-R01"
            reason = "No sensitive resource marker was detected; the read policy allows this request."
    elif data.actionType == "SEND_EMAIL":
        policy_id = "POL-EMAIL-02"
        internal = "internal.enterprise.com" in resource_lower or "internal" in scope_lower
        considered.extend([
            {"ruleId": "RULE-E01", "name": "Internal Domain Whitelist", "matched": internal, "outcome": "ALLOW"},
            {"ruleId": "RULE-E02", "name": "External or Bulk Outreach", "matched": not internal, "outcome": "REQUIRE_APPROVAL"},
        ])
        if internal and data.sensitivity == "LOW":
            decision, rule_id, risk = "ALLOW", "RULE-E01", "LOW"
            reason = "Internal, low-sensitivity email is allowed by the demo policy."
        else:
            decision, rule_id = "REQUIRE_APPROVAL", "RULE-E02"
            risk = "MEDIUM" if data.sensitivity == "LOW" else data.sensitivity
            reason = "External or elevated-sensitivity email requires human review."
    elif data.actionType == "EXPORT_DATA":
        policy_id = "POL-EXPORT-04"
        high_volume = data.sensitivity in ("HIGH", "CRITICAL") or "bulk" in scope_lower
        considered.append({"ruleId": "RULE-X01", "name": "High-Volume Row Extraction", "matched": high_volume, "outcome": "REQUIRE_APPROVAL"})
        if high_volume:
            decision, rule_id = "REQUIRE_APPROVAL", "RULE-X01"
            risk = "CRITICAL" if data.sensitivity == "CRITICAL" else "HIGH"
            reason = "High-volume or sensitive data export requires human approval."
        else:
            decision, rule_id = "ALLOW", "RULE-X-DEFAULT"
            reason = "Low-volume export is allowed by the demo baseline."
    elif data.actionType == "DATABASE_MUTATION":
        policy_id = "POL-DB-05"
        destructive = any(term in (resource_lower + " " + data.justification.lower()) for term in ("drop", "truncate", "delete"))
        considered.extend([
            {"ruleId": "RULE-D02", "name": "Destructive DDL Block", "matched": destructive, "outcome": "DENY"},
            {"ruleId": "RULE-D01", "name": "Mass Record Mutation", "matched": not destructive, "outcome": "REQUIRE_APPROVAL"},
        ])
        if destructive:
            decision, rule_id, risk = "DENY", "RULE-D02", "CRITICAL"
            reason = "Destructive database operations are blocked for agents in this demo."
        else:
            decision, rule_id, risk = "REQUIRE_APPROVAL", "RULE-D01", "HIGH"
            reason = "Database changes require a human reviewer."
    else:
        policy_id = "POL-DB-05" if data.actionType == "UPDATE_RECORD" else "POL-REVIEW-06"
        decision, rule_id = "REQUIRE_APPROVAL", "RULE-DEFAULT-REVIEW"
        risk = "MEDIUM" if data.sensitivity == "LOW" else data.sensitivity
        reason = f"{data.actionType} has no dedicated autonomous allow rule; human review is required."
        considered.append({"ruleId": rule_id, "name": "Unclassified Action Review", "matched": True, "outcome": decision})

    policy = next((p for p in state["policies"] if p["id"] == policy_id), None)
    policy_name = policy["name"] if policy else "UNCLASSIFIED_ACTION_REVIEW"
    risk_order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    if policy and decision == "ALLOW" and risk_order.index(risk) > risk_order.index(policy["riskThreshold"]):
        decision, rule_id = "REQUIRE_APPROVAL", "RULE-RISK-THRESHOLD"
        reason = f"Calculated risk {risk} exceeds policy threshold {policy['riskThreshold']}; human review is required."
        considered.append({"ruleId": rule_id, "name": "Policy Risk Threshold", "matched": True, "outcome": decision})
    if policy and not policy["enabled"] and decision != "DENY":
        decision, rule_id = "REQUIRE_APPROVAL", "RULE-POLICY-DISABLED"
        reason = f"Policy {policy_name} is disabled; the request is held for human review."
        considered.append({"ruleId": rule_id, "name": "Disabled Policy Safety Hold", "matched": True, "outcome": decision})

    if (
        not known_agent
        or agent.get("status") != "active"
        or data.actionType not in agent.get("permittedCategories", [])
        or policy_id not in agent.get("assignedPolicies", [])
    ):
        decision, rule_id = "DENY", "RULE-AGENT-SCOPE"
        if not known_agent:
            reason = f"Agent {data.agentId} is not registered."
        elif agent.get("status") != "active":
            reason = f"Agent {agent['name']} is {agent['status']}; requests from inactive agents are blocked."
        elif data.actionType not in agent.get("permittedCategories", []):
            reason = f"Agent {agent['name']} is not authorized for {data.actionType}."
        else:
            reason = f"Policy {policy_id} is not assigned to agent {agent['name']}."
        considered.append({"ruleId": rule_id, "name": "Agent Scope & Status Boundary", "matched": True, "outcome": "DENY"})

    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
    timestamp = now_utc()
    request_id, audit_id = new_id("REQ"), new_id("AUD")
    request = {
        "id": request_id,
        "agentId": agent["id"],
        "agentName": agent["name"],
        "actionType": data.actionType,
        "resource": data.resource,
        "requestedOperation": f"{data.actionType}: {data.resource}",
        "context": {"justification": data.justification, "sensitivityLevel": risk, "scope": data.scope},
        "riskLevel": risk,
        "applicablePolicyId": policy_id,
        "applicablePolicyName": policy_name,
        "decision": decision,
        "decisionReason": reason,
        "matchedRuleId": rule_id,
        "createdAt": timestamp,
        "executionStatus": "NOT_EXECUTED",
        "auditEventId": audit_id,
    }
    state["requests"].insert(0, request)
    if decision == "REQUIRE_APPROVAL":
        state["approvals"].insert(0, {
            "id": new_id("APP"), "requestId": request_id, "request": request,
            "assignedReviewerRole": "Security Architect" if risk == "CRITICAL" else "SecOps Reviewer",
            "submittedAt": timestamp,
            "urgency": "CRITICAL" if risk == "CRITICAL" else "ELEVATED" if risk == "HIGH" else "STANDARD",
            "status": "PENDING",
        })
    event_type = "APPROVAL_REQUESTED" if decision == "REQUIRE_APPROVAL" else "EVALUATION_COMPLETED"
    state["audit"].insert(0, {
        "id": audit_id, "timestamp": timestamp, "requestId": request_id,
        "agentId": agent["id"], "agentName": agent["name"], "eventType": event_type,
        "decision": decision, "policyReference": f"{policy_name} ({rule_id})",
        "actor": "PERMISSIONGUARD_API",
        "outcome": {
            "ALLOW": "Policy evaluation allowed the proposed action. No external action was executed.",
            "REQUIRE_APPROVAL": "Action held for human review. No external action was executed.",
            "DENY": "Policy evaluation denied the proposed action. No external action was executed.",
        }[decision],
        "details": {"resource": data.resource, "actionType": data.actionType, "riskLevel": risk, "reason": reason, "latencyMs": elapsed_ms},
    })
    result = {"decision": decision, "policyId": policy_id, "policyName": policy_name, "matchedRule": rule_id, "reason": reason, "riskLevel": risk, "rulesConsidered": considered}
    return {"request": request, "result": result}


@app.get("/api/health")
def health():
    return {"ok": True, "service": "PermissionGuard", "version": app.version, "storage": "sqlite", "mode": "simulation", "externalActionsEnabled": False}


@app.get("/api/state")
def get_state():
    return read_state()


@app.get("/api/agents")
def get_agents():
    return read_state()["agents"]


@app.get("/api/policies")
def get_policies():
    return read_state()["policies"]


@app.patch("/api/policies/{policy_id}")
def update_policy(policy_id: str, update: PolicyToggleInput):
    def mutate(state):
        policy = next((p for p in state["policies"] if p["id"] == policy_id), None)
        if policy is None:
            raise HTTPException(status_code=404, detail="Policy not found")
        policy["enabled"] = update.enabled
        policy["lastUpdated"] = now_utc()
        return policy
    return change_state(mutate)


@app.get("/api/requests")
def get_requests(decision: str | None = None, riskLevel: str | None = None, agentId: str | None = None, query: str | None = None):
    rows = read_state()["requests"]
    if decision and decision != "ALL": rows = [r for r in rows if r["decision"] == decision]
    if riskLevel and riskLevel != "ALL": rows = [r for r in rows if r["riskLevel"] == riskLevel]
    if agentId and agentId != "ALL": rows = [r for r in rows if r["agentId"] == agentId]
    if query:
        q = query.lower()
        rows = [r for r in rows if q in " ".join((r["id"], r["agentName"], r["resource"], r["requestedOperation"], r["decisionReason"])).lower()]
    return rows


@app.get("/api/requests/{request_id}")
def get_request(request_id: str):
    req = next((r for r in read_state()["requests"] if r["id"] == request_id), None)
    if req is None: raise HTTPException(status_code=404, detail="Request not found")
    return req


@app.post("/api/evaluate")
def evaluate_request(data: EvaluationInput):
    return change_state(lambda state: evaluate(state, data))


@app.get("/api/approvals")
def get_approvals(history: bool = False):
    rows = read_state()["approvals"]
    return rows if history else [a for a in rows if a["status"] == "PENDING"]


@app.post("/api/approvals/{approval_id}/resolve")
def resolve_approval(approval_id: str, data: ResolutionInput):
    def mutate(state):
        approval = next((a for a in state["approvals"] if a["id"] == approval_id), None)
        if approval is None: raise HTTPException(status_code=404, detail="Approval item not found")
        if approval["status"] != "PENDING": raise HTTPException(status_code=409, detail="This request has already been reviewed")
        req = next((r for r in state["requests"] if r["id"] == approval["requestId"]), None)
        if req is None or req["decision"] != "REQUIRE_APPROVAL": raise HTTPException(status_code=409, detail="Request is no longer awaiting approval")
        timestamp = now_utc()
        outcome = "APPROVED" if data.decision == "APPROVE" else "DENIED"
        final_decision = "ALLOW" if data.decision == "APPROVE" else "DENY"
        approval.update({"status": outcome, "resolvedAt": timestamp, "resolvedBy": data.reviewer, "resolutionNotes": data.notes})
        # Preserve one authoritative request object and mirror it into the approval item.
        req.update({
            "decision": final_decision,
            "decisionReason": f"Human {data.decision.lower()} recorded by {data.reviewer}: {data.notes or 'Reviewed in the local demonstration.'}",
            "reviewedBy": data.reviewer,
            "reviewedAt": timestamp,
            "reviewNotes": data.notes,
            "executionStatus": "NOT_EXECUTED" if data.decision == "APPROVE" else "CANCELLED",
        })
        approval["request"] = req
        event_id = new_id("AUD")
        state["audit"].insert(0, {
            "id": event_id, "timestamp": timestamp, "requestId": req["id"],
            "agentId": req["agentId"], "agentName": req["agentName"],
            "eventType": "APPROVAL_GRANTED" if data.decision == "APPROVE" else "APPROVAL_DENIED",
            "decision": final_decision, "policyReference": req["applicablePolicyName"],
            "actor": data.reviewer,
            "outcome": f"Human {data.decision.lower()} recorded in the local PermissionGuard system. No downstream action was executed.",
            "details": {"reviewerNotes": data.notes, "resource": req["resource"], "actionType": req["actionType"], "executionStatus": req["executionStatus"]},
        })
        verb = "approved" if data.decision == "APPROVE" else "denied"
        return {"success": True, "message": f"Request {req['id']} successfully {verb}.", "request": req, "approval": approval}
    return change_state(mutate)


@app.get("/api/audit")
def get_audit(query: str | None = None, decision: str | None = None, eventType: str | None = None):
    rows = read_state()["audit"]
    if decision and decision != "ALL": rows = [e for e in rows if e["decision"] == decision]
    if eventType and eventType != "ALL": rows = [e for e in rows if e["eventType"] == eventType]
    if query:
        q = query.lower()
        rows = [e for e in rows if q in " ".join((e["id"], e["requestId"], e["agentName"], e["actor"], e["outcome"], e["policyReference"])).lower()]
    return rows


@app.get("/api/metrics")
def get_metrics():
    state = read_state()
    reqs = state["requests"]
    latencies = [e.get("details", {}).get("latencyMs") for e in state["audit"] if e.get("details", {}).get("latencyMs") is not None]
    return {
        "totalEvaluated": len(reqs),
        "allowedActions": sum(r["decision"] == "ALLOW" for r in reqs),
        "pendingApprovals": sum(a["status"] == "PENDING" for a in state["approvals"]),
        "deniedActions": sum(r["decision"] == "DENY" for r in reqs),
        "criticalBlockedToday": sum(r["riskLevel"] == "CRITICAL" and r["decision"] == "DENY" for r in reqs),
        "avgLatencyMs": round(sum(latencies) / len(latencies), 2) if latencies else None,
        "environment": "DEMO_SIMULATION",
    }


@app.get("/api/activity")
def get_activity(window: Literal["1h", "6h", "24h", "7d"] = Query(default="24h", alias="range")):
    state = read_state()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if window == "1h":
        span, interval, count = timedelta(hours=1), timedelta(minutes=10), 6
    elif window == "6h":
        span, interval, count = timedelta(hours=6), timedelta(hours=1), 6
    elif window == "7d":
        span, interval, count = timedelta(days=7), timedelta(days=1), 7
    else:
        span, interval, count = timedelta(hours=24), timedelta(hours=2), 12
    start = now - span
    bins = [{"time": (start + interval * (i + 1)).strftime("%H:%M" if window != "7d" else "%a"), "allow": 0, "approval": 0, "deny": 0, "total": 0} for i in range(count)]
    for req in state["requests"]:
        try:
            created = datetime.strptime(req["createdAt"], "%Y-%m-%d %H:%M:%S UTC")
        except (ValueError, TypeError):
            continue
        if created < start or created > now:
            continue
        idx = min(int((created - start) / interval), count - 1)
        key = {"ALLOW": "allow", "REQUIRE_APPROVAL": "approval", "DENY": "deny"}[req["decision"]]
        bins[idx][key] += 1
        bins[idx]["total"] += 1
    return bins


@app.post("/api/reset")
def reset_state():
    def mutate(_state):
        fresh = seed_state()
        fresh["audit"].insert(0, {
            "id": new_id("AUD"), "timestamp": now_utc(), "requestId": "SYSTEM-RESET",
            "agentId": "SYS-00", "agentName": "PermissionGuard Core", "eventType": "SIMULATION_RESET",
            "decision": "ALLOW", "policyReference": "SYSTEM_MAINTENANCE", "actor": "USER_ACTION",
            "outcome": "Persistent demo data was reset to its initial seed dataset.", "details": {"resetBy": "Demo Console User"},
        })
        return fresh
    def replace(state):
        fresh = mutate(state)
        state.clear()
        state.update(fresh)
        return {"message": "Demo state reset to the initial seed dataset.", "state": state}
    return change_state(replace)
