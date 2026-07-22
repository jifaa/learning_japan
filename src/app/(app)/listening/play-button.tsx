"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface PlayButtonProps {
  text?: string;
}

export function PlayButton({ text = "こんにちは、はじめまして。" }: PlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser Anda tidak mendukung fitur pemutaran suara.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handlePlay}
      className="shrink-0 rounded-full bg-primary p-3 text-white transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-md hover:bg-primary/90"
      aria-label="Putar audio"
      title="Putar audio bahasa Jepang"
    >
      {isPlaying ? <VolumeX className="h-5 w-5 animate-pulse" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}
