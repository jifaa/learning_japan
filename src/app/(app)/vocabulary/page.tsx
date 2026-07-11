import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentUser } from "@/lib/auth";
import { getVocabularyByLevel } from "@/lib/db/content";
import { getUserCards, getLastReviewPerContent } from "@/lib/db/srs";
import { VocabularyClient } from "./vocabulary-client";
import type { SRSRating } from "@/types/srs";

export const metadata: Metadata = { title: "Kosakata" };

export default async function VocabularyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [words, srsCards, lastReviewPerVocab] = await Promise.all([
    getVocabularyByLevel("N5"),
    getUserCards(user.id),
    getLastReviewPerContent(user.id, "vocabulary"),
  ]);

  // Create a set of vocabulary IDs already in SRS
  const vocabInSRS = new Set(
    srsCards
      .filter(c => c.card_type === "vocabulary")
      .map(c => c.content_id)
  );

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kosakata</h1>
          <p className="text-sm text-muted-foreground">
            {words.length} kata dalam JLPT N5
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <VocabularyClient
          words={words}
          vocabInSRS={vocabInSRS}
          lastReviewPerVocab={lastReviewPerVocab as Record<string, SRSRating>}
        />
      </FadeIn>
    </div>
  );
}
