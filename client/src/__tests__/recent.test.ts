import { beforeEach, describe, expect, it } from "vitest";
import { addRecent, getRecent } from "../lib/recent";

beforeEach(() => {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  } as unknown as Storage;
});

describe("recent searches", () => {
  it("keeps the newest first, without duplicates, max 5", () => {
    ["Pune, IN", "Goa, IN", "pune, in", "A", "B", "C", "D"].forEach(addRecent);
    expect(getRecent()).toEqual(["D", "C", "B", "A", "pune, in"]);
  });
  it("works when storage is blocked", () => {
    globalThis.localStorage = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } } as unknown as Storage;
    expect(() => addRecent("Pune")).not.toThrow();
    expect(getRecent()).toEqual([]);
  });
});
