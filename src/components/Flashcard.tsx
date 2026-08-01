type PromptSide = "glyph" | "romanization";

interface FlashcardProps {
  glyph: string;
  romanization: string;
  notes: string;
  promptSide: PromptSide;
  flipped: boolean;
  onFlip: () => void;
}

export function Flashcard({
  glyph,
  romanization,
  notes,
  promptSide,
  flipped,
  onFlip,
}: FlashcardProps) {
  const otherSide: PromptSide = promptSide === "glyph" ? "romanization" : "glyph";
  const currentSide = flipped ? otherSide : promptSide;

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={
        currentSide === "glyph"
          ? "Baybayin character, tap to reveal romanization"
          : `Romanization: ${romanization}, tap to reveal the Baybayin character`
      }
      className="flex h-64 w-64 flex-col items-center justify-center rounded-2xl border border-neutral-300 bg-white shadow-md transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 sm:h-72 sm:w-72 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950"
    >
      <div
        key={currentSide}
        className="flex animate-card-reveal flex-col items-center justify-center motion-reduce:animate-none"
      >
        {currentSide === "glyph" ? (
          <span className="font-baybayin text-8xl text-neutral-900 dark:text-neutral-100">
            {glyph}
          </span>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <span className="text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
              {romanization}
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{notes}</span>
          </div>
        )}
      </div>
    </button>
  );
}
