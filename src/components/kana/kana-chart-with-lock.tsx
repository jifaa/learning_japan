"use client";

import Link from "next/link";
import { Volume2, Lock } from "lucide-react";
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
  groups: CharRow[];
}

interface Props {
  categories: KanaCategoryData[];
  script: "hiragana" | "katakana";
}

export function KanaChartWithLock({ categories, script }: Props) {
  return (
    <>
      {categories.map((cat, catIdx) => (
        <FadeIn key={cat.categoryId} delay={0.1 + catIdx * 0.05}>
          {cat.isLocked ? (
            // Locked category — grayed out, no links
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
                <p className="text-sm text-muted-foreground">
                  Selesaikan quiz{" "}
                  <Link
                    href={`/${script}/quiz`}
                    className="font-medium text-primary underline"
                  >
                    {script === "hiragana" ? "Huruf Dasar" : "Huruf Biasa"}
                  </Link>{" "}
                  untuk unlock.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cat.groups.map((group) =>
                    group.chars.map((char) => (
                      <div
                        key={char.character}
                        className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-3 opacity-40"
                      >
                        <span className="text-2xl font-semibold text-muted-foreground">
                          {char.character}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {char.romaji}
                        </span>
                      </div>
                    ))
                  )}
                </div>
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
                    <div className="flex flex-wrap gap-2">
                      {group.chars.map((char) => (
                        <Link
                          key={char.character}
                          href={char.href}
                          className={cn(
                            "group flex flex-col items-center rounded-lg border border-border bg-background p-3 transition-all",
                            "hover:border-primary hover:shadow-sm"
                          )}
                        >
                          <span className="text-2xl font-semibold">
                            {char.character}
                          </span>
                          <span className="text-xs text-muted-foreground group-hover:text-primary">
                            {char.romaji}
                          </span>
                          <Volume2 className="mt-1 h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
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
