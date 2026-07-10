"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion/fade-in";
import { Check, X, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type KanaQuestion = {
  id: string;
  kana: string;
  romaji: string;
  options: { romaji: string; isCorrect: boolean }[];
};

interface KanaQuizFlowProps {
  questions: KanaQuestion[];
  script: "hiragana" | "katakana";
  onBack: () => void;
}

export function KanaQuizFlow({ questions, script, onBack }: KanaQuizFlowProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [answersLog, setAnswersLog] = useState<{ kanaId: string; isCorrect: boolean }[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const startTimeRef = useRef(Date.now());

  const total = questions.length;
  const q = questions[current];

  // Stable onBack — forwarded from parent which already wraps in useCallback
  const handleBack = onBack;

  // Reset all quiz state for "Try Again"
  const resetQuiz = useCallback(() => {
    startTimeRef.current = Date.now();
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setCompleted(false);
    setAnswersLog([]);
    setRetryKey((k) => k + 1);
  }, []);

  if (total === 0) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <p>Tidak ada pertanyaan tersedia.</p>
          <Button onClick={handleBack}>Kembali</Button>
        </CardContent>
      </Card>
    );
  }

  const handleSelect = useCallback(
    (idx: number) => {
      if (answered) return;
      const isCorrect = q.options[idx].isCorrect;
      setSelected(idx);
      setAnswered(true);
      if (isCorrect) setScore((s) => s + 1);
      setAnswersLog((prev) => [...prev, { kanaId: q.id, isCorrect }]);
    },
    [answered, q]
  );

  const handleNext = useCallback(async () => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const response = await fetch("/api/kana/quiz/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: answersLog, script }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Gagal menyimpan jawaban (${response.status})`);
        }
      } catch (error) {
        console.error("Failed to submit quiz", error);
        setSubmitError(error instanceof Error ? error.message : "Gagal menyimpan jawaban");
      } finally {
        setIsSubmitting(false);
        setCompleted(true);
      }
    }
  }, [current, total, answersLog, script]);

  if (completed) {
    const pct = Math.round((score / total) * 100);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    return (
      <FadeIn>
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full",
                pct >= 80 ? "bg-success/10" : pct >= 50 ? "bg-warning/10" : "bg-error/10"
              )}
            >
              <p
                className={cn(
                  "text-3xl font-bold",
                  pct >= 80 ? "text-success" : pct >= 50 ? "text-warning" : "text-error"
                )}
              >
                {pct}%
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {pct >= 80 ? "Luar biasa!" : pct >= 50 ? "Bagus!" : "Tetap semangat!"}
              </h2>
              <p className="mt-1 text-muted-foreground">
                {score} dari {total} benar dalam {timeSeconds} detik
              </p>
            </div>
            {submitError && (
              <div className="w-full rounded-lg border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
                ⚠️ {submitError}
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={onBack} variant="outline">
                Selesai
              </Button>
              <Button
                onClick={resetQuiz}
              >
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Kembali
        </Button>
        <span className="text-sm text-muted-foreground">
          {current + 1}/{total}
        </span>
      </div>
      <ProgressBar value={current + 1} max={total} showValue={false} />
      
      <FadeIn key={`${retryKey}-${q.id}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">Pilih romaji yang benar untuk karakter ini:</p>
            <div className="text-8xl font-bold mb-8 text-primary">
              {q.kana}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {q.options.map((opt, idx) => {
                const isCorrect = opt.isCorrect;
                const isSelected = idx === selected;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-150 text-xl font-medium",
                      answered && isCorrect
                        ? "border-success bg-success/10 text-success"
                        : answered && isSelected && !isCorrect
                          ? "border-error bg-error/10 text-error"
                          : "border-border hover:border-primary/50 hover:bg-surface",
                      answered ? "cursor-default" : "cursor-pointer"
                    )}
                  >
                    {answered && isCorrect && <Check className="h-5 w-5" />}
                    {answered && isSelected && !isCorrect && <X className="h-5 w-5" />}
                    {opt.romaji}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {answered && (
        <FadeIn>
          <div className="flex justify-end mt-6">
            <Button onClick={handleNext} disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {current < total - 1 ? "Lanjut" : "Selesaikan Kuis"}{" "}
              {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
