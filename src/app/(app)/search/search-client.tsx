"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search as SearchIcon,
  X,
  BookOpen,
  FileText,
  BrainCircuit,
  Volume2,
  Sparkles,
  Loader2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import type {
  SearchResults,
  SearchVocab,
  SearchKanji,
  SearchGrammar,
  SearchKana,
} from "@/lib/content-search";

interface SearchClientProps {
  initialQuery?: string;
  initialResults?: SearchResults;
}

type CategoryTab = "all" | "vocabulary" | "kanji" | "grammar" | "kana";

type SelectedItem =
  | { type: "vocabulary"; data: SearchVocab }
  | { type: "kanji"; data: SearchKanji }
  | { type: "grammar"; data: SearchGrammar }
  | { type: "kana"; data: SearchKana }
  | null;

const QUICK_SEARCHES = [
  { label: "猫 (neko)", query: "猫" },
  { label: "日 (Kanji 日)", query: "日" },
  { label: "食べる (taberu)", query: "食べる" },
  { label: "です (Tata Bahasa)", query: "です" },
  { label: "Huruf Ka (か)", query: "か" },
  { label: "N5 Kosakata", query: "N5" },
];

export function SearchClient({
  initialQuery = "",
  initialResults = { vocabulary: [], kanji: [], grammar: [], kana: [] },
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>(initialResults);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("all");
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  const isFirstMount = useRef(true);

  // Function to handle Japanese Text-To-Speech
  const playTTS = useCallback((text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Fetch search results from API
  const performSearch = useCallback(async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults({ vocabulary: [], kanji: [], grammar: [], kana: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Failed to perform search:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync URL and trigger search with debounce
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (initialQuery && initialResults.vocabulary.length === 0 && initialResults.kanji.length === 0) {
        performSearch(initialQuery);
      }
      return;
    }

    const timer = setTimeout(() => {
      const trimmed = query.trim();
      const newUrl = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
      window.history.replaceState(null, "", newUrl);
      performSearch(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, performSearch, initialQuery, initialResults]);

  const handleClear = () => {
    setQuery("");
    setResults({ vocabulary: [], kanji: [], grammar: [], kana: [] });
    window.history.replaceState(null, "", "/search");
  };

  const handleSelectQuickSearch = (q: string) => {
    setQuery(q);
  };

  const totalResults =
    results.vocabulary.length +
    results.kanji.length +
    results.grammar.length +
    results.kana.length;

  const showVocab = activeCategory === "all" || activeCategory === "vocabulary";
  const showKanji = activeCategory === "all" || activeCategory === "kanji";
  const showGrammar = activeCategory === "all" || activeCategory === "grammar";
  const showKana = activeCategory === "all" || activeCategory === "kana";

  const hasResultsForCategory =
    (showVocab && results.vocabulary.length > 0) ||
    (showKanji && results.kanji.length > 0) ||
    (showGrammar && results.grammar.length > 0) ||
    (showKana && results.kana.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Cari</h1>
          <p className="text-sm text-muted-foreground">
            Temukan kosakata, kanji, tata bahasa, dan hiragana/katakana
          </p>
        </div>
      </FadeIn>

      {/* Input Search Box */}
      <FadeIn delay={0.05}>
        <div className="relative max-w-xl">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari kanji, kosakata (romaji/arti/kanji), tata bahasa, atau kana..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="h-11 pl-10 pr-10 text-sm shadow-sm"
          />
          {isLoading ? (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
              aria-label="Hapus kata kunci"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </FadeIn>

      {/* Category Tabs & Total Summary */}
      {query.trim().length > 0 && (
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("all")}
              className="rounded-full text-xs"
            >
              Semua ({totalResults})
            </Button>
            <Button
              variant={activeCategory === "vocabulary" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("vocabulary")}
              className="rounded-full text-xs"
            >
              Kosakata ({results.vocabulary.length})
            </Button>
            <Button
              variant={activeCategory === "kanji" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("kanji")}
              className="rounded-full text-xs"
            >
              Kanji ({results.kanji.length})
            </Button>
            <Button
              variant={activeCategory === "grammar" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("grammar")}
              className="rounded-full text-xs"
            >
              Tata Bahasa ({results.grammar.length})
            </Button>
            <Button
              variant={activeCategory === "kana" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("kana")}
              className="rounded-full text-xs"
            >
              Kana ({results.kana.length})
            </Button>
          </div>
        </FadeIn>
      )}

      {/* Query empty -> Suggestions */}
      {!query.trim() && (
        <FadeIn delay={0.1}>
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Saran Kata Kunci Pencarian</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSelectQuickSearch(item.query)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              Tip: Anda dapat mengetik kata dalam bahasa Indonesia ("kucing"), Kanji ("猫"), Hiragana ("ねこ"), Romaji ("neko"), atau pola grammar ("desu").
            </div>
          </div>
        </FadeIn>
      )}

      {/* No results message */}
      {query.trim().length > 0 && !isLoading && totalResults === 0 && (
        <FadeIn delay={0.15}>
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <SearchIcon className="mx-auto h-10 w-10 opacity-30" />
            <p className="text-base font-medium">Tidak ada hasil untuk "{query}"</p>
            <p className="text-xs">Coba periksa ejaan kata kunci atau cari dengan arti bahasa Indonesia/Romaji lain.</p>
          </div>
        </FadeIn>
      )}

      {/* Search Results Sections */}
      {query.trim().length > 0 && hasResultsForCategory && (
        <div className="space-y-8">
          {/* Kosakata Section */}
          {showVocab && results.vocabulary.length > 0 && (
            <FadeIn delay={0.15}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold">Kosakata ({results.vocabulary.length})</h2>
                  </div>
                  <Link href="/vocabulary" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Lihat semua kosakata <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.vocabulary.map((v) => (
                    <Card
                      key={v.id}
                      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                      onClick={() => setSelectedItem({ type: "vocabulary", data: v })}
                    >
                      <CardContent className="p-3.5 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold text-foreground">{v.expression}</span>
                            {v.reading && v.reading !== v.expression && (
                              <span className="text-xs text-muted-foreground font-mono">({v.reading})</span>
                            )}
                            {v.jlpt_level && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                {v.jlpt_level}
                              </span>
                            )}
                          </div>
                          {v.romaji && <p className="text-xs text-muted-foreground italic mt-0.5">{v.romaji}</p>}
                          <p className="text-sm font-medium text-foreground/90 mt-1 line-clamp-1">
                            {v.meaning_id || v.meaning_en}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playTTS(v.expression);
                          }}
                          className="shrink-0 p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Putar Pengucapan"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Kanji Section */}
          {showKanji && results.kanji.length > 0 && (
            <FadeIn delay={0.2}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold">Kanji ({results.kanji.length})</h2>
                  </div>
                  <Link href="/kanji" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Lihat semua kanji <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.kanji.map((k) => (
                    <Card
                      key={k.id}
                      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                      onClick={() => setSelectedItem({ type: "kanji", data: k })}
                    >
                      <CardContent className="p-3.5 flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
                          {k.kanji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate">{k.meaning_id || k.meaning_en}</span>
                            {k.jlpt_level && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary shrink-0">
                                {k.jlpt_level}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Onyomi: {k.onyomi_katakana || k.onyomi_romaji || "-"} | Kunyomi: {k.kunyomi_hiragana || k.kunyomi_romaji || "-"}
                          </p>
                          {k.stroke_count && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{k.stroke_count} goresan</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Grammar Section */}
          {showGrammar && results.grammar.length > 0 && (
            <FadeIn delay={0.25}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold">Tata Bahasa ({results.grammar.length})</h2>
                  </div>
                  <Link href="/grammar" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Lihat tata bahasa <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.grammar.map((g) => (
                    <Card
                      key={g.id}
                      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                      onClick={() => setSelectedItem({ type: "grammar", data: g })}
                    >
                      <CardContent className="p-3.5 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-foreground text-base">{g.grammar_point}</span>
                          {g.jlpt_level && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary shrink-0">
                              {g.jlpt_level}
                            </span>
                          )}
                        </div>
                        {g.structure_pattern && (
                          <p className="text-xs font-mono text-muted-foreground">{g.structure_pattern}</p>
                        )}
                        <p className="text-sm font-medium text-foreground/90 line-clamp-1">
                          {g.meaning_id || g.meaning_en}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Kana Section */}
          {showKana && results.kana.length > 0 && (
            <FadeIn delay={0.3}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold">Kana Hiragana / Katakana ({results.kana.length})</h2>
                  </div>
                  <Link href="/hiragana" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Tabel Kana <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {results.kana.map((kn) => (
                    <Card
                      key={kn.id}
                      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                      onClick={() => setSelectedItem({ type: "kana", data: kn })}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-xl font-bold text-foreground">
                          {kn.kana}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm capitalize">{kn.romaji}</p>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {kn.script}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playTTS(kn.kana);
                          }}
                          className="ml-auto shrink-0 p-1.5 text-muted-foreground hover:text-primary"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      )}

      {/* Item Detail Modal Dialog */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Detail {selectedItem.type}
                </span>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {selectedItem.type === "vocabulary" && selectedItem.data.expression}
                  {selectedItem.type === "kanji" && selectedItem.data.kanji}
                  {selectedItem.type === "grammar" && selectedItem.data.grammar_point}
                  {selectedItem.type === "kana" && selectedItem.data.kana}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body depending on type */}
            {selectedItem.type === "vocabulary" && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {selectedItem.data.reading && (
                      <p className="text-base text-foreground/80 font-medium">
                        Cara Baca: <span className="font-mono text-primary">{selectedItem.data.reading}</span>
                      </p>
                    )}
                    {selectedItem.data.romaji && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">Romaji: {selectedItem.data.romaji}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => playTTS(selectedItem.data.expression)}
                    className="flex items-center gap-1.5"
                  >
                    <Volume2 className="h-4 w-4" /> Dengarkan
                  </Button>
                </div>

                <div className="rounded-xl bg-surface p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground">Arti Bahasa Indonesia:</p>
                  <p className="text-base font-semibold text-foreground mt-0.5">
                    {selectedItem.data.meaning_id || selectedItem.data.meaning_en}
                  </p>
                  {selectedItem.data.part_of_speech && (
                    <span className="inline-block mt-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium capitalize">
                      {selectedItem.data.part_of_speech}
                    </span>
                  )}
                </div>

                {selectedItem.data.example_sentence_jp && (
                  <div className="rounded-xl border border-border/80 p-3.5 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Contoh Kalimat:</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.data.example_sentence_jp}</p>
                    {selectedItem.data.example_sentence_romaji && (
                      <p className="text-xs text-muted-foreground italic">{selectedItem.data.example_sentence_romaji}</p>
                    )}
                    {selectedItem.data.example_sentence_id && (
                      <p className="text-xs text-foreground/80">{selectedItem.data.example_sentence_id}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedItem.type === "kanji" && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl font-bold text-primary">
                    {selectedItem.data.kanji}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      {selectedItem.data.meaning_id || selectedItem.data.meaning_en}
                    </p>
                    {selectedItem.data.jlpt_level && (
                      <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary mt-1">
                        JLPT {selectedItem.data.jlpt_level}
                      </span>
                    )}
                    {selectedItem.data.stroke_count && (
                      <p className="text-xs text-muted-foreground mt-1">{selectedItem.data.stroke_count} goresan</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface p-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Onyomi (Katakana):</p>
                    <p className="text-sm font-medium">{selectedItem.data.onyomi_katakana || selectedItem.data.onyomi_romaji || "-"}</p>
                  </div>
                  <div className="rounded-xl bg-surface p-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Kunyomi (Hiragana):</p>
                    <p className="text-sm font-medium">{selectedItem.data.kunyomi_hiragana || selectedItem.data.kunyomi_romaji || "-"}</p>
                  </div>
                </div>

                {selectedItem.data.example_word && (
                  <div className="rounded-xl border border-border/80 p-3.5 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Contoh Penggunaan Kata:</p>
                    <p className="text-sm font-bold text-foreground">{selectedItem.data.example_word}</p>
                    {selectedItem.data.example_meaning_id && (
                      <p className="text-xs text-muted-foreground">{selectedItem.data.example_meaning_id}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedItem.type === "grammar" && (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-lg font-bold text-foreground">{selectedItem.data.grammar_point}</p>
                  {selectedItem.data.structure_pattern && (
                    <p className="text-xs font-mono text-primary mt-1 bg-primary/5 p-2 rounded-lg border border-primary/20">
                      Pola: {selectedItem.data.structure_pattern}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-surface p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground">Arti / Penggunaan:</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {selectedItem.data.meaning_id || selectedItem.data.meaning_en}
                  </p>
                </div>

                {selectedItem.data.example_jp && (
                  <div className="rounded-xl border border-border/80 p-3.5 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Contoh Kalimat:</p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.data.example_jp}</p>
                    {selectedItem.data.example_meaning_id && (
                      <p className="text-xs text-muted-foreground">{selectedItem.data.example_meaning_id}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedItem.type === "kana" && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-bold text-primary">
                    {selectedItem.data.kana}
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground capitalize">Romaji: {selectedItem.data.romaji}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Jenis: {selectedItem.data.script}</p>
                    <p className="text-xs text-muted-foreground">Kategori: {selectedItem.data.category}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => playTTS(selectedItem.data.kana)}
                    className="ml-auto flex items-center gap-1.5"
                  >
                    <Volume2 className="h-4 w-4" /> Suara
                  </Button>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                Tutup
              </Button>
              <Button
                size="sm"
                asChild
              >
                <Link
                  href={
                    selectedItem.type === "vocabulary"
                      ? "/vocabulary"
                      : selectedItem.type === "kanji"
                      ? "/kanji"
                      : selectedItem.type === "grammar"
                      ? "/grammar"
                      : "/hiragana"
                  }
                  className="flex items-center gap-1"
                >
                  Lihat di Modul <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
