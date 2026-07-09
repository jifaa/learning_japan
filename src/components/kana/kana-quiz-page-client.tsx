"use client";

import { useRouter } from "next/navigation";
import { KanaQuizFlow, type KanaQuestion } from "@/components/kana/kana-quiz-flow";

interface Props {
  questions: KanaQuestion[];
  script: "hiragana" | "katakana";
}

export function KanaQuizPageClient({ questions, script }: Props) {
  const router = useRouter();
  return <KanaQuizFlow questions={questions} script={script} onBack={() => router.back()} />;
}
