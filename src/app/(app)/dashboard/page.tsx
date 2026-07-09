import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { StatsCard } from "@/components/ui/stats-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import {
  BookOpen,
  Flame,
  Target,
  Trophy,
  BrainCircuit,
  Layers,
  FileText,
  Zap,
  Clock,
  Star,
} from "lucide-react";
import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { getOrCreateUserProgress, getStreakInfo, getWeeklyStats } from "@/lib/db/progress";
import { getDueCards, getTodayReviewStats } from "@/lib/db/srs";
import { getDailyWord } from "@/lib/daily-word";
import { KanaProgressCard } from "@/components/kana/kana-progress-card";

export const metadata: Metadata = {
  title: "Beranda",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 18) return "Selamat Siang";
  return "Selamat Malam";
}

function getGreetingMessage() {
  const hour = new Date().getHours();
  if (hour < 12) return "Waktu terbaik untuk belajar kanji!";
  if (hour < 18) return "Lanjutkan pembelajaran Anda!";
  return "Waktu untuk tinjauan!";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const profile = await getUserProfile();
  const displayName = profile?.display_name || user.email?.split("@")[0] || "Pembelajar";

  // ── Resilient data fetching ──────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safe = async <T,>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; code?: string; details?: string };
      const errorMessage = errorObj?.message || errorObj?.code || String(err);
      console.error(`[Dashboard] DB error in "${label}":`, errorMessage);
      return fallback;
    }
  };

  const defaultProgress = {
    user_id: user.id, total_xp: 0, level: 1, streak: 0, longest_streak: 0,
    last_activity_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  const defaultStreak = { current_streak: 0, longest_streak: 0, last_activity_date: null, streak_active_today: false };
  const defaultWeekly = { week_start: "", week_end: "", total_xp: 0, total_lessons: 0, total_time_minutes: 0, average_accuracy: 0, days_active: 0, daily_stats: [] };
  const defaultToday  = { total_due: 0, new_cards: 0, review_cards: 0, estimated_time_minutes: 0 };

  const [progress, streakInfo, weeklyStats, todayStats, dueCards, dailyWord] = await Promise.all([
    safe("getOrCreateUserProgress", () => getOrCreateUserProgress(user.id), defaultProgress as any),
    safe("getStreakInfo",           () => getStreakInfo(user.id),           defaultStreak),
    safe("getWeeklyStats",          () => getWeeklyStats(user.id),          defaultWeekly),
    safe("getTodayReviewStats",     () => getTodayReviewStats(user.id),     defaultToday),
    safe("getDueCards",             () => getDueCards(user.id),             [] as any[]),
    safe("getDailyWord",            () => getDailyWord(),                   null),
  ]);

  const DAILY_GOAL = 20;
  const cardsReviewedToday = Math.min(
    todayStats.total_due - dueCards.length,
    DAILY_GOAL
  );
  const dailyGoalProgress = Math.round((cardsReviewedToday / DAILY_GOAL) * 100);

  const streakDays = streakInfo.current_streak;
  const streakLabel =
    streakDays === 0
      ? "Mulai streak Anda!"
      : streakDays === 1
        ? "1 hari berjalan!"
        : `${streakDays} hari berturut-turut!`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-muted-foreground">
            Lanjutkan perjalanan belajar bahasa Jepang Anda
          </p>
        </div>
      </FadeIn>

      {/* 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stats Row */}
          <FadeIn delay={0.05}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatsCard
                title="Streak Saat Ini"
                value={`${streakDays} hari`}
                description={streakLabel}
                icon={<Flame className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Kartu Ditinjau"
                value={String(weeklyStats.total_lessons || todayStats.total_due)}
                trend={{ value: weeklyStats.days_active ?? 0, label: "hari aktif" }}
                icon={<Layers className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Akurasi"
                value={`${Math.round(weeklyStats.average_accuracy || 0)}%`}
                trend={
                  weeklyStats.average_accuracy > 0
                    ? { value: 0, label: "rerata mingguan" }
                    : undefined
                }
                icon={<Target className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Total XP"
                value={String(progress.total_xp)}
                description={`Level ${progress.level}`}
                icon={<Trophy className="h-5 w-5 text-primary" />}
              />
            </div>
          </FadeIn>

          {/* Daily Goal & Reviews */}
          <FadeIn delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Target Harian</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <ProgressRing value={dailyGoalProgress} size={88} strokeWidth={7} />
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold">
                      {cardsReviewedToday}/{DAILY_GOAL}
                    </p>
                    <p className="text-sm text-muted-foreground">Kartu ditinjau</p>
                    {dueCards.length > 0 ? (
                      <Link href="/flashcards">
                        <Button size="sm" className="mt-2">Lanjutkan</Button>
                      </Link>
                    ) : (
                      <p className="mt-1 text-xs text-primary">Target tercapai!</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tinjauan Hari Ini</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kartu jatuh tempo</span>
                    <span className="font-medium">{dueCards.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kartu baru</span>
                    <span className="font-medium">{todayStats.new_cards}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Perkiraan waktu</span>
                    <span className="font-medium">~{todayStats.estimated_time_minutes} menit</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>

          {/* Daily Word */}
          {dailyWord && (
            <FadeIn delay={0.12}>
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Kata Hari Ini</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-primary">{dailyWord.expression}</p>
                    <p className="text-sm text-muted-foreground">{dailyWord.reading}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{dailyWord.meaning_id || dailyWord.meaning_en}</p>
                    <Link href="/vocabulary" className="text-xs text-primary hover:underline">
                      Lihat selengkapnya
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Continue Learning */}
          <FadeIn delay={0.15}>
            <SectionHeader title="Lanjutkan Belajar" description="Pilih dari mana Anda berhenti" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  title: "Hiragana Dasar",
                  desc: "Huruf dasar bahasa Jepang",
                  href: "/hiragana",
                  progress: 0,
                  icon: FileText,
                },
                {
                  title: "Katakana",
                  desc: "Karakter untuk kata asing",
                  href: "/katakana",
                  progress: 0,
                  icon: FileText,
                },
                {
                  title: "Kosakata",
                  desc: "Kosa kata JLPT N5",
                  href: "/vocabulary",
                  progress: 0,
                  icon: Layers,
                },
                {
                  title: "Tata Bahasa",
                  desc: "Pola kalimat dasar",
                  href: "/grammar",
                  progress: 0,
                  icon: BrainCircuit,
                },
                {
                  title: "Kanji N5",
                  desc: "Aksara kanji dasar",
                  href: "/kanji",
                  progress: 0,
                  icon: BookOpen,
                },
                {
                  title: "Kuis Harian",
                  desc: "10 pertanyaan - 5 menit",
                  href: "/quiz",
                  icon: BrainCircuit,
                  isAction: true,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.title}
                    className="group border-border transition-colors hover:border-primary/30 hover:bg-muted/30"
                  >
                    <Link href={item.href}>
                      <CardContent className="p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="mt-3 font-medium">{item.title}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
                        {item.isAction ? (
                          <Button className="mt-3 w-full" size="sm" variant="outline">
                            Mulai Kuis
                          </Button>
                        ) : (
                          <div className="mt-3">
                            <ProgressBar value={item.progress} showValue={false} size="sm" />
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.progress}% selesai
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </FadeIn>
        </div>

        {/* Right Column - Sidebar (1/3 width) */}
        <div className="space-y-4">
          {/* Kana Progress */}
          <FadeIn delay={0.08}>
            <KanaProgressCard />
          </FadeIn>

          {/* Quick Actions */}
          <FadeIn delay={0.12}>
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Pelajaran Baru", href: "/learn", icon: BookOpen },
                  { label: "Kartu Flashcard", href: "/flashcards", icon: Layers },
                  { label: "Latihan Kuis", href: "/quiz", icon: BrainCircuit },
                  { label: "Tinjauan Harian", href: "/flashcards", icon: Target },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href} className="block">
                      <Button variant="outline" className="w-full justify-start text-sm">
                        <Icon className="mr-2 h-4 w-4" />
                        {action.label}
                      </Button>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Daily Challenge */}
          <FadeIn delay={0.16}>
            <Card className="border-border bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-primary" />
                  Tantangan Harian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Selesaikan 10 kartu flashcard hari ini dan dapatkan bonus XP!
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{cardsReviewedToday}/10</span>
                </div>
                <ProgressBar value={Math.min(cardsReviewedToday * 10, 100)} size="sm" />
                <Link href="/flashcards" className="block">
                  <Button size="sm" className="w-full">
                    <Zap className="mr-1 h-4 w-4" />
                    Mulai Tantangan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Streak Info */}
          <FadeIn delay={0.2}>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{streakDays} Hari</p>
                    <p className="text-sm text-muted-foreground">
                      {streakDays > 0 ? "Streak sedang aktif!" : "Mulai streak Anda hari ini!"}
                    </p>
                  </div>
                </div>
                {streakInfo.longest_streak > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-primary" />
                    Rekor terbaik: {streakInfo.longest_streak} hari
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Time of Day Greeting */}
          <FadeIn delay={0.24}>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {getGreeting()}, {displayName}!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getGreetingMessage()}
                    </p>
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
