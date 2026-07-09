import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { FadeIn } from "@/components/motion/fade-in";
import { Flame, Trophy, Target, BookOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateUserProgress, getStreakInfo, getWeeklyStats } from "@/lib/db/progress";
import { getLearnedCount, getMasteredCount } from "@/lib/db/srs";
import { getVocabularyCount, getKanjiCount } from "@/lib/db/content";
import { ProgressChart } from "./progress-chart";

export const metadata: Metadata = { title: "Progres" };

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [progress, streakInfo, weeklyStats, vocabLearned, vocabTotal, kanjiLearned, kanjiTotal] =
    await Promise.all([
      getOrCreateUserProgress(user.id),
      getStreakInfo(user.id),
      getWeeklyStats(user.id),
      getLearnedCount(user.id, "vocabulary" as any),
      getVocabularyCount("N5" as any),
      getLearnedCount(user.id, "kanji" as any),
      getKanjiCount("N5" as any),
    ]);

  const vocabPct = vocabTotal > 0 ? Math.round((vocabLearned / vocabTotal) * 100) : 0;
  const kanjiPct = kanjiTotal > 0 ? Math.round((kanjiLearned / kanjiTotal) * 100) : 0;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Progres</h1>
          <p className="text-sm text-muted-foreground">Lacak perkembangan belajar Anda</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Streak Saat Ini"
            value={`${streakInfo.current_streak} hari`}
            icon={<Flame className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Total XP"
            value={String(progress.total_xp)}
            description={`Level ${progress.level}`}
            icon={<Trophy className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Kosakata"
            value={`${vocabLearned} / ${vocabTotal}`}
            description={`${vocabPct}% dikuasai`}
            icon={<BookOpen className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Akurasi Rerata"
            value={`${Math.round(weeklyStats.average_accuracy || 0)}%`}
            icon={<Target className="h-5 w-5 text-primary" />}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <ProgressChart weeklyStats={weeklyStats} />
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-medium">Kosakata JLPT N5</h3>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: vocabPct + "%" }} />
              </div>
              <p className="text-sm text-muted-foreground">{vocabLearned} dari {vocabTotal} kata ({vocabPct}%)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-medium">Kanji JLPT N5</h3>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: kanjiPct + "%" }} />
              </div>
              <p className="text-sm text-muted-foreground">{kanjiLearned} dari {kanjiTotal} karakter ({kanjiPct}%)</p>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
