"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { BrainCircuit, BookOpen, FileText, Layers, ArrowRight } from "lucide-react";
import { QuizSession } from "./quiz-session";

const quizTypes = [
  {
    id: "vocabulary",
    title: "Kosakata",
    desc: "Uji pengetahuan kata bahasa Jepang",
    icon: BookOpen,
    questionCount: 10,
    timeMinutes: 5,
  },
  {
    id: "grammar",
    title: "Tata Bahasa",
    desc: "Pola kalimat dan struktur",
    icon: BrainCircuit,
    questionCount: 10,
    timeMinutes: 8,
  },
  {
    id: "kanji",
    title: "Kanji",
    desc: "Bacaan dan makna karakter",
    icon: FileText,
    questionCount: 10,
    timeMinutes: 5,
  },
  {
    id: "mixed",
    title: "Campuran",
    desc: "Campuran semua topik",
    icon: Layers,
    questionCount: 15,
    timeMinutes: 10,
  },
];

export function QuizClient() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  if (selectedType) {
    return (
      <QuizSession
        quizType={selectedType}
        onBack={() => setSelectedType(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {quizTypes.map((type, i) => {
          const Icon = type.icon;
          return (
            <FadeIn key={type.id} delay={0.05 + i * 0.05}>
              <Card className="cursor-pointer transition-shadow duration-150 hover:shadow-md"
                onClick={() => setSelectedType(type.id)}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{type.title}</h3>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {type.questionCount} pertanyaan - {type.timeMinutes} menit
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
