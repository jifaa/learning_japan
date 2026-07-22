"use client";

import AppErrorBoundary from "@/components/ui/error-boundary";

export default function KanjiErrorBoundary(props: React.ComponentProps<typeof AppErrorBoundary>) {
  return (
    <AppErrorBoundary {...props} title="Tidak dapat memuat Kanji" message="Terjadi kesalahan database saat mengambil data Kanji." />
  );
}
