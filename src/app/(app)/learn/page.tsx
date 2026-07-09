import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { Play, CheckCircle, Lock, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export const metadata: Metadata = { title: "Pelajaran" };

const ROADMAP = [
  { id: "p0", title: "Persiapan", desc: "Setup dan orientasi belajar", lessons: 3, phase: "completed" as const },
  { id: "p1", title: "Hiragana & Katakana", desc: "Kuasai dua sistem huruf Jepang", lessons: 12, phase: "in_progress" as const },
  { id: "p2", title: "Kosakata Dasar", desc: "Kata dan ungkapan penting", lessons: 8, phase: "locked" as const },
  { id: "p3", title: "Angka & Waktu", desc: "Menghitung, tanggal, dan jam", lessons: 6, phase: "locked" as const },
  { id: "p4", title: "Tata Bahasa Dasar", desc: "Pola kalimat inti", lessons: 10, phase: "locked" as const },
  { id: "p5", title: "Percakapan Sehari-hari", desc: "Dialog praktis", lessons: 8, phase: "locked" as const },
];

export default async function LearnPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      <FadeIn>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Fase Saat Ini</h2>
              <p className="text-sm text-muted-foreground">Hiragana & Katakana</p>
            </div>
            <ProgressBar value={0} max={12} label="Fase Progress" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">0 dari 12 pelajaran selesai</p>
              <Link href="/hiragana"><Button size="sm"><Play className="mr-2 h-4 w-4" />Lanjutkan</Button></Link>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.1}>
        <SectionHeader title="Jalur Belajar" description="Selesaikan setiap fase untuk menguasai JLPT N5" />
        <div className="mt-4 space-y-3">
          {ROADMAP.map((phase, i) => (
            <FadeIn key={phase.id} delay={0.1 + i * 0.04} direction="right">
              <Card className={phase.phase === "locked" ? "opacity-60" : phase.phase === "in_progress" ? "border-primary/30" : ""}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    phase.phase === "completed" ? "bg-success/10 text-success" :
                    phase.phase === "in_progress" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {phase.phase === "completed" ? <CheckCircle className="h-5 w-5" /> :
                     phase.phase === "locked" ? <Lock className="h-4 w-4" /> :
                     <span className="text-sm font-medium">{i + 1}</span>}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{phase.title}</h3>
                      {phase.phase === "in_progress" && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Sedang Berlangsung</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{phase.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{phase.lessons} pelajaran</p>
                  </div>
                  {phase.phase !== "locked" && (
                    <Link href="/hiragana">
                      <Button size="sm" variant="ghost"><ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
