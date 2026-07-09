"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Volume2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanaChar {
  id?: string;
  kana: string;
  romaji: string;
  category?: string;
  row_group?: string;
}

interface ProgressData {
  [kanaId: string]: {
    mastery_count: number;
  };
}

interface Props {
  chars: KanaChar[];
  script: "hiragana" | "katakana";
}

function groupByCategory(chars: KanaChar[]) {
  const cats: Record<string, Record<string, KanaChar[]>> = {};

  for (const c of chars) {
    const cat = c.category || "basic";
    const row = c.row_group || "main";
    if (!cats[cat]) cats[cat] = {};
    if (!cats[cat][row]) cats[cat][row] = [];
    cats[cat][row].push(c);
  }

  return Object.entries(cats).map(([catId, rows]) => ({
    categoryId: catId,
    title:
      catId === "basic"
        ? "Huruf Dasar"
        : catId === "dakuon"
        ? "Dakuon (Tenten)"
        : catId === "handakuon"
        ? "Handakuon (Maru)"
        : catId === "yoon"
        ? "Yōon"
        : catId,
    rows: Object.entries(rows).map(([rowLabel, chars]) => ({
      label: rowLabel,
      chars,
    })),
  }));
}

export function KanaChartWithProgress({ chars, script }: Props) {
  const [progress, setProgress] = useState<ProgressData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/kana/progress?script=${script}`)
      .then((res) => res.json())
      .then((data) => {
        // Convert array to map keyed by kana_id
        const map: ProgressData = {};
        (data.progress || []).forEach((p: any) => {
          map[p.kana_id] = { mastery_count: p.mastery_count };
        });
        setProgress(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [script]);

  const categories = groupByCategory(chars);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const isMastered = (kanaId: string) => {
    const p = progress[kanaId];
    return p && p.mastery_count >= 3;
  };

  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <div key={cat.categoryId}>
          <SectionHeader
            title={cat.title}
            description={`${cat.rows.reduce((sum, r) => sum + r.chars.length, 0)} karakter`}
          />
          <div className="mt-4 space-y-4">
            {cat.rows.map((row) => (
              <Card key={row.label}>
                <CardContent className="p-4">
                  <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {row.chars.map((char) => {
                      const kanaId = char.id?.toString() || char.kana;
                      const mastered = isMastered(kanaId);
                      const p = progress[kanaId];
                      const count = p?.mastery_count ?? 0;

                      return (
                        <button
                          key={char.kana}
                          onClick={() => speak(char.kana)}
                          className={cn(
                            "group relative flex flex-col items-center rounded-xl border-2 p-3 transition-all",
                            mastered
                              ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                              : "border-border bg-background hover:border-primary/50"
                          )}
                        >
                          {/* Mastered badge */}
                          {mastered && (
                            <Star className="absolute -top-2 -right-2 h-5 w-5 fill-amber-400 text-amber-400" />
                          )}

                          {/* Kana character */}
                          <span
                            className={cn(
                              "text-2xl font-bold",
                              mastered && "text-amber-700 dark:text-amber-400"
                            )}
                          >
                            {char.kana}
                          </span>

                          {/* Romaji */}
                          <span
                            className={cn(
                              "text-xs",
                              mastered
                                ? "text-amber-600 dark:text-amber-500"
                                : "text-muted-foreground group-hover:text-primary"
                            )}
                          >
                            {char.romaji}
                          </span>

                          {/* Progress count tooltip */}
                          {!loading && count > 0 && !mastered && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
