import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getKatakana } from "@/lib/db/content";
import { getKanaProgress } from "@/lib/db/progress";
import { getCurrentUser } from "@/lib/auth";
import { KanaQuizPageClient } from "@/components/kana/kana-quiz-page-client";
import { selectActivePool, generateQuizQuestions } from "@/lib/kana-quiz";

export const metadata: Metadata = { title: "Katakana Quiz" };

export default async function KatakanaQuizPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const chars = await getKatakana();
  if (!chars || chars.length === 0) {
    return (
      <div className="container py-8 text-center">
        <p>Gagal memuat data Katakana.</p>
      </div>
    );
  }

  const progress = await getKanaProgress(user.id, "katakana");
  const progressMap = new Map(progress.map((p: any) => [p.kana_id, p.mastery_count]));

  const { activePool, poolName } = selectActivePool(chars, progressMap);
  const questions = generateQuizQuestions(chars, activePool);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Kuis Katakana</h1>
        <p className="text-sm text-muted-foreground">
          Uji kemampuan membaca Katakana Anda. Sedang mempelajari:{" "}
          <span className="font-medium text-foreground">{poolName}</span>
        </p>
      </div>
      <KanaQuizPageClient questions={questions} script="katakana" />
    </div>
  );
}
