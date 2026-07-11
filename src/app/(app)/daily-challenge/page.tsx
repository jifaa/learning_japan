import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { Flame, Target, BookOpen, BrainCircuit, Layers } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDailyWord } from "@/lib/daily-word";
import Link from "next/link";

export const metadata: Metadata = { title: "Tantangan Harian" };

const CHALLENGES = [
  { id: "vocab", title: "Pelajari 10 Kosakata Baru", xp: 50, icon: BookOpen, href: "/vocabulary" },
  { id: "review", title: "Tinjau 20 Kartu", xp: 40, icon: Layers, href: "/flashcards" },
  { id: "quiz", title: "Selesaikan Kuis Harian", xp: 30, icon: BrainCircuit, href: "/quiz" },
  { id: "kana", title: "Praktikkan Hiragana", xp: 20, icon: Target, href: "/hiragana" },
];

export default async function DailyChallengePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [dailyWord] = await Promise.all([
    getDailyWord(),
  ]);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Tantangan Harian</h1>
          <p className="text-sm text-muted-foreground">Selesaikan tantangan untuk XP bonus</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <Flame className="h-10 w-10 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Tantangan Hari Ini</h2>
              <p className="text-sm text-muted-foreground">{CHALLENGES.length} tantangan tersedia - hingga +140 XP</p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="space-y-3">
          {CHALLENGES.map((challenge, i) => {
            const Icon = challenge.icon;
            return (
              <FadeIn key={challenge.id} delay={0.1 + i * 0.05}>
                <Card className="transition-shadow duration-150 hover:shadow-sm">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">+{challenge.xp} XP</p>
                    </div>
                    <Link href={challenge.href}>
                      <Button size="sm">Mulai</Button>
                    </Link>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </FadeIn>

      {dailyWord && (
        <FadeIn delay={0.3}>
          <SectionHeader title="Kata Hari Ini" description="Pelajari satu kata baru" />
          <Card className="mt-4">
            <CardContent className="p-5 space-y-2">
              <p className="text-3xl font-semibold">{dailyWord.expression}</p>
              {dailyWord.reading && <p className="text-sm text-muted-foreground">{dailyWord.reading}</p>}
              <p className="text-sm">{dailyWord.meaning_id || dailyWord.meaning_en}</p>
              <Link href="/vocabulary">
                <Button variant="outline" size="sm" className="mt-2">Pelajari Lebih Lanjut</Button>
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
