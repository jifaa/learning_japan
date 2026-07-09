"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Star, Trophy, ArrowLeft, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressItem {
  kana_id: string;
  mastery_count: number;
  last_quizzed_at: string | null;
}

interface Stats {
  total: number;
  mastered: number;
  learning: number;
  notStarted: number;
  totalXp: number;
}

type FilterType = "all" | "mastered" | "learning" | "notStarted";

export function KanaProgressDetail({
  script,
  totalChars,
}: {
  script: "hiragana" | "katakana";
  totalChars: number;
}) {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    mastered: 0,
    learning: 0,
    notStarted: 0,
    totalXp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    // Fetch progress
    Promise.all([
      fetch(`/api/kana/progress?script=${script}`).then((r) => r.json()),
      fetch(`/api/kana/quiz/stats?script=${script}`).then((r) => r.json()),
    ])
      .then(([progressData, statsData]) => {
        setProgress(progressData.progress || []);
        setStats({
          total: progressData.total || 0,
          mastered: progressData.mastered || 0,
          learning: progressData.learning || 0,
          notStarted: progressData.notStarted || 0,
          totalXp: statsData.totalXp || 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [script]);

  const masteredPercent = totalChars > 0 ? Math.round((stats.mastered / totalChars) * 100) : 0;

  const filteredProgress = progress.filter((p) => {
    if (filter === "all") return true;
    if (filter === "mastered") return p.mastery_count >= 3;
    if (filter === "learning") return p.mastery_count > 0 && p.mastery_count < 3;
    if (filter === "notStarted") return p.mastery_count === 0;
    return true;
  });

  const scriptName = script === "hiragana" ? "Hiragana" : "Katakana";

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: stats.total },
    { key: "mastered", label: "Dikuasai", count: stats.mastered },
    { key: "learning", label: "Belajar", count: stats.learning },
    { key: "notStarted", label: "Belum", count: stats.notStarted },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/${script}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Progress {scriptName}</h1>
          <p className="text-sm text-muted-foreground">
            {stats.totalXp} XP diperoleh
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-medium">Penguasaan Keseluruhan</span>
            </div>
            <span className="text-lg font-bold">{masteredPercent}%</span>
          </div>
          <ProgressBar value={masteredPercent} max={100} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{stats.mastered} dikuasai</span>
            <span>{totalChars} total karakter</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Star className="mx-auto h-5 w-5 text-amber-500" />
            <p className="mt-1 text-xl font-bold">{stats.mastered}</p>
            <p className="text-xs text-muted-foreground">Dikuasai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Circle className="mx-auto h-5 w-5 text-yellow-500" />
            <p className="mt-1 text-xl font-bold">{stats.learning}</p>
            <p className="text-xs text-muted-foreground">Belajar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Circle className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-1 text-xl font-bold">{totalChars - stats.total}</p>
            <p className="text-xs text-muted-foreground">Baru</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f.label}: {f.count}
          </button>
        ))}
      </div>

      {/* Progress List */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Memuat...</p>
          ) : filteredProgress.length === 0 ? (
            <p className="text-center text-muted-foreground">
              {filter === "all"
                ? "Belum ada progress. Mulai quiz untuk menambah!"
                : "Tidak ada karakter dalam kategori ini"}
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {filteredProgress.map((p) => {
                const mastered = p.mastery_count >= 3;
                return (
                  <div
                    key={p.kana_id}
                    className={cn(
                      "relative flex flex-col items-center rounded-lg border p-2",
                      mastered
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                        : "border-border"
                    )}
                  >
                    {mastered && (
                      <Star className="absolute -top-1 -right-1 h-3 w-3 fill-amber-400 text-amber-400" />
                    )}
                    <span
                      className={cn(
                        "text-xl font-bold",
                        mastered && "text-amber-700 dark:text-amber-400"
                      )}
                    >
                      {p.kana_id}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {p.mastery_count}x
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz CTA */}
      <Link href={`/${script}/quiz`}>
        <Button className="w-full" size="lg">
          <Trophy className="mr-2 h-5 w-5" />
          Mulai Quiz {scriptName}
        </Button>
      </Link>
    </div>
  );
}
