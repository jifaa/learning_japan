"use client";

import { Volume2 } from "lucide-react";

export function PlayButton() {
  return (
    <button
      className="shrink-0 rounded-full bg-primary p-3 text-white transition-colors cursor-not-allowed opacity-50"
      aria-label="Audio dinonaktifkan"
      disabled
    >
      <Volume2 className="h-5 w-5" />
    </button>
  );
}
