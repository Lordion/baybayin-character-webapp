import { useCallback, useEffect, useMemo, useState } from "react";
import charactersData from "./data/characters.json";
import { useShuffleBag } from "./hooks/useShuffleBag";
import { Flashcard } from "./components/Flashcard";
import { loadProgress, getBox, gradeCard, type ProgressStore } from "./lib/progress";
import type { BaybayinCharacter } from "./types";

const characters = charactersData as BaybayinCharacter[];
const characterIds = characters.map((c) => c.id);

// Box 1 (struggling) -> Box 5 (mastered), reusing the app's existing red/green hues.
const BOX_COLORS = [
  "bg-red-400 dark:bg-red-700",
  "bg-red-200 dark:bg-red-900",
  "bg-neutral-300 dark:bg-neutral-700",
  "bg-green-200 dark:bg-green-900",
  "bg-green-400 dark:bg-green-700",
];

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
  const [announcement, setAnnouncement] = useState("");
  const [lastGrade, setLastGrade] = useState<"hard" | "easy" | null>(null);

  const boxCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const id of characterIds) counts[getBox(progress, id) - 1]++;
    return counts;
  }, [progress]);
  const mastered = boxCounts[4];

  const handleFlip = () => {
    setFlipped((f) => {
      setAnnouncement(f ? "Card flipped back" : "Card flipped");
      return !f;
    });
  };

  const handleGrade = (grade: "hard" | "easy") => {
    setProgress((prev) => gradeCard(prev, current.id, grade));
    setFlipped(false);
    setPromptSide(randomPromptSide());
    setLastGrade(grade);
    next();
  };

  // Composed here (not inline in handleGrade) because `index`/`total` come from
  // useShuffleBag's reducer and only reflect the post-next() value on the next render.
  useEffect(() => {
    if (lastGrade === null) return;
    setAnnouncement(`Graded ${lastGrade}. Card ${index + 1} of ${total}.`);
    setLastGrade(null);
  }, [index, total, lastGrade]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === "Space") {
        event.preventDefault();
        handleFlip();
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
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      <header className="text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl dark:text-neutral-100">
          Baybayin Flashcards
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Card {index + 1} of {total}
        </p>
      </header>

      <div
        className="flex h-2 w-64 overflow-hidden rounded-full bg-neutral-200 sm:w-72 dark:bg-neutral-800"
        role="img"
        aria-label={`Progress: ${mastered} of ${total} characters mastered`}
      >
        {boxCounts.map((count, i) =>
          count === 0 ? null : (
            <div key={i} className={BOX_COLORS[i]} style={{ width: `${(count / total) * 100}%` }} />
          ),
        )}
      </div>

      <Flashcard
        glyph={current.glyph}
        romanization={current.romanization}
        notes={current.notes}
        promptSide={promptSide}
        flipped={flipped}
        onFlip={handleFlip}
      />

      {flipped ? (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleGrade("hard")}
            className="flex min-h-11 min-w-24 items-center justify-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:focus-visible:ring-offset-neutral-950"
          >
            Hard
            <kbd className="rounded border border-red-300 px-1.5 py-0.5 text-xs font-mono text-red-500 dark:border-red-700 dark:text-red-400">
              1
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => handleGrade("easy")}
            className="flex min-h-11 min-w-24 items-center justify-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:border-green-800 dark:bg-green-950 dark:text-green-300 dark:focus-visible:ring-offset-neutral-950"
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
