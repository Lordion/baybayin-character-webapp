export type Box = 1 | 2 | 3 | 4 | 5;

export interface CardProgress {
  box: Box;
  dueAt: number;
}

export type ProgressStore = Record<string, CardProgress>;

const STORAGE_KEY = "baybayin-progress-v1";

// box -> ms to add to "now" for dueAt bookkeeping. Not used for gating,
// only carried along for potential future use.
const INTERVAL_MS: Record<Box, number> = {
  1: 0,
  2: 24 * 60 * 60 * 1000,
  3: 3 * 24 * 60 * 60 * 1000,
  4: 7 * 24 * 60 * 60 * 1000,
  5: 14 * 24 * 60 * 60 * 1000,
};

// Module-level fallback used when localStorage is unavailable or throws
// (private browsing, quota exceeded, storage disabled).
let memoryStore: ProgressStore | null = null;

function readRaw(): ProgressStore {
  if (memoryStore) return memoryStore;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

function writeRaw(store: ProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable/throwing: keep going in-memory for this
    // session instead of crashing or blocking grading.
    memoryStore = store;
  }
}

/**
 * Loads progress, reconciled against the current character id list: entries
 * for ids no longer present are dropped, ids missing an entry default to
 * box 1 lazily via getBox (not written here).
 */
export function loadProgress(validIds: readonly string[]): ProgressStore {
  const stored = readRaw();
  const validSet = new Set(validIds);
  const reconciled: ProgressStore = {};
  for (const [id, progress] of Object.entries(stored)) {
    if (validSet.has(id)) reconciled[id] = progress;
  }
  return reconciled;
}

export function getBox(store: ProgressStore, id: string): Box {
  return store[id]?.box ?? 1;
}

export function gradeCard(
  store: ProgressStore,
  id: string,
  grade: "hard" | "easy",
): ProgressStore {
  const currentBox = getBox(store, id);
  const nextBox = (
    grade === "easy" ? Math.min(currentBox + 1, 5) : Math.max(currentBox - 1, 1)
  ) as Box;
  const next: ProgressStore = {
    ...store,
    [id]: { box: nextBox, dueAt: Date.now() + INTERVAL_MS[nextBox] },
  };
  writeRaw(next);
  return next;
}
