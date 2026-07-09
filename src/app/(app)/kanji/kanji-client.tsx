"use client";
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/fade-in";
import { Volume2, Search, BookOpen } from "lucide-react";
import type { KanjiCharacter } from "@/types/content";

interface KanjiClientProps {
  kanjiList: KanjiCharacter[];
}

export function KanjiClient({ kanjiList }: KanjiClientProps) {
  const [query, setQuery] = useState("");

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return kanjiList;
    return kanjiList.filter(k =>
      k.kanji.includes(query) ||
      k.meaning_id?.includes(query) ||
      k.meaning_en?.includes(query) ||
      k.onyomi_romaji?.includes(query) ||
      k.kunyomi_romaji?.includes(query)
    );
  }, [kanjiList, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari kanji..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} dari {kanjiList.length} karakter
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((k, i) => (
          <FadeIn key={k.id} delay={Math.min(i * 0.01, 0.3)}>
            <Card className="transition-shadow duration-150 hover:shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-semibold">{k.kanji}</p>
                    <button
                      onClick={() => speak(k.kanji)}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
                      aria-label="Dengarkan"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  </div>
                  {k.stroke_count && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {k.stroke_count} goresan
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium">{k.meaning_id || k.meaning_en || "-"}</p>
                <div className="mt-2 space-y-0.5">
                  {(k.onyomi_romaji || k.onyomi_katakana) && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">On: </span>{k.onyomi_romaji || k.onyomi_katakana}
                    </p>
                  )}
                  {(k.kunyomi_romaji || k.kunyomi_hiragana) && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Kun: </span>{k.kunyomi_hiragana || k.kunyomi_romaji}
                    </p>
                  )}
                </div>
                {k.example_word && (
                  <div className="mt-2 flex items-center gap-1 rounded bg-surface px-2 py-1">
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs">
                      {k.example_word}
                      {k.example_reading && <span className="text-muted-foreground"> ({k.example_reading})</span>}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p>Tidak ada kanji yang cocok dengan pencarian.</p>
        </div>
      )}
    </div>
  );
}
