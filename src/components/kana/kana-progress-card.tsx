"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, Circle, Trophy, BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KanaMasteryStats } from "@/lib/kana-quiz";

interface Props {
  initialStats?: {
    hiragana: KanaMasteryStats;
    katakana: KanaMasteryStats;
  };
}

export function KanaProgressCard({ initialStats }: Props) {
  const [stats, setStats] = useState<{
    hiragana: KanaMasteryStats;
    katakana: KanaMasteryStats;
  } | null>(initialStats || null);
  const [loading, setLoading] = useState(!initialStats);
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">("hiragana");

  useEffect(() => {
    if (stats) return;

    async function fetchStats() {
      try {
        const res = await fetch("/api/kana/mastery-stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch kana stats", e);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [stats]);

  const currentStats = activeTab === "hiragana" ? stats?.hiragana : stats?.katakana;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Kemajuan Kana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentStats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Kemajuan Kana</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gagal memuat data. <Link href="/hiragana" className="text-primary underline">Coba lagi</Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentCategory = currentStats.categories.find(
    (cat) => cat.isUnlocked && !cat.isCompleted
  );
  const nextCategory = currentStats.categories.find(
    (cat) => !cat.isCompleted && !cat.isUnlocked
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Kemajuan Kana</CardTitle>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("hiragana")}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                activeTab === "hiragana"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Hiragana
            </button>
            <button
              onClick={() => setActiveTab("katakana")}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                activeTab === "katakana"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Katakana
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall progress */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Dikuasai</span>
          <span className="text-sm font-medium">
            {currentStats.masteredChars}/{currentStats.totalChars}
          </span>
        </div>
        <ProgressBar
          value={currentStats.totalChars > 0
            ? (currentStats.masteredChars / currentStats.totalChars) * 100
            : 0}
          size="sm" showValue={false}
        />

        {/* Category list */}
        <div className="space-y-2">
          {currentStats.categories.map((cat) => (
            <div key={cat.categoryId} className="flex items-center gap-3">
              <div className="w-5">
                {cat.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : cat.isUnlocked ? (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm",
                    !cat.isUnlocked && "text-muted-foreground"
                  )}>
                    {cat.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cat.masteredChars}/{cat.totalChars}
                  </span>
                </div>
                <ProgressBar
                  value={cat.progressPercent}
                  className="mt-1 h-1" showValue={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/${activeTab}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <BookOpen className="mr-1 h-4 w-4" />
              Lihat Chart
            </Button>
          </Link>
          <Link href={`/${activeTab}/quiz`} className="flex-1">
            <Button size="sm" className="w-full">
              {currentCategory ? (
                <>Quiz {currentCategory.label}</>
              ) : nextCategory ? (
                <>Unlock {nextCategory.label}</>
              ) : (
                <>Review Semua</>
              )}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Next unlock info */}
        {nextCategory && (
          <div className="rounded-lg bg-muted/50 p-3 text-xs">
            <p className="text-muted-foreground">
              Selesaikan <strong>{currentCategory?.label || currentStats.categories[0]?.label}</strong> untuk unlock{" "}
              <strong>{nextCategory.label}</strong>
            </p>
          </div>
        )}

        {/* All completed */}
        {currentStats.categories.every((cat) => cat.isCompleted) && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm">
            <Trophy className="h-5 w-5 text-success" />
            <span className="font-medium text-success">
              Semua {activeTab === "hiragana" ? "Hiragana" : "Katakana"} dikuasai!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
