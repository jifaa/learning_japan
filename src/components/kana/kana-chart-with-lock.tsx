"use client";

import { useState } from "react";
import Link from "next/link";
import { Volume2, Lock, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

interface CharRow {
  label: string;
  chars: { character: string; romaji: string; href: string }[];
}

interface KanaCategoryData {
  categoryId: string;
  title: string;
  isLocked: boolean;
  progressPercent: number; // 0–100, for failure state check
  groups: CharRow[];
}

interface Props {
  categories: KanaCategoryData[];
  script: "hiragana" | "katakana";
  quizAttempts?: number; // total quiz attempts for this script
}

export function KanaChartWithLock({ categories, script, quizAttempts = 0 }: Props) {
  const [expandedLocked, setExpandedLocked] = useState<Set<string>>(new Set());

  const toggleLocked = (categoryId: string) => {
    setExpandedLocked((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Failure state: first unlocked category at 0% after at least one attempt
  const currentUnlocked = categories.find((c) => !c.isLocked);
  const showFailureState = quizAttempts > 0 && currentUnlocked && currentUnlocked.progressPercent === 0;

  return (
    <>
      {showFailureState && (
        <FadeIn delay={0.05}>
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Still struggling?
              </p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                Practice with flashcards first to build familiarity, then try the quiz again.
              </p>
              <Link
                href="/flashcards"
                className="mt-1.5 inline-block text-xs font-medium text-amber-700 underline dark:text-amber-300"
              >
                Go to flashcards →
              </Link>
            </div>
          </div>
        </FadeIn>
      )}

      {categories.map((cat, catIdx) => (
        <FadeIn key={cat.categoryId} delay={0.1 + catIdx * 0.05}>
          {cat.isLocked ? (
            // Locked category — collapsible, grayed out, no links
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat.title}
                </h3>
              </div>
              <div
                className="rounded-lg border border-border bg-muted/30 p-4"
                aria-label={`${cat.title} terkunci`}
              >
                <p className="mb-3 text-sm text-muted-foreground">
                  Selesaikan quiz{" "}
                  <Link
                    href={`/${script}/quiz`}
                    className="font-medium text-primary underline"
                  >
                    {cat.title}
                  </Link>{" "}
                  untuk unlock.
                </p>
                {/* Collapsed: show locked indicator row */}
                {!expandedLocked.has(cat.categoryId) ? (
                  <button
                    type="button"
                    onClick={() => toggleLocked(cat.categoryId)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-muted/20 py-3 text-xs text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/30"
                    aria-expanded={false}
                    aria-controls={`locked-grid-${cat.categoryId}`}
                  >
                    <span>Lihat karakter terkunci</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <>
                    {/* Expanded: show the grid */}
                    <div
                      id={`locked-grid-${cat.categoryId}`}
                      className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12"
                    >
                      {cat.groups.flatMap((group) =>
                        group.chars.map((char) => (
                          <div
                            key={char.character}
                            className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border border-border bg-muted/50 p-3 opacity-40"
                          >
                            <span className="text-xl font-semibold text-muted-foreground sm:text-2xl">
                              {char.character}
                            </span>
                            <span className="mt-0.5 text-xs text-muted-foreground">
                              {char.romaji}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleLocked(cat.categoryId)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      aria-expanded={true}
                      aria-controls={`locked-grid-${cat.categoryId}`}
                    >
                      <span>Tutup</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            // Unlocked category — full interactive
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat.title}
                </h3>
              </div>
              <div className="space-y-3">
                {cat.groups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </p>
                    {/* Grid layout for unlocked characters */}
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                      {group.chars.map((char) => (
                        <Link
                          key={char.character}
                          href={char.href}
                          className={cn(
                            "group flex aspect-square w-full flex-col items-center justify-center rounded-lg border border-border bg-background p-3 transition-all",
                            "hover:border-primary hover:shadow-sm"
                          )}
                        >
                          <span className="text-xl font-semibold sm:text-2xl">
                            {char.character}
                          </span>
                          <span className="mt-0.5 text-xs text-muted-foreground group-hover:text-primary sm:mt-1">
                            {char.romaji}
                          </span>
                          <Volume2 className="mt-1 h-3 w-3 text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100" aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FadeIn>
      ))}
    </>
  );
}
