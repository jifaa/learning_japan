import type { Metadata } from "next";
import { redirect }from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion/fade-in";
import { Trophy, Flame, Star, BookOpen, CheckCircle, Lock, Award } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateUserProgress } from "@/lib/db/progress";
import { getLearnedCount } from "@/lib/db/srs";
import { DEFAULT_ACHIEVEMENTS } from "@/types/achievement";
import { calculateLevel, LEVEL_CONFIG, type LevelConfig } from "@/types/progress";

export const metadata: Metadata = { title: "Pencapaian" };

const CATEGORY_CONFIG = {
  streak: {
    label: "Streak",
    desc: "Konsistensi belajar harian",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  progress: {
    label: "Kemajuan",
    desc: "Selesaikan pelajaran dan topik",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  mastery: {
    label: "Penguasaan",
    desc: "Kuasai kosakata dan kanji",
    icon: Star,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  special: {
    label: "Khusus",
    desc: "Pencapaian unik dan langka",
    icon: Award,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
};

const RARITY_COLORS = {
  common: "border-muted bg-muted/30",
  uncommon: "border-green-500/40 bg-green-500/10",
  rare: "border-blue-500/40 bg-blue-500/10",
  epic: "border-purple-500/40 bg-purple-500/10",
  legendary: "border-amber-500/40 bg-amber-500/10",
};

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [progress, vocabLearned] = await Promise.all([
    getOrCreateUserProgress(user.id),
    getLearnedCount(user.id, "vocabulary"),
  ]);

  const level = calculateLevel(progress.total_xp);
  const nextLevel = LEVEL_CONFIG.find((l: LevelConfig) => l.level === level.level + 1);
  const prevLevel = LEVEL_CONFIG.find((l: LevelConfig) => l.level === level.level - 1);
  const xpInCurrentLevel = prevLevel ? progress.total_xp - prevLevel.xp_required : progress.total_xp;
  const xpNeededForLevel = nextLevel
    ? nextLevel.xp_required - (prevLevel?.xp_required ?? 0)
    : 1;
  const levelProgress = Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);

  // Determine which achievements are earned based on real progress
  const earnedIds = new Set<string>();
  if (progress.streak >= 3) earnedIds.add("streak_3_days");
  if (progress.streak >= 7) earnedIds.add("streak_7_days");
  if (progress.streak >= 30) earnedIds.add("streak_30_days");
  if (vocabLearned >= 1) earnedIds.add("first_lesson");
  if (vocabLearned >= 10) earnedIds.add("lessons_10");
  if (vocabLearned >= 50) earnedIds.add("vocabulary_50");
  if (vocabLearned >= 100) earnedIds.add("vocabulary_100");

  const categories = ["streak", "progress", "mastery", "special"] as const;

  const earnedCount = DEFAULT_ACHIEVEMENTS.filter((a) => earnedIds.has(a.id)).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pencapaian</h1>
          <p className="text-sm text-muted-foreground">
            {earnedCount} dari {DEFAULT_ACHIEVEMENTS.length} lencana terbuka
          </p>
        </div>
      </FadeIn>

      {/* Level Card */}
      <FadeIn delay={0.05}>
        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-stretch gap-0">
              {/* Level Badge */}
              <div className="flex flex-col items-center justify-center gap-3 border-r border-border bg-primary/5 px-8 py-6">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Trophy className="h-10 w-10" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-bold border border-border">
                    {progress.level}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{level.title}</p>
                  <p className="text-xs text-muted-foreground">Level {progress.level}</p>
                </div>
              </div>

              {/* XP Progress */}
              <div className="flex flex-1 flex-col justify-center gap-3 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{progress.total_xp.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">XP Total</p>
                  </div>
                  {nextLevel ? (
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">
                        +{(nextLevel.xp_required - progress.total_xp).toLocaleString()} XP
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Level {nextLevel.level}
                      </p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">Level Maksimum!</p>
                    </div>
                  )}
                </div>
                {nextLevel && (
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>Level {progress.level}</span>
                      <span>Level {nextLevel.level}</span>
                    </div>
                    <ProgressBar value={levelProgress} max={100} showValue={false} size="md" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Stats Row */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              icon: Flame,
              value: progress.streak,
              label: "Streak Saat Ini",
              color: "text-orange-500",
            },
            {
              icon: Trophy,
              value: progress.longest_streak,
              label: "Streak Terbaik",
              color: "text-amber-500",
            },
            {
              icon: Star,
              value: earnedCount,
              label: "Lencana Terbuka",
              color: "text-purple-500",
            },
            {
              icon: CheckCircle,
              value: vocabLearned,
              label: "Kata Dikuasai",
              color: "text-blue-500",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg ${stat.color.replace("text-", "bg-")}/10`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>

      {/* Achievement Badges by Category */}
      {categories.map((category) => {
        const config = CATEGORY_CONFIG[category];
        const CatIcon = config.icon;
        const badges = DEFAULT_ACHIEVEMENTS.filter((a) => a.category === category);
        if (badges.length === 0) return null;

        return (
          <FadeIn key={category} delay={0.15}>
            <SectionHeader
              title={config.label}
              description={config.desc}
              action={
                <div className={`flex items-center gap-2 text-sm ${config.color}`}>
                  <CatIcon className="h-4 w-4" />
                  <span>
                    {badges.filter((b) => earnedIds.has(b.id)).length}/{badges.length}
                  </span>
                </div>
              }
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => {
                const isEarned = earnedIds.has(badge.id);
                return (
                  <Card
                    key={badge.id}
                    className={`transition-all duration-200 ${
                      isEarned
                        ? `${config.borderColor} ${config.bgColor}`
                        : "opacity-50"
                    }`}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      {/* Badge Icon */}
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          isEarned ? config.bgColor : "bg-muted"
                        }`}
                      >
                        {isEarned ? (
                          <CatIcon className={`h-6 w-6 ${config.color}`} />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Badge Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-tight">{badge.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {badge.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          {isEarned ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}>
                              <CheckCircle className="h-3 w-3" />
                              Terbuka
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              <Lock className="h-3 w-3" />
                              Terkunci
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            +{badge.xp_reward} XP
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </FadeIn>
        );
      })}

      {/* How XP Works */}
      <FadeIn delay={0.5}>
        <SectionHeader title="Cara Mendapatkan XP" description="Accumulate experience points to level up" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { action: "Selesaikan pelajaran", xp: "+50 XP" },
            { action: "Jawab kuis dengan benar", xp: "+5 XP per soal" },
            { action: "Kuis sempurna", xp: "+20 XP bonus" },
            { action: "Tinjau kartu SRS", xp: "+2 XP per kartu" },
            { action: "Streak harian", xp: "+10 XP bonus" },
            { action: "Buka lencana", xp: "+25 XP" },
          ].map((item) => (
            <Card key={item.action}>
              <CardContent className="flex items-center justify-between p-3">
                <p className="text-sm">{item.action}</p>
                <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {item.xp}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
