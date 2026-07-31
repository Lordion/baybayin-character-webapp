import { useState } from "react";
import charactersData from "./data/characters.json";
import { useShuffleBag } from "./hooks/useShuffleBag";
import { Flashcard } from "./components/Flashcard";
import type { BaybayinCharacter } from "./types";

const characters = charactersData as BaybayinCharacter[];

function App() {
  const { current, index, total, canGoPrev, next, prev } = useShuffleBag(characters);
  const [flipped, setFlipped] = useState(false);

  const handleNext = () => {
    setFlipped(false);
    next();
  };

  const handlePrev = () => {
    setFlipped(false);
    prev();
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
      <header className="text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl dark:text-neutral-100">
          Baybayin Flashcards
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Card {index + 1} of {total}
        </p>
      </header>

      <Flashcard
        glyph={current.glyph}
        romanization={current.romanization}
        notes={current.notes}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="min-h-11 min-w-11 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="min-h-11 min-w-11 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          Next
        </button>
      </div>

      <p className="text-xs text-neutral-400">Tap the card to flip it</p>
    </div>
  );
}

export default App;
