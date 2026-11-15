from backend.policy import evaluate_action


def test_read_action_is_allowed():
    result = evaluate_action({"type": "read_file", "target": "notes.txt"})
    assert result["decision"] == "allow"


def test_delete_action_requires_approval():
    result = evaluate_action({"type": "delete_file", "target": "notes.txt"})
    assert result["decision"] == "require_approval"
    assert result["requires_approval"] is True


def test_shell_command_is_blocked():
    result = evaluate_action({"type": "run_shell_command", "target": "demo"})
    assert result["decision"] == "block"


def test_unknown_action_requires_approval():
    result = evaluate_action({"type": "unknown_action", "target": "demo"})
    assert result["decision"] == "require_approval"


def test_invalid_action_is_blocked():
    result = evaluate_action(None)
    assert result["decision"] == "block"
