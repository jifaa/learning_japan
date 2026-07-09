import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, Lock, Circle, ArrowRight, BookOpen, Target, Zap, Lightbulb } from "lucide-react";
import { getKatakana } from "@/lib/db/content";
import { getKanaProgress } from "@/lib/db/progress";
import { getCurrentUser } from "@/lib/auth";
import { KanaChartWithLock } from "@/components/kana/kana-chart-with-lock";
import { getKanaMasteryStats } from "@/lib/kana-quiz";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata: Metadata = { title: "Katakana" };

export default async function KatakanaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const chars = await getKatakana();
  const progress = await getKanaProgress(user.id, "katakana");
  const progressMap = new Map(progress.map((p: any) => [p.kana_id, p.mastery_count || 0]));

  // Calculate mastery stats
  const masteryStats = getKanaMasteryStats(chars, progressMap);

  // Build chart data
  const chartData = masteryStats.categories.map((cat) => {
    const catChars = chars.filter((c) => c.category === cat.categoryId);
    const rowMap: Record<string, { label: string; chars: { character: string; romaji: string; href: string }[] }> = {};
    for (const c of catChars) {
      const row = c.row_group || "main";
      if (!rowMap[row]) rowMap[row] = { label: row, chars: [] };
      rowMap[row].chars.push({ character: c.kana, romaji: c.romaji, href: `/katakana/${encodeURIComponent(c.kana)}` });
    }
    return {
      categoryId: cat.categoryId,
      title: cat.label,
      isLocked: !cat.isUnlocked,
      groups: Object.values(rowMap),
    };
  });

  const currentCategory = masteryStats.categories.find((cat) => cat.isUnlocked && !cat.isCompleted);
  const nextCategory = masteryStats.categories.find((cat) => !cat.isCompleted && !cat.isUnlocked);
  const overallPercent = masteryStats.totalChars > 0
    ? Math.round((masteryStats.masteredChars / masteryStats.totalChars) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Katakana</h1>
            <p className="text-sm text-muted-foreground">
              {masteryStats.masteredChars} / {masteryStats.totalChars} karakter dikuasai ({overallPercent}%)
            </p>
          </div>
          <Link href="/katakana/quiz">
            <Button size="sm">
              <Trophy className="mr-2 h-4 w-4" />
              Quiz Mastery
            </Button>
          </Link>
        </div>
      </FadeIn>

      {/* 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column - Main Content (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Progress Summary with Categories */}
          <FadeIn delay={0.05}>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {masteryStats.categories.map((cat) => (
                    <div key={cat.categoryId} className="flex items-center gap-3">
                      <div className="w-5 shrink-0">
                        {cat.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : cat.isUnlocked ? (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-medium truncate",
                            !cat.isUnlocked && "text-muted-foreground"
                          )}>
                            {cat.label}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground shrink-0">
                            {cat.masteredChars}/{cat.totalChars}
                          </span>
                        </div>
                        <ProgressBar
                          value={cat.progressPercent}
                          className={cn(!cat.isUnlocked && "opacity-50")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Action Row */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {nextCategory ? (
                    <p className="text-sm text-muted-foreground">
                      Selesaikan <span className="font-medium text-foreground">{currentCategory?.label || "Huruf Dasar"}</span> untuk unlock <span className="font-medium text-foreground">{nextCategory.label}</span>
                    </p>
                  ) : masteryStats.categories.every((c) => c.isCompleted) ? (
                    <p className="text-sm font-medium text-primary">
                      Semua Katakana dikuasai!
                    </p>
                  ) : null}
                  <Link href="/katakana/quiz" className="shrink-0">
                    <Button size="sm">
                      {currentCategory ? <>Quiz {currentCategory.label}</> : nextCategory ? <>Unlock {nextCategory.label}</> : <>Review Semua</>}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Chart with lock state */}
          <FadeIn delay={0.1}>
            <KanaChartWithLock categories={chartData} script="katakana" />
          </FadeIn>

          {/* Tips - Compact inline version */}
          <FadeIn delay={0.3}>
            <Card className="border-border bg-muted/30">
              <CardContent className="flex items-start gap-3 p-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Klik karakter untuk dengar pengucapan. Katakana digunakan untuk kata asing: <span className="font-mono text-xs">コーヒー</span> (kopi), <span className="font-mono text-xs">テレビ</span> (TV). Jawab 3x benar di quiz untuk kuasai.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Right Column - Sidebar (1/3) */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Quick Quiz Card */}
          <FadeIn delay={0.08}>
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-primary" />
                  Quiz Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Uji kemampuan membaca Katakana dengan quiz singkat.
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pertanyaan</span>
                    <span className="font-medium">10 soal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-medium">80% benar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP Reward</span>
                    <span className="font-medium text-primary">+40 XP</span>
                  </div>
                </div>
                <Link href="/katakana/quiz" className="block">
                  <Button className="w-full">
                    <Target className="mr-2 h-4 w-4" />
                    Mulai Quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Resources & Categories Combined */}
          <FadeIn delay={0.12}>
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Sumber Belajar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Navigation Links */}
                <div className="space-y-2">
                  <Link href="/hiragana" className="block">
                    <Button variant="outline" className="w-full justify-start text-sm">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Belajar Hiragana
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Button>
                  </Link>
                  <Link href="/vocabulary" className="block">
                    <Button variant="outline" className="w-full justify-start text-sm">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Kosakata Dasar
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Button>
                  </Link>
                  <Link href="/grammar" className="block">
                    <Button variant="outline" className="w-full justify-start text-sm">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Tata Bahasa
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
                {/* Category Breakdown */}
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Kategori</p>
                  <div className="space-y-1.5">
                    {masteryStats.categories.map((cat) => (
                      <div key={cat.categoryId} className="flex items-center justify-between text-sm">
                        <span className={cn(
                          "flex items-center gap-2",
                          !cat.isUnlocked && "text-muted-foreground"
                        )}>
                          {cat.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : cat.isUnlocked ? (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground/50" />
                          )}
                          {cat.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{cat.totalChars}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
