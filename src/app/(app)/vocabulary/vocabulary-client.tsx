"use client";
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Volume2, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { addToSRSContentSingleAction } from "@/server/actions/srs.actions";
import type { Vocabulary } from "@/types/content";

const ITEMS_PER_PAGE = 20;

interface VocabularyClientProps {
  words: Vocabulary[];
  vocabInSRS: Set<string>;
}

export function VocabularyClient({ words, vocabInSRS }: VocabularyClientProps) {
  const [query, setQuery] = useState("");
  const [filterPos, setFilterPos] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [addingId, setAddingId] = useState<string | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleAddToSRS = useCallback(async (word: Vocabulary) => {
    if (addingId) return;
    setAddingId(word.id);
    await addToSRSContentSingleAction(word.id, "vocabulary", "vocabulary");
    setAddingId(null);
  }, [addingId]);

  const partOfSpeechOptions = useMemo(() => {
    const pos = new Set(words.map(w => w.part_of_speech).filter((p): p is string => p !== null));
    return ["all", ...Array.from(pos)];
  }, [words]);

  const filtered = useMemo(() => {
    return words.filter(w => {
      const matchesQuery = !query
        || w.expression.includes(query)
        || (w.reading && w.reading.includes(query))
        || (w.romaji && w.romaji.toLowerCase().includes(query.toLowerCase()))
        || (w.meaning_id && w.meaning_id.toLowerCase().includes(query.toLowerCase()))
        || (w.meaning_en && w.meaning_en.toLowerCase().includes(query.toLowerCase()));
      const matchesPos = filterPos === "all" || w.part_of_speech === filterPos;
      return matchesQuery && matchesPos;
    });
  }, [words, query, filterPos]);

  // Reset to page 1 when filter changes
  const handleFilterChange = useCallback((value: string) => {
    setFilterPos(value);
    setPage(1);
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setPage(1);
  }, []);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const startItem = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, filtered.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Cari kosakata..."
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          value={filterPos}
          onChange={e => handleFilterChange(e.target.value)}
        >
          {partOfSpeechOptions.map(pos => (
            <option key={pos} value={pos}>
              {pos === "all" ? "Semua" : pos}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? "Tidak ada hasil"
            : `${startItem}–${endItem} dari ${filtered.length} kata`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((word) => {
          const isInSRS = vocabInSRS.has(word.id);
          const isAdding = addingId === word.id;

          return (
            <Card key={word.id} className="transition-shadow duration-150 hover:shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-semibold truncate">{word.expression}</p>
                      <button
                        onClick={() => word.reading && speak(word.reading)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
                        aria-label="Dengarkan"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    {word.reading && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground">{word.reading}</p>
                        {word.romaji && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <p className="text-sm text-muted-foreground">{word.romaji}</p>
                          </>
                        )}
                      </div>
                    )}
                    {!word.reading && word.romaji && (
                      <p className="text-sm text-muted-foreground">{word.romaji}</p>
                    )}
                    <p className="mt-1 text-sm">{word.meaning_id || word.meaning_en}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {word.part_of_speech && (
                        <span className="inline-block rounded bg-surface px-2 py-0.5 text-xs text-muted-foreground">
                          {word.part_of_speech}
                        </span>
                      )}
                      {isInSRS && (
                        <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          <Layers className="h-3 w-3" /> Di kartu latihan
                        </span>
                      )}
                    </div>
                  </div>
                  {!isInSRS && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToSRS(word)}
                      disabled={isAdding}
                      className="shrink-0"
                    >
                      {isAdding ? "..." : "+"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p>Tidak ada kosakata yang cocok dengan pencarian.</p>
        </div>
      )}
    </div>
  );
}
