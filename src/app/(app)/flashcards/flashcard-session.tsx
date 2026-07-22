"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { reviewFlashcardAction } from "@/server/actions/flashcard.actions";
import type { SRSCard, SRSRating } from "@/types/srs";
import type { Vocabulary, KanjiCharacter, GrammarPoint } from "@/types/content";
import { RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewSessionProps {
  cards: SRSCard[];
  contentMap: Record<string, Vocabulary | KanjiCharacter | GrammarPoint | null>;
  onComplete: () => void;
}

const RATING_LABELS: Record<SRSRating, string> = {
  again: "Ulangi",
  hard: "Sulit",
  good: "Baik",
  easy: "Mudah",
};

const RATING_COLORS: Record<SRSRating, string> = {
  again: "border-error text-error hover:bg-error/10",
  hard: "border-warning text-warning hover:bg-warning/10",
  good: "border-primary text-primary hover:bg-primary/10",
  easy: "border-success text-success hover:bg-success/10",
};

export function ReviewSession({ cards, contentMap, onComplete }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(0);

  const currentCard = cards[currentIndex];
  const content = currentCard ? contentMap[currentCard.content_id] : null;
  const totalCards = cards.length;

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const handleRate = useCallback(async (rating: SRSRating) => {
    if (!currentCard || isLoading) return;
    setIsLoading(true);
    const startTime = startTimeRef.current || Date.now();
    const timeTakenMs = Date.now() - startTime;
    const result = await reviewFlashcardAction(currentCard.id, rating, timeTakenMs);
    if (result.success) {
      setReviewed((r) => r + 1);
      if (currentIndex < totalCards - 1) {
        setIsFlipped(false);
        setCurrentIndex((i) => i + 1);
      } else {
        setIsComplete(true);
      }
    }
    setIsLoading(false);
  }, [currentCard, isLoading, currentIndex, totalCards]);

  if (isComplete) {
    return (
      <FadeIn>
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Sesi Selesai!</h2>
              <p className="mt-1 text-muted-foreground">Anda telah meninja {reviewed} kartu</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={onComplete} variant="outline">Kembali</Button>
              <Button onClick={() => window.location.reload()}>
                <RotateCcw className="mr-2 h-4 w-4" />Mulai Ulang
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  if (!currentCard || !content) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-muted-foreground">Tidak ada kartu untuk ditinjau.</p>
          <Button onClick={onComplete}>Kembali</Button>
        </CardContent>
      </Card>
    );
  }

  const isVocabulary = "expression" in content;
  const isKanji = "kanji" in content && !isVocabulary;
  const isGrammar = "grammar_point" in content;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Kartu {currentIndex + 1} dari {totalCards}</span>
        <span>{reviewed} ditinjau</span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }} />
      </div>

      <FadeIn key={currentCard.id}>
        <div className="mx-auto max-w-md">
          <div
            className={cn(
              "relative min-h-[280px] cursor-pointer rounded-xl border-2 bg-card p-8 text-center transition-all duration-300",
              isFlipped ? "border-primary shadow-md" : "border-border"
            )}
            onClick={handleFlip}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === " " && handleFlip()}
            aria-label={isFlipped ? "Balik kartu" : "Tunjukkan jawaban"}
          >
            <div className={cn("flex flex-col items-center justify-center gap-2 transition-opacity duration-200", isFlipped ? "opacity-0" : "opacity-100")}>
              {isVocabulary && (
                <>
                  <p className="text-5xl font-semibold">{content.expression}</p>
                  {content.reading && <p className="text-lg text-muted-foreground">{content.reading}</p>}
                  <p className="mt-2 text-sm text-muted-foreground">Ketuk untuk melihat arti</p>
                </>
              )}
              {isKanji && (
                <>
                  <p className="text-5xl font-semibold">{(content as any).kanji || (content as any).character}</p>
                  <p className="text-sm text-muted-foreground">
                    {(content as any).onyomi_romaji || (content as any).onyomi_katakana} / {(content as any).kunyomi_hiragana || (content as any).kunyomi_romaji}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Ketuk untuk melihat arti</p>
                </>
              )}
              {isGrammar && (
                <>
                  <p className="text-3xl font-semibold">{content.grammar_point}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Ketuk untuk melihat penjelasan</p>
                </>
              )}
            </div>

            <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 transition-opacity duration-200", isFlipped ? "opacity-100" : "opacity-0")}>
              {isVocabulary && (
                <>
                  <p className="text-3xl font-semibold">{content.expression}</p>
                  <p className="text-lg">{content.meaning_id || content.meaning_en}</p>
                </>
              )}
              {isKanji && (
                <>
                  <p className="text-5xl font-semibold">{(content as any).kanji || (content as any).character}</p>
                  <p className="text-lg">{(content as any).meaning_id || (content as any).meaning_en}</p>
                  <p className="text-sm text-muted-foreground">{(content as any).example_word} ({(content as any).example_reading})</p>
                </>
              )}
              {isGrammar && (
                <>
                  <p className="text-xl font-semibold">{content.grammar_point}</p>
                  <p className="text-lg">{content.meaning_id || content.meaning_en}</p>
                  {content.example_jp && <p className="text-sm text-muted-foreground">{content.example_jp}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      {isFlipped && (
        <FadeIn>
          <div className="flex flex-wrap justify-center gap-2">
            {(Object.keys(RATING_LABELS) as SRSRating[]).map((rating) => (
              <Button key={rating} variant="outline" onClick={() => handleRate(rating)} disabled={isLoading}
                className={cn("min-w-[80px]", RATING_COLORS[rating])}>
                {RATING_LABELS[rating]}
              </Button>
            ))}
          </div>
        </FadeIn>
      )}

      {!isFlipped && (
        <div className="text-center">
          <Button variant="outline" onClick={handleFlip} className="mx-auto">Tunjukkan Jawaban</Button>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">
        Tekan <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">Spasi</kbd> untuk balik kartu
      </div>
    </div>
  );
}
