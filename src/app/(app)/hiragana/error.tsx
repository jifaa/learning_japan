"use client";

import AppErrorBoundary from "@/components/ui/error-boundary";

export default function HiraganaErrorBoundary(props: React.ComponentProps<typeof AppErrorBoundary>) {
  return (
    <AppErrorBoundary {...props} title="Tidak dapat memuat karakter Kana" message="Terjadi kesalahan database saat mengambil data Hiragana/Katakana." />
  );
}
