"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppErrorBoundary({
  error,
  reset,
  title,
  message,
  href = "/dashboard",
  hrefLabel = "Beranda",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  message?: string;
  href?: string;
  hrefLabel?: string;
}) {
  useEffect(() => {
    console.error(`[${title} Error]`, error);
  }, [error, title]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        {message || error?.message || "Terjadi kesalahan."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Coba Lagi
        </button>
        <Link
          href={href}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {hrefLabel}
        </Link>
      </div>
    </div>
  );
}
