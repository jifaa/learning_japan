import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/fade-in";
import { Search as SearchIcon, BookOpen, FileText, BrainCircuit } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { searchAll, type SearchResults } from "@/lib/content-search";
import Link from "next/link";

export const metadata: Metadata = { title: "Cari" };

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const query = params.q || "";

  let results: SearchResults = { vocabulary: [], kanji: [], grammar: [] };
  if (query.length >= 2) {
    results = await searchAll(query, 20);
  }

  const totalResults = results.vocabulary.length + results.kanji.length + results.grammar.length;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Cari</h1>
          <p className="text-sm text-muted-foreground">Temukan kosakata, kanji, dan tata bahasa</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <form method="get" action="/search" className="relative max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            placeholder="Ketik untuk mencari..."
            defaultValue={query}
            autoFocus
            className="pl-9"
          />
        </form>
      </FadeIn>

      {query.length >= 2 && (
        <FadeIn delay={0.1}>
          <p className="text-sm text-muted-foreground">
            {totalResults === 0 ? "Tidak ada hasil" : `${totalResults} hasil untuk "${query}"`}
          </p>
        </FadeIn>
      )}

      {query.length >= 2 && results.vocabulary.length > 0 && (
        <FadeIn delay={0.15}>
          <SectionHeader title="Kosakata" />
          <div className="mt-3 space-y-2">
            {results.vocabulary.map((v) => (
              <Card key={v.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{v.expression}</p>
                    {v.reading && <p className="text-sm text-muted-foreground">{v.reading}</p>}
                    <p className="text-sm text-muted-foreground truncate">{v.meaning_id || v.meaning_en}</p>
                  </div>
                  <Link href="/vocabulary" className="shrink-0">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>
      )}

      {query.length >= 2 && results.kanji.length > 0 && (
        <FadeIn delay={0.2}>
          <SectionHeader title="Kanji" />
          <div className="mt-3 space-y-2">
            {results.kanji.map((k) => (
              <Card key={k.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <span className="text-2xl font-semibold">{k.kanji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{k.meaning_id || k.meaning_en}</p>
                    <p className="text-sm text-muted-foreground">{k.onyomi_romaji || k.onyomi_katakana} / {k.kunyomi_romaji || k.kunyomi_hiragana}</p>
                  </div>
                  <Link href="/kanji" className="shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>
      )}

      {query.length >= 2 && results.grammar.length > 0 && (
        <FadeIn delay={0.25}>
          <SectionHeader title="Tata Bahasa" />
          <div className="mt-3 space-y-2">
            {results.grammar.map((g) => (
              <Card key={g.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{g.grammar_point}</p>
                    <p className="text-sm text-muted-foreground truncate">{g.meaning_id || g.meaning_en}</p>
                  </div>
                  <Link href="/grammar" className="shrink-0">
                    <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>
      )}

      {query.length === 0 && (
        <FadeIn delay={0.1}>
          <div className="py-12 text-center text-muted-foreground">
            <SearchIcon className="mx-auto h-10 w-10 opacity-30" />
            <p className="mt-3">Ketik untuk mencari kosakata, kanji, atau tata bahasa</p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
