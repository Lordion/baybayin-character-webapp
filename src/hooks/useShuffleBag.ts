import { useCallback, useReducer } from "react";

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface BagState<T> {
  order: T[];
  cursor: number;
}

type BagAction = { type: "next" } | { type: "prev" };

function createReducer<T>(items: readonly T[]) {
  return (state: BagState<T>, action: BagAction): BagState<T> => {
    switch (action.type) {
      case "next":
        // Reshuffling here (rather than wrapping the cursor) means the last
        // card of one pass can equal the first card of the next — an
        // accepted simplicity tradeoff, see plan risks/notes.
        if (state.cursor + 1 >= state.order.length) {
          return { order: shuffle(items), cursor: 0 };
        }
        return { order: state.order, cursor: state.cursor + 1 };
      case "prev":
        // Clamped at 0 rather than wrapping into the previous pass.
        return { order: state.order, cursor: Math.max(0, state.cursor - 1) };
    }
  };
}

/**
 * Shuffle-bag card ordering: Fisher-Yates shuffle `items` once per pass and
 * walk a cursor through it, so no item repeats until every item has been
 * shown, then reshuffle for the next pass.
 */
export function useShuffleBag<T>(items: readonly T[]) {
  const [state, dispatch] = useReducer(createReducer(items), undefined, () => ({
    order: shuffle(items),
    cursor: 0,
  }));

  const next = useCallback(() => dispatch({ type: "next" }), []);
  const prev = useCallback(() => dispatch({ type: "prev" }), []);

  return {
    current: state.order[state.cursor],
    index: state.cursor,
    total: state.order.length,
    canGoPrev: state.cursor > 0,
    next,
    prev,
  };
}
