import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentUser } from "@/lib/auth";
import { QuizClient } from "./quiz-client";

export const metadata: Metadata = { title: "Kuis" };

export default async function QuizPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kuis</h1>
          <p className="text-sm text-muted-foreground">
            Uji pemahaman bahasa Jepang Anda
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <QuizClient />
      </FadeIn>
    </div>
  );
}
