// client/src/lib/storage.ts
// Small, safe wrappers around localStorage. Storage can be unavailable
// (private mode, blocked cookies), so every access is guarded and the app
// simply works without remembering anything in that case.

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
}
