interface FlashcardProps {
  glyph: string;
  romanization: string;
  notes: string;
  flipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ glyph, romanization, notes, flipped, onFlip }: FlashcardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={flipped ? `Romanization: ${romanization}` : "Baybayin character, tap to reveal romanization"}
      className="flex h-64 w-64 flex-col items-center justify-center rounded-2xl border border-neutral-300 bg-white shadow-md transition active:scale-95 sm:h-72 sm:w-72 dark:border-neutral-700 dark:bg-neutral-900"
    >
      {flipped ? (
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <span className="text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
            {romanization}
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{notes}</span>
        </div>
      ) : (
        <span className="font-baybayin text-8xl text-neutral-900 dark:text-neutral-100">
          {glyph}
        </span>
      )}
    </button>
  );
}
