import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, Lock, Circle, ArrowRight, BookOpen, Target, ChevronRight } from "lucide-react";
import { getHiragana } from "@/lib/db/content";
import { getKanaProgress } from "@/lib/db/progress";
import { getCurrentUser } from "@/lib/auth";
import { getKanaMasteryStats, getKanaQuizList } from "@/lib/kana-quiz";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata: Metadata = { title: "Hiragana" };

export default async function HiraganaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const chars = await getHiragana();
  const progress = await getKanaProgress(user.id, "hiragana");
  const progressMap = new Map(progress.map((p: any) => [p.kana_id, p.mastery_count || 0]));

  const masteryStats = getKanaMasteryStats(chars, progressMap);
  const quizList = getKanaQuizList(chars, progressMap);

  // Row order for sorting row groups
  const rowOrder = ["vowel", "k", "s", "t", "n", "h", "m", "y", "r", "w", "n-final"];

  const overallPercent = masteryStats.totalChars > 0
    ? Math.round((masteryStats.masteredChars / masteryStats.totalChars) * 100)
    : 0;

  // Find current active quiz
  const currentQuiz = quizList.find((q) => q.isUnlocked && !q.isCompleted);

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Hiragana</h1>
          <p className="text-sm text-muted-foreground">
            {masteryStats.masteredChars} dari {masteryStats.totalChars} karakter dikuasai ({overallPercent}%)
          </p>
          <div className="mt-1">
            <ProgressBar value={overallPercent} className="h-2" />
          </div>
        </div>
      </FadeIn>

      {/* Quiz Selection - Card Grid */}
      <FadeIn delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizList.map((quiz, index) => {
            const href = quiz.href.replace("/hiragana/", "/hiragana/");

            return (
              <Link key={quiz.id} href={href} className="block">
                <Card
                  className={cn(
                    "h-full transition-all duration-200",
                    quiz.isUnlocked
                      ? quiz.isCompleted
                        ? "border-primary/30 bg-primary/5 hover:border-primary/50 hover:shadow-md"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                      : "opacity-60 cursor-not-allowed"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        quiz.isCompleted
                          ? "bg-primary/10 text-primary"
                          : quiz.isUnlocked
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted text-muted-foreground"
                      )}>
                        {quiz.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : quiz.isUnlocked ? (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "font-medium",
                            quiz.isCompleted && "text-primary"
                          )}>
                            {quiz.label}
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {quiz.isUnlocked ? quiz.description : "Selesaikan quiz sebelumnya"}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <ProgressBar value={quiz.progressPercent} showValue={false} className="flex-1 h-1.5" />
                          <span className="text-xs text-muted-foreground shrink-0">
                            {quiz.masteredChars}/{quiz.totalChars}
                          </span>
                        </div>
                      </div>
                      {quiz.isUnlocked && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </FadeIn>

      {/* Character Chart */}
      <FadeIn delay={0.1}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tabel Karakter</h2>
            {currentQuiz && (
              <Link href={currentQuiz.href}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Target className="h-4 w-4" />
                  Quiz {currentQuiz.label.split(":")[0]}
                </Button>
              </Link>
            )}
          </div>

          {/* Category Tabs/Accordion */}
          <div className="space-y-4">
            {masteryStats.categories.map((cat) => {
              const catChars = chars.filter((c) => c.category === cat.categoryId);
              // Get unique row groups for this category, sorted by rowOrder
              const rowGroupsSet = new Set<string>();
              catChars.forEach((c) => { if (c.row_group) rowGroupsSet.add(c.row_group); });
              const catRowGroups = [...rowGroupsSet].sort((a, b) => {
                const aIdx = rowOrder.indexOf(a);
                const bIdx = rowOrder.indexOf(b);
                return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
              });

              return (
                <Card key={cat.categoryId} className="overflow-hidden">
                  <div className={cn(
                    "flex items-center gap-3 border-b px-4 py-3",
                    cat.isCompleted && "bg-primary/5",
                    !cat.isUnlocked && "opacity-60"
                  )}>
                    <div className="w-6 shrink-0">
                      {cat.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : cat.isUnlocked ? (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "text-sm font-medium",
                        !cat.isUnlocked && "text-muted-foreground"
                      )}>
                        {cat.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {cat.masteredChars}/{cat.totalChars} karakter • {cat.progressPercent}%
                      </p>
                    </div>
                    <ProgressBar value={cat.progressPercent} className="w-20 h-1.5" />
                  </div>

                  {cat.isUnlocked && catChars.length > 0 && (
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {catRowGroups.map((row) => {
                          const rowChars = catChars.filter((c) => c.row_group === row);
                          const rowMastered = rowChars.filter((c) => {
                            const charId = c.id || c.kana;
                            return (progressMap.get(charId) || 0) >= 1;
                          }).length;

                          return (
                            <div key={row}>
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                  {row}
                                </span>
                                <span className="text-xs text-muted-foreground">

                                </span>
                              </div>
                              <div className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2">
                                {rowChars.map((char) => {
                                  const charId = char.id || char.kana;
                                  const mastered = (progressMap.get(charId) || 0) >= 1;

                                  return (
                                    <div
                                      key={char.id || char.kana}
                                      className={cn(
                                        "flex aspect-square flex-col items-center justify-center rounded-lg border p-2.5",
                                        mastered
                                          ? "border-green-500/50 bg-green-50 dark:bg-green-950/30"
                                          : "border-border bg-background"
                                      )}
                                    >
                                      <span className={cn(
                                        "text-xl font-semibold leading-none",
                                        mastered ? "text-green-600 dark:text-green-400" : ""
                                      )}>
                                        {char.kana}
                                      </span>
                                      <span className={cn(
                                        "text-[10px] mt-1",
                                        mastered ? "text-green-500" : "text-muted-foreground"
                                      )}>
                                        {char.romaji}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Bottom Navigation */}
      <FadeIn delay={0.15}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/katakana" className="flex-1">
            <Button variant="outline" className="w-full gap-2 h-12">
              <BookOpen className="h-4 w-4" />
              <span>Katakana</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
          <Link href="/vocabulary" className="flex-1">
            <Button variant="outline" className="w-full gap-2 h-12">
              <BookOpen className="h-4 w-4" />
              <span>Kosakata</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
          <Link href="/grammar" className="flex-1">
            <Button variant="outline" className="w-full gap-2 h-12">
              <BookOpen className="h-4 w-4" />
              <span>Tata Bahasa</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
