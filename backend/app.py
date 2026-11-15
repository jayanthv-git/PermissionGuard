from datetime import datetime, timezone
from uuid import uuid4

from flask import Flask, jsonify, request
from flask_cors import CORS

from policy import evaluate_action

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

actions = {}
audit_log = []


def log_event(action_id, event, details=None):
    audit_log.append({
        "action_id": action_id,
        "event": event,
        "details": details or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


@app.get("/")
def home():
    return jsonify({
        "message": "PermissionGuard API is running",
        "mode": "simulation_only",
    })


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/evaluate-action")
def evaluate():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({"error": "Expected a JSON object"}), 400

    action = payload.get("action")
    if not isinstance(action, dict):
        return jsonify({"error": "An action object is required"}), 400

    action_id = str(payload.get("action_id") or uuid4())

    if action_id in actions:
        return jsonify({"error": "action_id already exists"}), 409

    result = evaluate_action(action)

    status = {
        "allow": "allowed_simulation",
        "require_approval": "pending_approval",
        "block": "blocked",
    }[result["decision"]]

    record = {
        "action_id": action_id,
        "actor_id": payload.get("actor_id", "demo-user"),
        "action": action,
        **result,
        "status": status,
    }

    actions[action_id] = record
    log_event(action_id, "evaluated", {"decision": result["decision"]})

    # Simulation only: never execute the proposed action.
    return jsonify(record), 201


@app.get("/api/actions")
def list_actions():
    return jsonify(list(actions.values()))


@app.get("/api/audit")
def get_audit():
    return jsonify(audit_log)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
