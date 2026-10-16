// server/src/cache.ts
// A tiny in-memory cache with an expiry time. Weather doesn't change every
// second, so the same city searched again within a few minutes is answered
// from memory: faster for the visitor, and fewer calls to OpenWeather.
// (Memory is cleared whenever the server restarts or sleeps; that's fine.)

export class TtlCache<T> {
  private store = new Map<string, { value: T; expires: number }>();

  constructor(private ttlMs: number, private maxEntries = 500) {}

  get(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expires) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: T): void {
    // Keep memory bounded: drop the oldest entry when full.
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}
