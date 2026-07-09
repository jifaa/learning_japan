"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

type KanaChar = { character: string; romaji: string };

interface KanaChartClientProps {
  chars: KanaChar[];
  script: "hiragana" | "katakana";
}

/**
 * Client component for interactive kana chart.
 * Pronunciation via browser Web Speech API (ja-JP voice).
 */
export function KanaChartClient({ chars, script }: KanaChartClientProps) {
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    // Prefer a Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find((v) => v.lang.startsWith("ja"));
    if (jpVoice) utterance.voice = jpVoice;
    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      {chars.map((char) => (
        <button
          key={char.character}
          onClick={() => speak(char.character)}
          className="group flex flex-col items-center justify-center rounded-lg border border-border bg-background p-3 transition-all duration-150 hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Dengarkan ${char.character} (${char.romaji})`}
        >
          <span className="text-2xl font-semibold leading-none">{char.character}</span>
          <span className="mt-1 text-xs text-muted-foreground">{char.romaji}</span>
          <Volume2 className="mt-1 h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      ))}
    </div>
  );
}
