import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion/fade-in";
import { Layers, Play, RefreshCw } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDueCards, getNewCards, getDeckStats, getUserCards } from "@/lib/db/srs";
import { FlashcardsClient } from "./flashcards-client";

export const metadata: Metadata = { title: "Kartu Latihan" };

export default async function FlashcardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [dueCards, newCards, allCards] = await Promise.all([
    getDueCards(user.id),
    getNewCards(user.id, 20),
    getUserCards(user.id),
  ]);

  const reviewCards = dueCards.filter((c) => c.state !== "new");
  const newDueCards = dueCards.filter((c) => c.state === "new");
  const totalDue = reviewCards.length + Math.min(newDueCards.length, 20);

  // Count by deck
  const kanaCards = allCards.filter((c) => c.deck_key === "kana");
  const vocabCards = allCards.filter((c) => c.deck_key === "vocabulary" || c.deck_key === "vocab");
  const grammarCards = allCards.filter((c) => c.deck_key === "grammar");

  const reviewedToday = allCards.filter((c) => c.last_review && c.last_review.startsWith(new Date().toISOString().split("T")[0]));

  const retentionRate = reviewedToday.length > 0
    ? Math.round((reviewedToday.filter((c) => c.state !== "learning").length / reviewedToday.length) * 100)
    : 0;

  const supabase = await createClient();
  const sessionCards = [...dueCards, ...newCards];
  const vocabIds = sessionCards.filter(c => c.card_type === "vocabulary" || c.deck_key === "vocabulary" || c.deck_key === "vocab").map(c => c.content_id);
  const kanjiIds = sessionCards.filter(c => c.card_type === "kanji").map(c => c.content_id);
  const grammarIds = sessionCards.filter(c => c.card_type === "grammar").map(c => c.content_id);

  const contentMap: Record<string, any> = {};

  if (vocabIds.length > 0) {
    const { data } = await supabase.from("vocabulary").select("*").in("id", vocabIds);
    data?.forEach(v => { contentMap[v.id] = v; });
  }
  if (kanjiIds.length > 0) {
    const { data } = await supabase.from("kanji").select("*").in("id", kanjiIds);
    data?.forEach(k => { contentMap[k.id] = k; });
  }
  if (grammarIds.length > 0) {
    const { data } = await supabase.from("grammar_points").select("*").in("id", grammarIds);
    data?.forEach(g => { contentMap[g.id] = g; });
  }

  return (
    <div className="space-y-8">
      <FlashcardsClient
        dueCards={dueCards}
        newCards={newCards}
        totalDue={totalDue}
        reviewedToday={reviewedToday.length}
        retentionRate={retentionRate}
        contentMap={contentMap}
        decks={[
          {
            id: "vocabulary",
            title: "Kosakata N5",
            desc: "Kata-kata penting JLPT N5",
            total: vocabCards.length,
            due: vocabCards.filter((c) => c.due_date <= new Date().toISOString()).length,
            newCards: vocabCards.filter((c) => c.state === "new").length,
          },
          {
            id: "kana",
            title: "Hiragana & Katakana",
            desc: "Karakter dasar",
            total: kanaCards.length,
            due: kanaCards.filter((c) => c.due_date <= new Date().toISOString()).length,
            newCards: kanaCards.filter((c) => c.state === "new").length,
          },
          {
            id: "grammar",
            title: "Pola Tata Bahasa",
            desc: "Struktur kalimat inti",
            total: grammarCards.length,
            due: grammarCards.filter((c) => c.due_date <= new Date().toISOString()).length,
            newCards: grammarCards.filter((c) => c.state === "new").length,
          },
        ]}
      />
    </div>
  );
}
