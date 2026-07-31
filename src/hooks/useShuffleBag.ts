import { useCallback, useReducer } from "react";
import type { Box } from "../lib/progress";

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Groups items into 5 tiers by box (box 1 first), shuffles within each
 * tier, then concatenates ascending. This gives struggling (low-box) cards
 * positional priority within a pass while every item still appears exactly
 * once — it is recency-priming, not frequency-based repetition.
 */
function tieredShuffle<T>(items: readonly T[], getBox: (item: T) => Box): T[] {
  const tiers: T[][] = [[], [], [], [], []];
  for (const item of items) {
    tiers[getBox(item) - 1].push(item);
  }
  return tiers.flatMap(shuffle);
}

interface BagState<T> {
  order: T[];
  cursor: number;
}

type BagAction = { type: "next" };

function createReducer<T>(items: readonly T[], getBox: (item: T) => Box) {
  return (state: BagState<T>, action: BagAction): BagState<T> => {
    switch (action.type) {
      case "next":
        if (state.cursor + 1 >= state.order.length) {
          return { order: tieredShuffle(items, getBox), cursor: 0 };
        }
        return { order: state.order, cursor: state.cursor + 1 };
    }
  };
}

/**
 * Tiered shuffle-bag card ordering: walk a cursor through a pass built by
 * `tieredShuffle`, reshuffling into a new pass once the cursor runs out.
 * `getBox` is read fresh on every reshuffle, so grading updates affect the
 * next pass's ordering.
 */
export function useShuffleBag<T>(items: readonly T[], getBox: (item: T) => Box) {
  const [state, dispatch] = useReducer(createReducer(items, getBox), undefined, () => ({
    order: tieredShuffle(items, getBox),
    cursor: 0,
  }));

  const next = useCallback(() => dispatch({ type: "next" }), []);

  return {
    current: state.order[state.cursor],
    index: state.cursor,
    total: state.order.length,
    next,
  };
}
