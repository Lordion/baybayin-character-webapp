import { useCallback, useEffect, useState } from "react";
import charactersData from "./data/characters.json";
import { useShuffleBag } from "./hooks/useShuffleBag";
import { Flashcard } from "./components/Flashcard";
import { loadProgress, getBox, gradeCard, type ProgressStore } from "./lib/progress";
import type { BaybayinCharacter } from "./types";

const characters = charactersData as BaybayinCharacter[];
const characterIds = characters.map((c) => c.id);

function randomPromptSide(): "glyph" | "romanization" {
  return Math.random() < 0.5 ? "glyph" : "romanization";
}

function App() {
  const [progress, setProgress] = useState<ProgressStore>(() => loadProgress(characterIds));
  const getBoxFor = useCallback(
    (character: BaybayinCharacter) => getBox(progress, character.id),
    [progress],
  );
  const { current, index, total, next } = useShuffleBag(characters, getBoxFor);

  const [flipped, setFlipped] = useState(false);
  const [promptSide, setPromptSide] = useState(randomPromptSide);

  const handleGrade = (grade: "hard" | "easy") => {
    setProgress((prev) => gradeCard(prev, current.id, grade));
    setFlipped(false);
    setPromptSide(randomPromptSide());
    next();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === "Space") {
        event.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && event.key === "1") {
        handleGrade("hard");
      } else if (flipped && event.key === "2") {
        handleGrade("easy");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

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
        promptSide={promptSide}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      {flipped ? (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleGrade("hard")}
            className="flex min-h-11 min-w-24 items-center justify-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            Hard
            <kbd className="rounded border border-red-300 px-1.5 py-0.5 text-xs font-mono text-red-500 dark:border-red-700 dark:text-red-400">
              1
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => handleGrade("easy")}
            className="flex min-h-11 min-w-24 items-center justify-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
          >
            Easy
            <kbd className="rounded border border-green-300 px-1.5 py-0.5 text-xs font-mono text-green-500 dark:border-green-700 dark:text-green-400">
              2
            </kbd>
          </button>
        </div>
      ) : (
        <p className="text-xs text-neutral-400">
          Tap the card or press <kbd className="rounded border border-neutral-300 px-1.5 py-0.5 font-mono dark:border-neutral-700">Space</kbd> to flip
        </p>
      )}
    </div>
  );
}

export default App;
