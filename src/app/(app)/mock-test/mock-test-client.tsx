"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion/fade-in";
import { Check, X, ArrowRight, Clock, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MockTestConfig {
  id: string;
  title: string;
  desc: string;
  sections: number;
  timeMinutes: number;
  questionCount: number;
  colorClass: string;
}

interface MockTestQuestion {
  id: string;
  section: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// Comprehensive N5 Mock Test Questions
const MOCK_TEST_QUESTIONS: MockTestQuestion[] = [
  // === SECTION 1: Language Knowledge (Vocabulary) ===
  { id: "v1", section: "Vocabulary", question: "Apa arti '誕生日' (tanjoubi)?", options: ["Hari ulang tahun", "Hari kemerdekaan", "Hari raya", "Hari pernikahan"], correct: 0, explanation: "誕生日 = tanjoubi = hari ulang tahun" },
  { id: "v2", section: "Vocabulary", question: "Apa arti '食堂' (shokudou)?", options: ["Rumah sakit", "Sekolah", "Kantin", "Kantor"], correct: 2, explanation: "食堂 = shokudou = kantin" },
  { id: "v3", section: "Vocabulary", question: "Apa arti '小説' (shousetsu)?", options: ["Puisi", "Cerita pendek", "Novel", "Majalah"], correct: 2, explanation: "小説 = shousetsu = novel" },
  { id: "v4", section: "Vocabulary", question: "Apa arti '競争' (kyousou)?", options: ["Kerja sama", "Persaingan", "Pertemanan", "Pertarungan"], correct: 1, explanation: "競争 = kyousou = persaingan/kompetisi" },
  { id: "v5", section: "Vocabulary", question: "Apa arti '海岸' (kaigan)?", options: ["Gunung", "Sungai", "Pantai", "Danau"], correct: 2, explanation: "海岸 = kaigan = pantai" },
  { id: "v6", section: "Vocabulary", question: "Apa arti '手術' (shujutsu)?", options: ["Operasi", "Pemeriksaan", "Pengobatan", "Suntik"], correct: 0, explanation: "手術 = shujutsu = operasi" },
  { id: "v7", section: "Vocabulary", question: "Apa arti '海岸' (kaigan)?", options: ["Pantai", "Pelabuhan", "Sungai", "Danau"], correct: 0, explanation: "海岸 = kaigan = pantai" },
  { id: "v8", section: "Vocabulary", question: "Apa arti '競争' (kyousou)?", options: ["Kompetisi", "Koordinasi", "Kolaborasi", "Komunikasi"], correct: 0, explanation: "競争 = kyousou = kompetisi" },

  // === SECTION 2: Grammar ===
  { id: "g1", section: "Grammar", question: "Pola '〜てよかった' digunakan untuk?", options: ["Menyesal", "Merasa lega", "Meminta izin", "Menawarkan"], correct: 1, explanation: "〜てよかった = perasaan lega/senang" },
  { id: "g2", section: "Grammar", question: "Partikel 'が' dalam kalimat berikut berfungsi sebagai?", options: ["Subjek", "Objek", "Konektor", "Tempat"], correct: 0, explanation: "が menandai subjek kalimat" },
  { id: "g3", section: "Grammar", question: "'〜なければならない' artinya?", options: ["Tidak perlu", "Harus", "Boleh", "Tidak boleh"], correct: 1, explanation: "〜なければならない = harus/wajib" },
  { id: "g4", section: "Grammar", question: "Pola '〜ようです' menunjukkan?", options: ["Kepastian", "Kemungkinan", "Permintaan", "Keinginan"], correct: 1, explanation: "〜ようです = sepertinya/mungkin" },
  { id: "g5", section: "Grammar", question: "'〜ことがあります' digunakan untuk?", options: ["Kebiasaan", "Kemungkinan", "Rencana", "Permintaan"], correct: 1, explanation: "〜ことがあります = kadang-kadang/ada kalanya" },
  { id: "g6", section: "Grammar", question: "Bentuk lampau dari '食べる' (taberu) bentuk sopan?", options: ["食べます", "食べりました", "食べたです", "食用です"], correct: 1, explanation: "食べます (bentuk sopan) → 食べました (lampau)" },
  { id: "g7", section: "Grammar", question: "'〜なければならない' bentuk singkatnya?", options: ["〜ない", "〜なきゃ", "〜なければ", "〜べき"], correct: 1, explanation: "〜なければならない → 〜なきゃ" },
  { id: "g8", section: "Grammar", question: "Pola '〜て以来' berarti?", options: ["Sebelum", "Sesudah", "Sejak", "Selama"], correct: 2, explanation: "〜て以来 = sejak (telah melakukan sesuatu)" },

  // === SECTION 3: Kanji ===
  { id: "k1", section: "Kanji", question: "Kanji mana yang berarti 'belajar' (manabu)?", options: ["学", "校", "教", "書"], correct: 0, explanation: "学 = gaku/manabu = belajar" },
  { id: "k2", section: "Kanji", question: "Kanji '鉄' artinya?", options: ["Emas", "Perak", "Besi", "Tembaga"], correct: 2, explanation: "鉄 = tetsu = besi" },
  { id: "k3", section: "Kanji", question: "Kanji mana yang berarti 'suami/istri'?", options: ["夫", "父", "男", "兄"], correct: 0, explanation: "夫 = otto = suami" },
  { id: "k4", section: "Kanji", question: "Kanji '駅' artinya?", options: ["Bandara", "Pelabuhan", "Stasiun", "Halte"], correct: 2, explanation: "駅 = eki = stasiun" },
  { id: "k5", section: "Kanji", question: "Kanji mana untuk 'pergi' (iku)?", options: ["来", "去", "行", "帰"], correct: 2, explanation: "行 = iku = pergi" },
  { id: "k6", section: "Kanji", question: "Kanji '泳' artinya?", options: ["Berlari", "Melompat", "Berenang", "Berjalan"], correct: 2, explanation: "泳 = oyogu = berenang" },
  { id: "k7", section: "Kanji", question: "Kanji mana untuk 'beli' (kau)?", options: ["売", "買", "料", "理"], correct: 1, explanation: "買 = kau = membeli" },
  { id: "k8", section: "Kanji", question: "Kanji '鼻' artinya?", options: ["Mata", "Mulut", "Hidung", "Telinga"], correct: 2, explanation: "鼻 = hana = hidung" },

  // === SECTION 4: Reading Comprehension ===
  { id: "r1", section: "Reading", question: "「明日は試験がありますから、今日は勉强します。」Apa yang akan dilakukan besok?", options: ["Berlibur", "Ujian", "Bekerja", "Istirahat"], correct: 1, explanation: "試験 = shiken = ujian" },
  { id: "r2", section: "Reading", question: "「的成本は少し高いですが、质が 좋습니다。」Apa pendapat tentang produk?", options: ["Murah tapi bagus", "Mahal tapi bagus", "Murah dan jelek", "Mahal dan jelek"], correct: 1, explanation: "高い = mahal, 質 = kualitas" },
  { id: "r3", section: "Reading", question: "「每朝、六時に起きます。」Jam berapa起床?", options: ["Jam 5", "Jam 6", "Jam 7", "Jam 8"], correct: 1, explanation: "六時 = roku-ji = jam 6" },
  { id: "r4", section: "Reading", question: "「映画は五時に始まります。」Kapan电影 mulai?", options: ["Jam 3", "Jam 4", "Jam 5", "Jam 6"], correct: 2, explanation: "五時 = go-ji = jam 5" },
  { id: "r5", section: "Reading", question: "「私は日本语的勉强が好きです。」Apa yang disukai?", options: ["Olahraga", "Musik", "Bahasa Jepang", "Memasak"], correct: 2, explanation: "日本語 = Nihongo = bahasa Jepang" },
  { id: "r6", section: "Reading", question: "「友達と映画を見ました。」Dengan siapa dia menonton?", options: ["Keluarga", "Teman", "Guru", "Sendiri"], correct: 1, explanation: "友達 = tomodachi = teman" },
];

interface MockTestClientProps {
  testConfig: MockTestConfig;
  onBack: () => void;
}

export function MockTestClient({ testConfig, onBack }: MockTestClientProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(testConfig.timeMinutes * 60);
  const [timeUp, setTimeUp] = useState(false);

  const questions = MOCK_TEST_QUESTIONS.slice(0, testConfig.questionCount);
  const total = questions.length;
  const q = questions[current];

  // Timer
  useEffect(() => {
    if (completed || timeUp) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimeUp(true);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [completed, timeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = timeSeconds % 60;

    return (
      <FadeIn>
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
            <div
              className={cn(
                "flex h-24 w-24 items-center justify-center rounded-full",
                pct >= 80 ? "bg-success/10" : pct >= 60 ? "bg-primary/10" : "bg-error/10"
              )}
            >
              <Trophy className={cn(
                "h-12 w-12",
                pct >= 80 ? "text-success" : pct >= 60 ? "text-primary" : "text-error"
              )} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {pct >= 80 ? "Luar biasa!" : pct >= 60 ? "Bagus!" : "Tetap semangat!"}
              </h2>
              <p className="mt-2 text-4xl font-bold text-primary">{pct}%</p>
              <p className="mt-1 text-muted-foreground">
                {score} dari {total} benar
              </p>
              <p className="text-sm text-muted-foreground">
                Waktu: {minutes} menit {seconds} detik
                {timeUp && " (waktu habis)"}
              </p>
            </div>

            <div className="w-full space-y-2 rounded-lg bg-surface p-4 text-left">
              <h3 className="font-medium">Ringkasan:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Vocabulary: {questions.filter(q => q.section === "Vocabulary" && questions.indexOf(q) < current + (selected === q.correct ? 1 : 0)).length}</div>
                <div>Grammar: {questions.filter(q => q.section === "Grammar").length}</div>
                <div>Kanji: {questions.filter(q => q.section === "Kanji").length}</div>
                <div>Reading: {questions.filter(q => q.section === "Reading").length}</div>
              </div>
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
                  setTimeLeft(testConfig.timeMinutes * 60);
                  setTimeUp(false);
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
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
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Batal
        </Button>
        <div className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
          timeLeft <= 60 ? "bg-error/10 text-error animate-pulse" : "bg-surface"
        )}>
          <Clock className="h-4 w-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
          <span>{q.section}</span>
          <span>{current + 1}/{total}</span>
        </div>
        <ProgressBar value={current + 1} max={total} showValue={false} />
      </div>

      {/* Question */}
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
                            : "bg-muted text-muted-foreground"
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

      {/* Explanation & Next */}
      {answered && (
        <FadeIn>
          <div className="rounded-lg bg-surface p-4">
            <p className="font-medium text-primary">Penjelasan:</p>
            <p className="mt-1">{q.explanation}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleNext}>
              {current < total - 1 ? "Lanjut" : "Selesai"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
