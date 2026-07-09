"use client";

import { Volume2 } from "lucide-react";

export function PlayButton() {
  return (
    <button 
      className="shrink-0 rounded-full bg-primary p-3 text-white transition-colors hover:bg-primary-hover"
      aria-label="Putar audio contoh"
      onClick={() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance("Disabled untuk simulasi JLPT");
          u.lang = "ja-JP";
          window.speechSynthesis.speak(u);
        }
      }}
    >
      <Volume2 className="h-5 w-5" />
    </button>
  );
}
