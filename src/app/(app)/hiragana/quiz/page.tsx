import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getHiragana } from "@/lib/db/content";
import { getKanaProgress } from "@/lib/db/progress";
import { getCurrentUser } from "@/lib/auth";
import { KanaQuizPageClient } from "@/components/kana/kana-quiz-page-client";
import { selectActivePool, generateQuizQuestions } from "@/lib/kana-quiz";

export const metadata: Metadata = { title: "Hiragana Quiz" };

export default async function HiraganaQuizPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const chars = await getHiragana();
  if (!chars || chars.length === 0) {
    return (
      <div className="container py-8 text-center">
        <p>Gagal memuat data Hiragana.</p>
      </div>
    );
  }

  const progress = await getKanaProgress(user.id, "hiragana");
  const progressMap = new Map(progress.map((p: any) => [p.kana_id, p.mastery_count]));

  const { activePool, poolName } = selectActivePool(chars, progressMap);
  const questions = generateQuizQuestions(chars, activePool);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Kuis Hiragana</h1>
        <p className="text-sm text-muted-foreground">
          Uji kemampuan membaca Hiragana Anda. Sedang mempelajari:{" "}
          <span className="font-medium text-foreground">{poolName}</span>
        </p>
      </div>
      <KanaQuizPageClient questions={questions} script="hiragana" />
    </div>
  );
}
