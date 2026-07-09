"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion/fade-in";
import { Layers, Play, RefreshCw, BookOpen } from "lucide-react";
import { ReviewSession } from "./flashcard-session";
import { addToSRSContentAction } from "@/server/actions/srs.actions";
import type { SRSCard } from "@/types/srs";

interface DeckInfo {
  id: string;
  title: string;
  desc: string;
  total: number;
  due: number;
  newCards: number;
}

interface FlashcardsClientProps {
  dueCards: SRSCard[];
  newCards: SRSCard[];
  totalDue: number;
  reviewedToday: number;
  retentionRate: number;
  decks: DeckInfo[];
  contentMap: Record<string, any>;
}

export function FlashcardsClient({ dueCards, newCards, totalDue, reviewedToday, retentionRate, decks, contentMap }: FlashcardsClientProps) {
  const [sessionCards, setSessionCards] = useState<SRSCard[] | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const startSession = (deckId?: string) => {
    let cards = [...dueCards];
    if (!deckId || deckId === "new") {
      cards = [...newCards, ...dueCards.filter((c) => c.state !== "new")].slice(0, 50);
    }
    setSessionCards(cards);
  };

  const initializeDeck = async (deckId: string, vocabIds: string[]) => {
    if (vocabIds.length === 0) return;
    setIsInitializing(true);
    await addToSRSContentAction(vocabIds, "vocabulary", deckId);
    // Page will revalidate via server action
    setIsInitializing(false);
    window.location.reload();
  };

  if (sessionCards) {
    return (
      <div className="mx-auto max-w-lg">
        <ReviewSession cards={sessionCards} contentMap={contentMap} onComplete={() => setSessionCards(null)} />
      </div>
    );
  }

  const DAILY_GOAL = 20;
  const hasNoCards = decks.every(d => d.total === 0);

  return (
    <>
      {hasNoCards && (
        <FadeIn>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Mulai Perjalanan Belajar</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tambahkan kosakata ke kartu latihan untuk memulai belajar dengan sistem repetisi.
                </p>
              </div>
              <Button
                onClick={() => initializeDeck("vocabulary", decks.find(d => d.id === "vocabulary")?.desc ? [] : [])}
                disabled={isInitializing}
                className="shrink-0"
              >
                {isInitializing ? "Menambahkan..." : "Mulai Kosakata"}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <FadeIn delay={hasNoCards ? 0.1 : 0}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="p-5 text-center">
            <p className="text-3xl font-semibold text-primary">{totalDue}</p>
            <p className="mt-1 text-sm text-muted-foreground">Kartu Jatuh Tempo</p>
          </CardContent></Card>
          <Card><CardContent className="p-5 text-center">
            <p className="text-3xl font-semibold">{newCards.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Kartu Baru</p>
          </CardContent></Card>
          <Card><CardContent className="p-5 text-center">
            <p className="text-3xl font-semibold">{retentionRate}%</p>
            <p className="mt-1 text-sm text-muted-foreground">Tingkat Retensi</p>
          </CardContent></Card>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Button size="lg" className="w-full sm:w-auto" onClick={() => startSession()} disabled={totalDue === 0}>
          <Play className="mr-2 h-5 w-5" />
          {totalDue > 0 ? "Mulai Sesi Belajar" : "Tidak ada kartu jatuh tempo"}
        </Button>
      </FadeIn>

      <FadeIn delay={0.15}>
        <SectionHeader title="Dek Anda" description="Kartu ditinjau berdasarkan topik" />
        <div className="mt-4 space-y-3">
          {decks.map((deck, i) => (
            <FadeIn key={deck.id} delay={0.15 + i * 0.05}>
              <Card className="transition-shadow duration-150 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <h3 className="font-medium">{deck.title}</h3>
                    <p className="text-sm text-muted-foreground">{deck.desc}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-sm font-medium">{deck.due} jatuh tempo</p>
                    <p className="text-xs text-muted-foreground">{deck.newCards} baru</p>
                  </div>
                  {deck.total === 0 ? (
                    <Button size="sm" variant="outline" onClick={() => initializeDeck(deck.id, [])} disabled={isInitializing}>
                      {isInitializing ? "..." : "Tambah"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startSession(deck.id)}>
                      <RefreshCw className="mr-1 h-3 w-3" />Tinjau
                    </Button>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.35}>
        <SectionHeader title="Progres Hari Ini" />
        <div className="mt-4">
          <Card><CardContent className="p-5 space-y-4">
            <ProgressBar value={reviewedToday} max={DAILY_GOAL} label="Kartu Ditinjau" size="lg" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Target harian</span>
              <span className="font-medium">{reviewedToday >= DAILY_GOAL ? "Target tercapai!" : reviewedToday + "/" + DAILY_GOAL + " kartu"}</span>
            </div>
          </CardContent></Card>
        </div>
      </FadeIn>
    </>
  );
}
