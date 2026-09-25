const STORAGE_KEY = "connectly:activity";

type ActivityEntry = {
  id: string;
  type: string;
  timestamp: string;
  detail?: Record<string, unknown>;
};

export function recordEvent(type: string, detail: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  try {
    const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as ActivityEntry[];
    const next: ActivityEntry[] = [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        type,
        timestamp: new Date().toISOString(),
        detail,
      },
      ...existing,
    ].slice(0, 12);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage issues in private browsing or restricted environments.
  }
}

export function getRecentActivity() {
  if (typeof window === "undefined") return [] as ActivityEntry[];

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as ActivityEntry[];
  } catch {
    return [] as ActivityEntry[];
  }
}
