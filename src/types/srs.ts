/**
 * Spaced Repetition System (SRS) types.
 * Based on the SM-2 algorithm variant.
 */


// ============================================
// SRS States
// ============================================

/**
 * SRS card lifecycle states.
 */
export type SRSState =
  | "new"       // Never studied
  | "learning"  // Currently in learning phase
  | "review"    // In regular review
  | "relearning" // Back to learning after lapse
  | "graduated"; // Mature card

/**
 * User's rating after reviewing a card.
 */
export type SRSRating = "again" | "hard" | "good" | "easy";

/**
 * Rating numeric values for calculations.
 */
export const SRS_RATING_VALUES: Record<SRSRating, number> = {
  again: 0,
  hard: 1,
  good: 2,
  easy: 3,
};

// ============================================
// SRS Card
// ============================================

/**
 * SRS card in the database.
 */
export interface SRSCard {
  id: string;
  user_id: string;
  card_type: CardType;
  content_id: string;
  deck_key: string;
  state: SRSState;
  due_date: string;
  interval: number; // days
  ease_factor: number;
  reviews: number;
  lapses: number;
  last_review: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Type of content on the SRS card.
 */
export type CardType = "vocabulary" | "kanji" | "grammar";

/**
 * New SRS card input.
 */
export interface NewSRSCard {
  card_type: CardType;
  content_id: string;
  deck_key: string;
}

/**
 * SRS card with content loaded.
 */
export interface SRSCardWithContent extends SRSCard {
  content?: SRSCardContent;
}

/**
 * Content that can appear on an SRS card.
 */
export type SRSCardContent =
  | { type: "vocabulary"; data: SRSVocabularyContent }
  | { type: "kanji"; data: SRSKanjiContent }
  | { type: "grammar"; data: SRSGrammarContent };

/**
 * Vocabulary content for SRS.
 */
export interface SRSVocabularyContent {
  expression: string;
  reading: string | null;
  meaning: string;
  examples?: string[];
}

/**
 * Kanji content for SRS.
 */
export interface SRSKanjiContent {
  character: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
}

/**
 * Grammar content for SRS.
 */
export interface SRSGrammarContent {
  pattern: string;
  meaning: string;
  example: string;
}

// ============================================
// SRS Review
// ============================================

/**
 * SRS review log entry.
 */
export interface SRSReviewLog {
  id: string;
  user_id: string;
  card_id: string;
  rating: SRSRating;
  time_taken_ms: number;
  was_correct: boolean;
  reviewed_at: string;
}

/**
 * Review session result.
 */
export interface ReviewSession {
  cards_due: SRSCard[];
  cards_reviewed: number;
  cards_correct: number;
  total_time_ms: number;
}

/**
 * Single card review result.
 */
export interface CardReviewResult {
  card_id: string;
  rating: SRSRating;
  time_taken_ms: number;
  new_state: SRSState;
  new_interval: number;
  new_ease_factor: number;
  next_due_date: string;
}

// ============================================
// SRS Algorithm
// ============================================

/**
 * SRS algorithm configuration.
 */
export interface SRSConfig {
  learning_steps: number[]; // minutes
  graduating_interval: number; // days
  easy_interval: number; // days
  minimum_ease: number;
  maximum_ease: number;
  lapse_interval_multiplier: number;
}

/**
 * Default SRS configuration (SM-2 variant).
 */
export const DEFAULT_SRS_CONFIG: SRSConfig = {
  learning_steps: [1, 10], // First review at 1 min, second at 10 min
  graduating_interval: 1, // Card graduates after 1 day
  easy_interval: 4, // Easy rating graduates at 4 days
  minimum_ease: 1.3,
  maximum_ease: 3.0,
  lapse_interval_multiplier: 0.5,
};

/**
 * Calculate next interval and state based on rating.
 */
export interface SRSUpdateResult {
  new_state: SRSState;
  new_interval: number;
  new_ease_factor: number;
  next_due_date: Date;
  should_lapse: boolean;
}

// ============================================
// SRS Deck
// ============================================

/**
 * SRS deck configuration.
 */
export interface SRSDeck {
  key: string;
  name: string;
  description: string;
  card_types: CardType[];
  new_cards_per_day: number;
  review_cards_per_day: number;
}

/**
 * Deck statistics.
 */
export interface DeckStats {
  deck_key: string;
  total_cards: number;
  new_cards: number;
  learning_cards: number;
  review_cards: number;
  due_today: number;
  due_new: number;
  due_review: number;
}

/**
 * Today's review summary.
 */
export interface TodayReviewSummary {
  total_due: number;
  new_cards: number;
  review_cards: number;
  estimated_time_minutes: number;
}
