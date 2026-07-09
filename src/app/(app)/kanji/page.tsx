import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { Volume2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getKanjiByLevel } from "@/lib/db/content";
import { KanjiClient } from "./kanji-client";

export const metadata: Metadata = { title: "Kanji" };

export default async function KanjiPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const kanjiList = await getKanjiByLevel("N5");

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kanji</h1>
          <p className="text-sm text-muted-foreground">
            {kanjiList.length} karakter JLPT N5
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <SectionHeader title="Karakter Kanji" description="Pelajari makna dan bacaan" />
      </FadeIn>

      <FadeIn delay={0.1}>
        <KanjiClient kanjiList={kanjiList} />
      </FadeIn>
    </div>
  );
}
