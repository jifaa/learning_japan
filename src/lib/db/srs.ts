/**
 * SRS (Spaced Repetition System) database access helpers.
 * All functions scope data by authenticated user.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  SRSCard,
  SRSReviewLog,
  SRSRating,
  SRSState,
  CardType,
  NewSRSCard,
  SRSConfig,
  DeckStats,
  TodayReviewSummary,
} from "@/types/srs";
import { DEFAULT_SRS_CONFIG, SRS_RATING_VALUES } from "@/types/srs";

// ============================================
// SRS Cards
// ============================================

/**
 * Get SRS card by ID.
 */
export async function getSRSCard(cardId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_srs_cards")
    .select("*")
    .eq("id", cardId)
    .single();

  if (error) throw error;
  return data as SRSCard;
}

/**
 * Get user's SRS card for specific content.
 */
export async function getUserCardByContent(
  userId: string,
  cardType: CardType,
  contentId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_srs_cards")
    .select("*")
    .eq("user_id", userId)
    .eq("card_type", cardType)
    .eq("content_id", contentId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as SRSCard | null;
}

/**
 * Get all SRS cards for a user.
 */
export async function getUserCards(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_srs_cards")
    .select("*")
    .eq("user_id", userId)
    .order("due_date");

  if (error) throw error;
  return data as SRSCard[];
}

/**
 * Get due cards for review.
 */
export async function getDueCards(userId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_srs_cards")
    .select("*")
    .eq("user_id", userId)
    .lte("due_date", now)
    .in("state", ["new", "learning", "review", "relearning"])
    .order("due_date");

  if (error) {
    console.warn("[getDueCards] failed:", error.message);
    return [] as SRSCard[];
  }
  return (data || []) as SRSCard[];
}

/**
 * Get new cards (never reviewed).
 */
export async function getNewCards(userId: string, limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_srs_cards")
    .select("*")
    .eq("user_id", userId)
    .eq("state", "new")
    .order("created_at")
    .limit(limit);

  if (error) {
    console.warn("[getNewCards] failed:", error.message);
    return [] as SRSCard[];
  }
  return (data || []) as SRSCard[];
}

/**
 * Create new SRS card.
 */
export async function createSRSCard(userId: string, card: NewSRSCard) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_srs_cards")
    .insert({
      user_id: userId,
      card_type: card.card_type,
      content_id: card.content_id,
      deck_key: card.deck_key,
      state: "new",
      due_date: new Date().toISOString(),
      interval: 0,
      ease_factor: DEFAULT_SRS_CONFIG.graduating_interval,
      reviews: 0,
      lapses: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SRSCard;
}

/**
 * Create SRS cards for content IDs (batch).
 */
export async function createSRSCardsForContent(
  userId: string,
  cards: NewSRSCard[]
) {
  const supabase = await createClient();

  const now = new Date().toISOString();
  const inserts = cards.map((card) => ({
    user_id: userId,
    card_type: card.card_type,
    content_id: card.content_id,
    deck_key: card.deck_key,
    state: "new" as SRSState,
    due_date: now,
    interval: 0,
    ease_factor: DEFAULT_SRS_CONFIG.graduating_interval,
    reviews: 0,
    lapses: 0,
  }));

  const { data, error } = await supabase
    .from("user_srs_cards")
    .upsert(inserts, {
      onConflict: "user_id,card_type,content_id",
      ignoreDuplicates: true,
    })
    .select();

  if (error) throw error;
  return data as SRSCard[];
}

/**
 * Create a new SRS card entry regardless of existing cards.
 * Allows re-adding vocabulary/kanji/grammar that was previously reviewed.
 */
export async function createNewSRSCard(
  userId: string,
  card: NewSRSCard
): Promise<SRSCard> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_srs_cards")
    .insert({
      user_id: userId,
      card_type: card.card_type,
      content_id: card.content_id,
      deck_key: card.deck_key,
      state: "new",
      due_date: new Date().toISOString(),
      interval: 0,
      ease_factor: DEFAULT_SRS_CONFIG.graduating_interval,
      reviews: 0,
      lapses: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SRSCard;
}

/**
 * Get or create SRS card for content.
 */
export async function getOrCreateSRSCard(
  userId: string,
  card: NewSRSCard
) {
  const existing = await getUserCardByContent(
    userId,
    card.card_type,
    card.content_id
  );

  if (existing) return existing;
  return createSRSCard(userId, card);
}

// ============================================
// SRS Review
// ============================================

/**
 * Review a card and update its SRS state.
 */
export async function reviewCard(
  cardId: string,
  userId: string,
  rating: SRSRating,
  timeTakenMs: number
) {
  const supabase = await createClient();

  // Get current card state
  const card = await getSRSCard(cardId);
  if (!card || card.user_id !== userId) {
    throw new Error("Card not found or access denied");
  }

  // Calculate new SRS state
  const result = calculateNextReview(card, rating);

  // Update card
  const { data: updatedCard, error: cardError } = await supabase
    .from("user_srs_cards")
    .update({
      state: result.new_state,
      interval: result.new_interval,
      ease_factor: result.new_ease_factor,
      due_date: result.next_due_date.toISOString(),
      reviews: card.reviews + 1,
      lapses: result.should_lapse ? card.lapses + 1 : card.lapses,
      last_review: new Date().toISOString(),
    })
    .eq("id", cardId)
    .select()
    .single();

  if (cardError) throw cardError;

  // Log the review
  const { error: logError } = await supabase
    .from("srs_review_log")
    .insert({
      user_id: userId,
      card_id: cardId,
      rating: rating,
      time_taken_ms: timeTakenMs,
      was_correct: rating !== "again",
    });

  if (logError) throw logError;

  return {
    card: updatedCard as SRSCard,
    result,
  };
}

/**
 * Calculate next review based on SM-2 variant algorithm.
 */
export function calculateNextReview(
  card: SRSCard,
  rating: SRSRating,
  config: SRSConfig = DEFAULT_SRS_CONFIG
) {
  const ratingValue = SRS_RATING_VALUES[rating];
  let { state, interval, ease_factor } = card;

  let new_state: SRSState = state;
  let should_lapse = false;

  // Calculate new ease factor
  const newEaseFactor = Math.max(
    config.minimum_ease,
    Math.min(
      config.maximum_ease,
      ease_factor + (0.1 - (3 - ratingValue) * (0.08 + (3 - ratingValue) * 0.02))
    )
  );

  // Handle based on current state and rating
  switch (state) {
    case "new":
    case "learning":
      if (rating === "again") {
        // Reset to first learning step
        new_state = "learning";
        interval = 0;
      } else if (rating === "good" || rating === "easy") {
        // Graduate to review
        new_state = "review";
        interval = rating === "easy"
          ? config.easy_interval
          : config.graduating_interval;
      } else {
        // Hard - stay in learning
        new_state = "learning";
        interval = Math.max(1, Math.floor(interval * 0.5));
      }
      break;

    case "review":
      if (rating === "again") {
        // Lapse - back to relearning
        new_state = "relearning";
        should_lapse = true;
        interval = Math.floor(interval * config.lapse_interval_multiplier);
      } else {
        // Calculate new interval
        const multiplier = rating === "easy" ? 1.3 : rating === "good" ? 1.0 : 0.8;
        const newInterval = Math.max(1, Math.round(interval * newEaseFactor * multiplier));

        // Check if should graduate
        if (newInterval >= 21) {
          new_state = "graduated";
        }

        interval = newInterval;
      }
      break;

    case "relearning":
      if (rating === "again") {
        // Stay in relearning
        interval = Math.max(1, Math.floor(interval * 0.5));
      } else {
        // Graduate back to review
        new_state = "review";
        interval = Math.max(1, Math.floor(interval * 0.5));
      }
      break;

    case "graduated":
      if (rating === "again") {
        // Lapse
        new_state = "relearning";
        should_lapse = true;
        interval = Math.floor(interval * config.lapse_interval_multiplier);
      } else {
        const multiplier = rating === "easy" ? 1.3 : rating === "good" ? 1.0 : 0.85;
        interval = Math.round(interval * newEaseFactor * multiplier);
      }
      break;
  }

  // Ensure minimum interval of 1 day
  interval = Math.max(1, interval);

  // Calculate next due date
  const next_due_date = new Date();
  next_due_date.setDate(next_due_date.getDate() + interval);

  return {
    new_state,
    new_interval: interval,
    new_ease_factor: newEaseFactor,
    next_due_date,
    should_lapse,
  };
}

// ============================================
// Review Log
// ============================================

/**
 * Get review log for a card.
 */
export async function getCardReviewLog(cardId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("srs_review_log")
    .select("*")
    .eq("card_id", cardId)
    .order("reviewed_at", { ascending: false });

  if (error) throw error;
  return data as SRSReviewLog[];
}

/**
 * Get the last review rating for each content_id for a given card type.
 * Returns a map of content_id -> last rating.
 */
export async function getLastReviewPerContent(
  userId: string,
  cardType: CardType
): Promise<Record<string, SRSRating>> {
  const supabase = await createClient();

  // Get the most recent review for each card of this type
  const { data, error } = await supabase
    .from("user_srs_cards")
    .select(`
      content_id,
      srs_review_log!left (
        rating,
        reviewed_at
      )
    `)
    .eq("user_id", userId)
    .eq("card_type", cardType);

  if (error) {
    console.warn("[getLastReviewPerContent] failed:", error.message);
    return {};
  }

  // Build a map of content_id -> last rating
  // Each card may have multiple reviews; we take the most recent one
  const result: Record<string, SRSRating> = {};

  for (const card of data ?? []) {
    const reviews = card.srs_review_log as unknown as Array<{
      rating: SRSRating;
      reviewed_at: string;
    }> | null;

    if (reviews && reviews.length > 0) {
      // Already ordered by reviewed_at DESC from the query
      result[card.content_id] = reviews[0].rating;
    }
  }

  return result;
}

/**
 * Get today's review stats.
 */
export async function getTodayReviewStats(userId: string): Promise<TodayReviewSummary> {
  const [dueCards, newCards] = await Promise.all([
    getDueCards(userId),
    getNewCards(userId, 100), // Estimate
  ]);

  // Count review vs new cards
  const reviewCards = dueCards.filter(c => c.state !== "new");
  const newDueCards = dueCards.filter(c => c.state === "new");

  return {
    total_due: dueCards.length,
    new_cards: newDueCards.length + Math.min(newCards.length, 20),
    review_cards: reviewCards.length,
    estimated_time_minutes: Math.ceil((reviewCards.length * 15 + newDueCards.length * 30) / 60),
  };
}

/**
 * Get deck statistics.
 */
export async function getDeckStats(userId: string, deckKey?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("user_srs_cards")
    .select("state, deck_key")
    .eq("user_id", userId);

  if (deckKey) {
    query = query.eq("deck_key", deckKey);
  }

  const { data, error } = await query;

  if (error) throw error;

  const cards = data ?? [];

  return {
    deck_key: deckKey ?? "all",
    total_cards: cards.length,
    new_cards: cards.filter(c => c.state === "new").length,
    learning_cards: cards.filter(c => c.state === "learning" || c.state === "relearning").length,
    review_cards: cards.filter(c => c.state === "review" || c.state === "graduated").length,
    due_today: 0, // Would need due calculation
    due_new: 0,
    due_review: 0,
  } as DeckStats;
}

// ============================================
// SRS Utility
// ============================================

/**
 * Count user's learned vocabulary/kanji.
 */
export async function getLearnedCount(userId: string, cardType?: CardType) {
  const supabase = await createClient();

  let query = supabase
    .from("user_srs_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("state", "new");

  if (cardType) {
    query = query.eq("card_type", cardType);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count ?? 0;
}

/**
 * Count user's mastered cards (graduated with interval > 21 days).
 */
export async function getMasteredCount(userId: string, cardType?: CardType) {
  const supabase = await createClient();

  let query = supabase
    .from("user_srs_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("state", "graduated")
    .gte("interval", 21);

  if (cardType) {
    query = query.eq("card_type", cardType);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count ?? 0;
}

/**
 * Get today's review count from the review log.
 */
export async function getTodayReviewCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count, error } = await supabase
    .from("srs_review_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("reviewed_at", today.toISOString())
    .lt("reviewed_at", tomorrow.toISOString());

  if (error) throw error;
  return count ?? 0;
}
