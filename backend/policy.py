"""Deterministic policy rules for simulated AI-agent actions."""

BLOCKED_TYPES = {
    "run_shell_command",
    "exfiltrate_credentials",
    "disable_security",
}

APPROVAL_TYPES = {
    "delete_file",
    "send_email",
    "make_purchase",
    "modify_file",
}

SAFE_TYPES = {
    "read_file",
    "list_files",
    "summarize_text",
}


def evaluate_action(action):
    """Return a consistent decision without executing the proposed action."""
    if not isinstance(action, dict):
        return {
            "decision": "block",
            "risk_level": "high",
            "risk_score": 100,
            "requires_approval": False,
            "reasons": ["Invalid action format"],
        }

    action_type = action.get("type", "")
    target = action.get("target", "")

    if not isinstance(action_type, str) or not action_type.strip():
        return {
            "decision": "block",
            "risk_level": "high",
            "risk_score": 100,
            "requires_approval": False,
            "reasons": ["A valid action type is required"],
        }

    if not isinstance(target, str):
        return {
            "decision": "block",
            "risk_level": "high",
            "risk_score": 100,
            "requires_approval": False,
            "reasons": ["The action target must be text"],
        }

    action_type = action_type.strip().lower()

    if action_type in BLOCKED_TYPES:
        return {
            "decision": "block",
            "risk_level": "critical",
            "risk_score": 100,
            "requires_approval": False,
            "reasons": ["This action type is prohibited by the demo policy"],
        }

    if action_type in APPROVAL_TYPES:
        return {
            "decision": "require_approval",
            "risk_level": "high",
            "risk_score": 85,
            "requires_approval": True,
            "reasons": ["This action could have consequential or irreversible effects"],
        }

    if action_type in SAFE_TYPES:
        return {
            "decision": "allow",
            "risk_level": "low",
            "risk_score": 10,
            "requires_approval": False,
            "reasons": ["This action type is permitted by the demo policy"],
        }

    return {
        "decision": "require_approval",
        "risk_level": "medium",
        "risk_score": 60,
        "requires_approval": True,
        "reasons": ["Unknown action types require human review by default"],
    }
