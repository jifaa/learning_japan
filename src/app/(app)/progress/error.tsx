"use client";

import AppErrorBoundary from "@/components/ui/error-boundary";

export default function ProgressErrorBoundary(props: React.ComponentProps<typeof AppErrorBoundary>) {
  return (
    <AppErrorBoundary {...props} title="Tidak dapat memuat progres" message="Terjadi kesalahan database saat mengambil data progres." />
  );
}
