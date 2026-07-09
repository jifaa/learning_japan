"use client";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import type { WeeklyStats } from "@/types/progress";

interface ProgressChartProps {
  weeklyStats: WeeklyStats;
}

export function ProgressChart({ weeklyStats }: ProgressChartProps) {
  const maxXP = Math.max(...weeklyStats.daily_stats.map(s => s.xp_earned || 0), 50);
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date().getDay();

  return (
    <div>
      <SectionHeader title="Aktivitas Mingguan" description="XP yang diperoleh setiap hari" />
      <div className="mt-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex h-40 items-end justify-between gap-2">
              {weeklyStats.daily_stats.map((stat, i) => {
                const height = maxXP > 0 ? Math.round(((stat.xp_earned || 0) / maxXP) * 100) : 0;
                const dayIndex = new Date(stat.date).getDay();
                return (
                  <div key={stat.id || i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{stat.xp_earned || 0} XP</span>
                    <div className="w-full rounded-t-sm bg-primary/20 transition-all hover:bg-primary/30" style={{ height: Math.max(height, 4) + "%" }}>
                      <div className="w-full rounded-t-sm bg-primary transition-all" style={{ height: ((stat.xp_earned || 0) / maxXP * 100) + "%" }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{days[dayIndex]}</span>
                  </div>
                );
              })}
              {weeklyStats.daily_stats.length === 0 && (
                <p className="w-full text-center text-sm text-muted-foreground">Belum ada aktivitas minggu ini</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
