"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error Boundary]", error);
  }, [error]);

  const isDbError =
    error?.message?.includes("42703") ||
    error?.message?.includes("undefined column") ||
    error?.message?.includes("does not exist");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Terjadi Kesalahan
        </h1>
        {isDbError ? (
          <p className="text-sm text-muted-foreground max-w-md">
            Database belum siap. Pastikan Anda sudah menjalankan schema SQL di{" "}
            <code className="text-xs bg-muted px-1 rounded">
              database/fix-42703-profiles.sql
            </code>{" "}
            di Supabase Dashboard.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {error?.message || "Terjadi kesalahan yang tidak diketahui."}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
