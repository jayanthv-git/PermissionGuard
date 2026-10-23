// Integration layer with API endpoints & backend contract validation

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8010';

export interface BackendStatus {
  isConfigured: boolean;
  isConnected: boolean;
  url: string;
  lastChecked: string;
  latencyMs: number | null;
  version?: string;
  error?: string;
}

/**
 * Checks backend health if an active backend server exists.
 * Does not invent endpoints or silently pretend non-existent endpoints work.
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      // A healthy but unrelated service must never be reported as PermissionGuard.
      if (Array.isArray(data.model_classes) || data.device_state || data.mqtt) {
        return {
          isConfigured: Boolean(import.meta.env.VITE_API_BASE_URL),
          isConnected: false,
          url: API_BASE_URL,
          lastChecked: new Date().toLocaleTimeString(),
          latencyMs: null,
          error: 'A different API responded at this address. It is not the PermissionGuard service.',
        };
      }
      const serviceName = String(data.service || data.name || data.app || data.title || '').toLowerCase();
      if (!serviceName.includes('permissionguard')) {
        return {
          isConfigured: Boolean(import.meta.env.VITE_API_BASE_URL),
          isConnected: false,
          url: API_BASE_URL,
          lastChecked: new Date().toLocaleTimeString(),
          latencyMs: null,
          error: 'The API responded, but did not identify itself as PermissionGuard. Local simulation remains active.',
        };
      }
      return {
        isConfigured: true,
        isConnected: true,
        url: API_BASE_URL,
        lastChecked: new Date().toLocaleTimeString(),
        latencyMs: Date.now() - startTime,
        version: data.version,
      };
    } else {
      return {
        isConfigured: true,
        isConnected: false,
        url: API_BASE_URL,
        lastChecked: new Date().toLocaleTimeString(),
        latencyMs: null,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }
  } catch (err: any) {
    // The application requires the API; do not silently fall back to browser-only writes.
    return {
      isConfigured: Boolean(import.meta.env.VITE_API_BASE_URL),
      isConnected: false,
      url: API_BASE_URL,
      lastChecked: new Date().toLocaleTimeString(),
      latencyMs: null,
      error: 'PermissionGuard API is unreachable. Start the app with npm run dev.',
    };
  }
}
