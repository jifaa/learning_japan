"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { Clock, BrainCircuit, BookOpen, FileText, Layers, ArrowRight, AlertTriangle } from "lucide-react";
import { MockTestClient } from "./mock-test-client";

interface TestConfig {
  id: string;
  title: string;
  desc: string;
  sections: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  timeMinutes: number;
  questionCount: number;
}

const MOCK_TESTS: TestConfig[] = [
  {
    id: "n5-full",
    title: "Simulasi N5 Lengkap",
    desc: "30 pertanyaan - 30 menit",
    sections: 4,
    icon: Layers,
    colorClass: "bg-primary",
    timeMinutes: 30,
    questionCount: 30,
  },
  {
    id: "n5-vocab",
    title: "Kosakata N5",
    desc: "10 pertanyaan - 10 menit",
    sections: 1,
    icon: BookOpen,
    colorClass: "bg-emerald-500",
    timeMinutes: 10,
    questionCount: 10,
  },
  {
    id: "n5-grammar",
    title: "Tata Bahasa N5",
    desc: "10 pertanyaan - 10 menit",
    sections: 1,
    icon: BrainCircuit,
    colorClass: "bg-amber-500",
    timeMinutes: 10,
    questionCount: 10,
  },
  {
    id: "n5-reading",
    title: "Bacaan N5",
    desc: "10 pertanyaan - 15 menit",
    sections: 1,
    icon: FileText,
    colorClass: "bg-rose-500",
    timeMinutes: 15,
    questionCount: 10,
  },
];

export function MockTestSelector() {
  const [selectedTest, setSelectedTest] = useState<TestConfig | null>(null);

  if (selectedTest) {
    return (
      <MockTestClient
        testConfig={selectedTest}
        onBack={() => setSelectedTest(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Simulasi JLPT</h1>
          <p className="text-sm text-muted-foreground">
            Ujian latihan lengkap seperti ujian JLPT sungguhan
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <AlertTriangle className="h-10 w-10 text-primary shrink-0" />
            <div>
              <h2 className="text-lg font-semibold">Peringatan Penting</h2>
              <p className="text-sm text-muted-foreground">
                sekali dimulai, timer tidak dapat dijeda. Pastikan Anda memiliki waktu yang cukup sebelum memulai.
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.1}>
        <SectionHeader
          title="Pilih Simulasi"
          description="Setiap simulasi mengikuti format JLPT"
        />
        <div className="mt-4 space-y-4">
          {MOCK_TESTS.map((test, i) => {
            const Icon = test.icon;
            return (
              <FadeIn key={test.id} delay={0.1 + i * 0.05}>
                <Card className="transition-shadow duration-150 hover:shadow-md cursor-pointer"
                  onClick={() => setSelectedTest(test)}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white ${test.colorClass}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{test.title}</h3>
                      <p className="text-sm text-muted-foreground">{test.desc}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {test.timeMinutes} menit
                        </span>
                        <span>{test.questionCount} pertanyaan</span>
                        <span>{test.sections} bagian</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setSelectedTest(test)}>
                      Mulai
                    </Button>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </FadeIn>

      <FadeIn delay={0.4}>
        <SectionHeader title="Tips Ujian" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            "Baca semua pilihan sebelum menjawab",
            "Kelola waktu dengan baik",
            "Jangan habiskan waktu di satu soal",
            "Periksa jawaban jika waktu tersisa",
          ].map((tip, i) => (
            <FadeIn key={i} delay={0.4 + i * 0.03}>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {i + 1}
                  </div>
                  <p className="text-sm">{tip}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.6}>
        <SectionHeader title="Format JLPT" description="Struktur ujian yang akan Anda hadapi" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Bahasa (Vocabulary)", questions: 30, time: 25, weight: "文字語彙" },
            { title: "文法 (Grammar)", questions: 30, time: 25, weight: "文 法" },
            { title: "読解 (Reading)", questions: 30, time: 50, weight: "読 解" },
            { title: "聴解 (Listening)", questions: 30, time: 30, weight: "聴 解" },
          ].map((section, i) => (
            <FadeIn key={section.title} delay={0.6 + i * 0.03}>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{section.weight}</p>
                  <p className="mt-1 text-sm font-medium">{section.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {section.questions} soal · {section.time} menit
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
