"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { KanaQuizFlow, type KanaQuestion } from "@/components/kana/kana-quiz-flow";

interface Props {
  questions: KanaQuestion[];
  script: "hiragana" | "katakana";
}

export function KanaQuizPageClient({ questions, script }: Props) {
  const router = useRouter();

  const onBack = useCallback(async () => {
    // Refresh server data before navigating to ensure fresh progress
    router.refresh();
    // Small delay to ensure refresh completes
    await new Promise((resolve) => setTimeout(resolve, 100));
    router.push(`/${script}`);
  }, [router, script]);

  return <KanaQuizFlow questions={questions} script={script} onBack={onBack} />;
}
