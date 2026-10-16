/**
 * SM-2 spaced-repetition algorithm.
 *
 * Reference: P. A. Wozniak, "Optimization of repetition spacing in
 * the practice of learning" (1990). Implementation notes follow
 * the standard SuperMemo-2 reduction that most apps (Anki, Mochi,
 * RemNote) use today.
 *
 * Quality is the 0-5 grade the user gives the answer:
 *   0 — total blackout, no recall
 *   1 — incorrect, but the answer felt familiar
 *   2 — incorrect, but correct answer was easy to remember
 *   3 — correct with serious difficulty
 *   4 — correct after hesitation
 *   5 — perfect, instant recall
 *
 * The flashcard UI exposes a 4-button scale (Again / Hard / Good /
 * Easy) and maps it to a numeric quality in the table below. Both
 * the numeric and mapped forms are accepted by `applySm2`.
 *
 * Mapping (consistent with Anki):
 *   Again → 1
 *   Hard  → 3
 *   Good  → 4
 *   Easy  → 5
 */

export const SM2_MAPPING = {
  AGAIN: 1,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
} as const;

export type Sm2Button = keyof typeof SM2_MAPPING;

export interface Sm2State {
  /** Number of consecutive successful repetitions. Resets to 0 on
   *  quality < 3. */
  repetitions: number;
  /** Ease factor in [1.3, 2.5+). Starts at 2.5. */
  easeFactor: number;
  /** Last interval applied, in days. */
  intervalDays: number;
}

export interface Sm2Result {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
}

/** Default state for a brand-new card. */
export const SM2_DEFAULT: Sm2State = {
  repetitions: 0,
  easeFactor: 2.5,
  intervalDays: 0,
};

/** Min ease factor; the algorithm never goes below this. */
export const SM2_MIN_EASE = 1.3;

/**
 * Apply one review to a card and return the next state.
 *
 * @param state   the current state (use SM2_DEFAULT for new cards)
 * @param quality 0-5 grade, or one of the four mapped buttons
 * @param now     the timestamp of the review (defaults to now)
 */
export function applySm2(
  state: Sm2State,
  quality: number | Sm2Button,
  now: Date = new Date()
): Sm2Result {
  const q = typeof quality === 'number' ? quality : SM2_MAPPING[quality];

  if (q < 0 || q > 5) {
    throw new Error(`SM-2 quality must be 0-5, got ${q}`);
  }

  let { repetitions, easeFactor, intervalDays } = state;

  if (q < 3) {
    // Lapse: reset repetition count and re-show within the same day.
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
  }

  // Update ease factor: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  easeFactor =
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < SM2_MIN_EASE) easeFactor = SM2_MIN_EASE;

  return { repetitions, easeFactor, intervalDays };
}

/** Add days to a date and return the new ISO timestamp. */
export function nextDueAt(intervalDays: number, now: Date = new Date()): string {
  const ms = intervalDays * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() + ms).toISOString();
}

/**
 * Map a 4-button choice to the SM-2 quality grade.
 * Convenience for UI handlers; the algorithm itself accepts both
 * forms.
 */
export function qualityFor(button: Sm2Button): number {
  return SM2_MAPPING[button];
}
