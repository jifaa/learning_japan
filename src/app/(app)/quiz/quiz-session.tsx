"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion/fade-in";
import { Check, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { completeQuizAction } from "@/server/actions/quiz.actions";
import type { QuizType } from "@/types/quiz";

interface QuizSessionProps {
  quizType: string;
  onBack: () => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const Q: Record<string, QuizQuestion[]> = {
  vocabulary: [
    { id: "v1", question: "Apa arti '猫' (neko)?", options: ["Anjing", "Kucing", "Burung", "Ikan"], correct: 1, explanation: "猫 = neko = kucing" },
    { id: "v2", question: "Apa arti '水' (mizu)?", options: ["Api", "Tanah", "Air", "Angin"], correct: 2, explanation: "水 = mizu = air" },
    { id: "v3", question: "Apa arti '火' (hi)?", options: ["Air", "Tanah", "Angin", "Api"], correct: 3, explanation: "火 = hi = api" },
    { id: "v4", question: "Apa arti '山' (yama)?", options: ["Sungai", "Laut", "Gunung", "Danau"], correct: 2, explanation: "山 = yama = gunung" },
    { id: "v5", question: "Apa arti '木' (ki)?", options: ["Batu", "Air", "Pohon", "Rumput"], correct: 2, explanation: "木 = ki = pohon" },
    { id: "v6", question: "Apa arti '人' (hito)?", options: ["Anjing", "Kucing", "Manusia", "Burung"], correct: 2, explanation: "人 = hito = manusia" },
    { id: "v7", question: "Apa arti '大' (ookii)?", options: ["Kecil", "Besar", "Tinggi", "Rendah"], correct: 1, explanation: "大 = ookii = besar" },
    { id: "v8", question: "Apa arti '小' (chiisai)?", options: ["Besar", "Kecil", "Panjang", "Pendek"], correct: 1, explanation: "小 = chiisai = kecil" },
    { id: "v9", question: "Apa arti '日' (hi)?", options: ["Bulan", "Matahari/Hari", "Bintang", "Langit"], correct: 1, explanation: "日 = hi = matahari/hari" },
    { id: "v10", question: "Apa arti '月' (tsuki)?", options: ["Matahari", "Bulan", "Bintang", "Langit"], correct: 1, explanation: "月 = tsuki = bulan" },
  ],
  grammar: [
    { id: "g1", question: "Pola '私は~です' berarti?", options: ["Saya suka~", "Saya adalah~", "Saya pergi~", "Saya punya~"], correct: 1, explanation: "~です adalah pola konfirmasi sopan" },
    { id: "g2", question: "Partikel 'は' dalam '私は...' dibaca?", options: ["ha", "wa", "ka", "ba"], correct: 1, explanation: "は sebagai partikel dibaca 'wa'" },
    { id: "g3", question: "Pola否定 adalah?", options: ["分", "泳", "飲", "否"], correct: 3, explanation: "否 = penolakan, negatif" },
    { id: "g4", question: "Pola '~ない' menunjukkan?", options: ["Lampau", "Sekarang", "Negatif", "Future"], correct: 2, explanation: "~ない = bentuk negatif" },
    { id: "g5", question: "'ます' bentuk dasar dari?", options: ["飲む", "飲め", "飲も", "飲ま"], correct: 0, explanation: "飲む (nomu = minum) + ます = 飲みます" },
    { id: "g6", question: "Pola '~可以吗?' arti?", options: ["Tolong~", "Boleh~", "Harus~", "Jangan~"], correct: 1, explanation: "可以 = boleh/dapat" },
    { id: "g7", question: "Partikel 'を' fungsinya?", options: ["Subjek", "Objek", "Tempat", "Waktu"], correct: 1, explanation: "を menandai objek" },
    { id: "g8", question: "Pola '何ですか' artinya?", options: ["Siapa ini?", "Di mana?", "Apa ini?", "Kapan?"], correct: 2, explanation: "何 (nani) = apa" },
    { id: "g9", question: "Bentuk sopan dari '食べる' (taberu)?", options: ["食べります", "食べます", "食べるます", "食用です"], correct: 1, explanation: "taberu + ます = tabemasu" },
    { id: "g10", question: "'ありがとうございます' artinya?", options: ["Selamat pagi", "Selamat malam", "Terima kasih", "Maaf"], correct: 2, explanation: "ありがとうございます = Terima kasih banyak" },
  ],
  kanji: [
    { id: "k1", question: "Kanji apa yang artinya 'air'?", options: ["火", "水", "木", "土"], correct: 1, explanation: "水 = mizu = air" },
    { id: "k2", question: "Kanji apa yang artinya 'api'?", options: ["水", "火", "風", "雷"], correct: 1, explanation: "火 = hi = api" },
    { id: "k3", question: "Kanji apa yang artinya 'gunung'?", options: ["川", "山", "海", "森"], correct: 1, explanation: "山 = yama = gunung" },
    { id: "k4", question: "Kanji apa yang artinya 'pohon'?", options: ["木", "林", "森", "草"], correct: 0, explanation: "木 = ki = pohon" },
    { id: "k5", question: "Kanji apa yang artinya 'manusia'?", options: ["犬", "猫", "人", "魚"], correct: 2, explanation: "人 = hito = manusia" },
    { id: "k6", question: "Kanji apa yang artinya 'matahari/hari'?", options: ["月", "日", "星", "空"], correct: 1, explanation: "日 = hi = matahari/hari" },
    { id: "k7", question: "Kanji apa yang artinya 'bulan'?", options: ["日", "月", "年", "時"], correct: 1, explanation: "月 = tsuki = bulan" },
    { id: "k8", question: "Kanji apa yang artinya 'kecil'?", options: ["大", "中", "小", "長"], correct: 2, explanation: "小 = chiisai = kecil" },
    { id: "k9", question: "Kanji apa yang artinya 'besar'?", options: ["小", "大", "高", "広"], correct: 1, explanation: "大 = ookii = besar" },
    { id: "k10", question: "Kanji apa yang artinya 'satu'?", options: ["二", "三", "一", "四"], correct: 2, explanation: "一 = ichi = satu" },
  ],
  mixed: [
    { id: "m1", question: "Arti '日本' (Nihon)?", options: ["Cina", "Korea", "Jepang", "Vietnam"], correct: 2, explanation: "日本 = Nihon = Jepang" },
    { id: "m2", question: "Kanji apa untuk 'makan'?", options: ["飲む", "食べる", "見る", "行く"], correct: 1, explanation: "食べる = taberu = makan" },
    { id: "m3", question: "Pola '~ありがとうございます' = ?", options: ["Selamat pagi", "Selamat malam", "Terima kasih", "Maaf"], correct: 2, explanation: "ありがとうございます = Terima kasih" },
    { id: "m4", question: "Kanji apa artinya 'elang'?", options: ["犬", "鳥", "鷹", "魚"], correct: 2, explanation: "鷹 = taka = elang" },
    { id: "m5", question: "Kanji apa artinya 'uang'?", options: ["金", "銀", "銅", "鉄"], correct: 0, explanation: "金 = kane = uang/logam" },
    { id: "m6", question: "Partikel 'に' bisa berarti?", options: ["dan", "di (tempat)", "dari", "dengan"], correct: 1, explanation: "に = di (tempat/waktu arah)" },
    { id: "m7", question: "Kanji apa artinya 'hutan'?", options: ["林", "木", "草", "花"], correct: 0, explanation: "林 = hayashi = hutan" },
    { id: "m8", question: "Bentuk negatif 'ありますか'?", options: ["ありますない", "ありません", "あるない", "なしあります"], correct: 1, explanation: "ありません (tidak ada)" },
    { id: "m9", question: "Kanji apa artinya 'ayam'?", options: ["牛", "豚", "鳥", "鶏"], correct: 3, explanation: "鶏 = tori = ayam" },
    { id: "m10", question: "Pola '~ましょう' artinya?", options: ["Jangan~", "Bisa~", "Ayo~", "Harus~"], correct: 2, explanation: "~ましょう = mari~ (usul sopan)" },
    { id: "m11", question: "Kanji '学' artinya?", options: ["Bekerja", "Belajar", "Bermain", "Berbicara"], correct: 1, explanation: "学 = manabu = belajar" },
    { id: "m12", question: "Kanji '前' artinya?", options: ["Belakang", "Depan", "Kiri", "Kanan"], correct: 1, explanation: "前 = mae = depan" },
    { id: "m13", question: "Pola '~ている' menunjukkan?", options: ["Future", "Sedang~", "Sudah~", "Belum~"], correct: 1, explanation: "~ている = bentuk present continuous" },
    { id: "m14", question: "Kanji '生' artinya?", options: ["Lahir", "Hidup", "Mati", "Tidur"], correct: 1, explanation: "生 = ikiru = hidup" },
    { id: "m15", question: "Partikel 'で' di '学校で行きます'?", options: ["Tujuan", "Tempat", "Waktu", "Alat"], correct: 1, explanation: "で = di (tempat)" },
  ],
};

export function QuizSession({ quizType, onBack }: QuizSessionProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const questions = Q[quizType] || Q.mixed;
  const total = questions.length;
  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    const pct = Math.round((score / total) * 100);
    const timeSeconds = Math.round((Date.now() - startTime) / 1000);

    // Save quiz result to database (fire and forget)
    completeQuizAction(quizType as QuizType, pct, total, score, timeSeconds);

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
            <div className="flex gap-3">
              <Button onClick={onBack} variant="outline">
                Kembali
              </Button>
              <Button
                onClick={() => {
                  setCurrent(0);
                  setScore(0);
                  setAnswered(false);
                  setCompleted(false);
                  setSelected(null);
                }}
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
      <FadeIn key={q.id}>
        <Card>
          <CardContent className="p-6">
            <p className="text-lg font-medium">{q.question}</p>
            <div className="mt-6 space-y-3">
              {q.options.map((opt, idx) => {
                const isCorrect = idx === q.correct;
                const isSelected = idx === selected;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left transition-all duration-150",
                      answered && isCorrect
                        ? "border-success bg-success/5"
                        : answered && isSelected && !isCorrect
                          ? "border-error bg-error/5"
                          : "border-border hover:border-primary/50 hover:bg-surface",
                      answered ? "cursor-default" : "cursor-pointer"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                        answered && isCorrect
                          ? "bg-success text-white"
                          : answered && isSelected
                            ? "bg-error text-white"
                            : "bg-surface text-muted-foreground"
                      )}
                    >
                      {answered && isCorrect ? (
                        <Check className="h-4 w-4" />
                      ) : answered && isSelected ? (
                        <X className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
      {answered && (
        <FadeIn>
          <div className="rounded-lg bg-surface p-4 text-sm">
            <p className="font-medium text-primary">Penjelasan:</p>
            <p className="mt-1">{q.explanation}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleNext}>
              {current < total - 1 ? "Lanjut" : "Selesai"}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
