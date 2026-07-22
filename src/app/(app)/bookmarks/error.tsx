"use client";

import AppErrorBoundary from "@/components/ui/error-boundary";

export default function BookmarksErrorBoundary(props: React.ComponentProps<typeof AppErrorBoundary>) {
  return (
    <AppErrorBoundary {...props} title="Tidak dapat memuat penanda" />
  );
}
