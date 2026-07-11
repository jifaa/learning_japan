"use server";

import { revalidatePath } from "next/cache";
import { createSRSCardsForContent, createNewSRSCard } from "@/lib/db/srs";
import type { CardType } from "@/types/srs";

/**
 * Add vocabulary/kanji/grammar cards to user's SRS deck.
 * Uses upsert — skips content that already has a card (no duplicates).
 */
export async function addToSRSContentAction(
  contentIds: string[],
  cardType: CardType,
  deckKey: string
) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const cards = contentIds.map(id => ({
      card_type: cardType,
      content_id: id,
      deck_key: deckKey,
    }));

    await createSRSCardsForContent(user.id, cards);

    revalidatePath("/flashcards");
    revalidatePath("/vocabulary");
    revalidatePath("/kanji");
    revalidatePath("/grammar");

    return { success: true, count: contentIds.length };
  } catch (error) {
    console.error("Add to SRS error:", error);
    return { success: false, error: "Gagal menambahkan ke kartu latihan" };
  }
}

/**
 * Add a single item to SRS.
 */
export async function addToSRSContentSingleAction(
  contentId: string,
  cardType: CardType,
  deckKey: string
) {
  return addToSRSContentAction([contentId], cardType, deckKey);
}

/**
 * Add vocabulary/kanji/grammar cards to SRS — always creates new card entries.
 * Allows re-adding content that was previously reviewed.
 */
export async function addToSRSContentNewCardAction(
  contentIds: string[],
  cardType: CardType,
  deckKey: string
) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Insert each card individually to allow duplicates
    for (const contentId of contentIds) {
      await createNewSRSCard(user.id, {
        card_type: cardType,
        content_id: contentId,
        deck_key: deckKey,
      });
    }

    revalidatePath("/flashcards");
    revalidatePath("/vocabulary");
    revalidatePath("/kanji");
    revalidatePath("/grammar");

    return { success: true, count: contentIds.length };
  } catch (error) {
    console.error("Add to SRS (new card) error:", error);
    return { success: false, error: "Gagal menambahkan ke kartu latihan" };
  }
}

/**
 * Add a single item to SRS as a new card (allows re-adding).
 */
export async function addToSRSContentNewCardSingleAction(
  contentId: string,
  cardType: CardType,
  deckKey: string
) {
  return addToSRSContentNewCardAction([contentId], cardType, deckKey);
}
