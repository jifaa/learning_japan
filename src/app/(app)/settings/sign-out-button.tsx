"use client";
import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/server/actions/auth.actions";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = useCallback(() => {
    startTransition(async () => {
      await signOutAction();
      router.refresh();
    });
  }, [router]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={isPending}
    >
      {isPending ? "Keluar..." : "Keluar"}
    </Button>
  );
}
