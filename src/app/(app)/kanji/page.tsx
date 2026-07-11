import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentUser } from "@/lib/auth";
import { getKanjiByLevel } from "@/lib/db/content";
import { KanjiClient } from "./kanji-client";

export const metadata: Metadata = { title: "Kanji" };

export default async function KanjiPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const kanjiList = await getKanjiByLevel("N5");

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kanji</h1>
          <p className="text-sm text-muted-foreground">
            {kanjiList.length} karakter JLPT N5
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <KanjiClient kanjiList={kanjiList} />
      </FadeIn>
    </div>
  );
}
