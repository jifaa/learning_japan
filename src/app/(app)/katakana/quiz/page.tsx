import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getKatakana } from "@/lib/db/content";
import { getKanaProgress } from "@/lib/db/progress";
import { getCurrentUser } from "@/lib/auth";
import { KanaQuizPageClient } from "@/components/kana/kana-quiz-page-client";
import { selectQuizById, getKanaQuizList, generateQuizQuestions } from "@/lib/kana-quiz";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { ChevronLeft, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ quiz?: string }>;
}

export const metadata: Metadata = { title: "Katakana Quiz" };

export default async function KatakanaQuizPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { quiz: quizId } = await searchParams;

  const chars = await getKatakana();
  if (!chars || chars.length === 0) {
    return (
      <div className="container py-8 text-center">
        <p>Gagal memuat data Katakana.</p>
      </div>
    );
  }

  const progress = await getKanaProgress(user.id, "katakana");
  const progressMap = new Map(progress.map((p: any) => [p.kana_id, p.mastery_count || 0]));

  const quizList = getKanaQuizList(chars, progressMap);

  // If no quiz ID specified, show quiz selection
  if (!quizId) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <FadeIn>
          <div>
            <Link href="/katakana">
              <Button variant="ghost" size="sm" className="-ml-2 mb-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Quiz Katakana</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pilih quiz yang ingin dikerjakan
            </p>
          </div>
        </FadeIn>

        {/* Quiz Grid */}
        <FadeIn delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-2">
            {quizList.map((quiz, index) => {
              const isLocked = !quiz.isUnlocked;

              return (
                <Card
                  key={quiz.id}
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isLocked
                      ? "opacity-60"
                      : quiz.isCompleted
                        ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                        : "hover:border-primary/50 hover:shadow-md"
                  )}
                >
                  <CardContent className="p-0">
                    <Link
                      href={isLocked ? "#" : `/katakana/quiz?quiz=${quiz.id}`}
                      className={cn(
                        "flex items-center gap-4 p-4",
                        !isLocked && "cursor-pointer"
                      )}
                      onClick={isLocked ? (e: any) => e.preventDefault() : undefined}
                    >
                      {/* Number/Badge */}
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        quiz.isCompleted
                          ? "bg-primary text-white"
                          : isLocked
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                      )}>
                        {quiz.isCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : isLocked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <span className="text-lg font-bold">{index + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "font-medium",
                            quiz.isCompleted ? "text-primary" : "",
                            isLocked && "text-muted-foreground"
                          )}>
                            {quiz.label}
                          </h3>
                          {quiz.isCompleted && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary font-medium">
                              Selesai
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isLocked ? "Selesaikan quiz sebelumnya" : quiz.description}
                        </p>

                        {/* Progress */}
                        {!isLocked && (
                          <div className="mt-3 flex items-center gap-2">
                            <ProgressBar value={quiz.progressPercent} className="flex-1 h-1.5" />
                            <span className="text-xs text-muted-foreground shrink-0">
                              {quiz.masteredChars}/{quiz.totalChars}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      {!isLocked && (
                        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        {/* Quick tip */}
        <FadeIn delay={0.1}>
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                Selesaikan semua quiz untuk membuka kategori Dakuon, Handakuon, dan Yōon
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  // Validate quiz ID and check if unlocked
  const targetQuiz = quizList.find((q) => q.id === quizId);
  if (!targetQuiz || !targetQuiz.isUnlocked) {
    redirect("/katakana/quiz");
  }

  const result = selectQuizById(chars, progressMap, quizId);
  if (!result) {
    redirect("/katakana/quiz");
  }

  const { activePool, poolName } = result;
  const questions = generateQuizQuestions(chars, activePool);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <Link href="/katakana/quiz">
            <Button variant="ghost" size="sm" className="-ml-2 mb-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Pilih Quiz
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Kuis Katakana</h1>
            <p className="text-sm text-muted-foreground">
              {poolName} - {activePool.length} karakter
            </p>
          </div>
        </div>
      </FadeIn>
      <KanaQuizPageClient questions={questions} script="katakana" />
    </div>
  );
}
