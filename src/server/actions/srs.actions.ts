"use server";

import { revalidatePath } from "next/cache";
import { createSRSCardsForContent } from "@/lib/db/srs";
import type { CardType } from "@/types/srs";

/**
 * Add vocabulary/kanji/grammar cards to user's SRS deck.
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
