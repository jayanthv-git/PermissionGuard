
const API_URL = "http://127.0.0.1:5000";

export async function checkHealth() {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) throw new Error("Backend health check failed");
  return response.json();
}

export async function getActions() {
  const response = await fetch(`${API_URL}/api/actions`);
  if (!response.ok) throw new Error("Could not load actions");
  return response.json();
}

export async function getAuditLog() {
  const response = await fetch(`${API_URL}/api/audit`);
  if (!response.ok) throw new Error("Could not load audit log");
  return response.json();
}

export async function evaluateAction(action) {
  const response = await fetch(`${API_URL}/api/evaluate-action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actor_id: "demo-user",
      action,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Action evaluation failed");
  }

  return data;
}
