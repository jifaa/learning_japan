"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function KanaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error("[Kana Error]", error); }, [error]);
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-xl font-semibold">Tidak dapat memuat karakter Kana</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        {error?.message || "Terjadi kesalahan database saat mengambil data Hiragana/Katakana."}
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Coba Lagi</button>
        <Link href="/dashboard" className="rounded-md border border-border px-4 py-2 text-sm font-medium">Beranda</Link>
      </div>
    </div>
  );
}
