// client/src/lib/recent.ts
// The last few cities a visitor searched, kept only in their own browser.
import { load, save } from "./storage";

const KEY = "atmoscheck.recent";
const MAX = 5;

export const getRecent = (): string[] => load<string[]>(KEY, []).filter((c) => typeof c === "string");

export function addRecent(city: string): void {
  const name = city.trim();
  if (!name) return;
  const rest = getRecent().filter((c) => c.toLowerCase() !== name.toLowerCase());
  save(KEY, [name, ...rest].slice(0, MAX));
}

export const clearRecent = () => save<string[]>(KEY, []);
