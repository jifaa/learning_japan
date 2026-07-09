import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { Headphones, Volume2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PlayButton } from "./play-button";

export const metadata: Metadata = { title: "Pendengaran" };

export default async function ListeningPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pendengaran</h1>
          <p className="text-sm text-muted-foreground">
            Latihan pemahaman听力 dengan audio bahasa Jepang
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <Headphones className="h-10 w-10 text-primary shrink-0" />
            <div>
              <h2 className="text-lg font-semibold">Fitur Audio</h2>
              <p className="text-sm text-muted-foreground">
                Tekan tombol untuk mendengarkan pengucapan. Audio dihasilkan secara otomatis oleh browser.
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.1}>
        <SectionHeader title="Latihan Pendengaran" description="Dengarkan dan pilih jawaban yang benar" />
        <div className="mt-4 space-y-4">
          {[
            { level: "N5", title: "Kalimat Dasar", desc: "Dengarkan kalimat sederhana sehari-hari", questions: 10, minutes: 5 },
            { level: "N5", title: "Dialog Pendek", desc: "Percakapan singkat di toko dan restoran", questions: 10, minutes: 5 },
            { level: "N5", title: "Angka dan Waktu", desc: "Dengarkan angka, tanggal, dan jam", questions: 10, minutes: 5 },
          ].map((exercise, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.05}>
              <Card className="transition-shadow duration-150 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Volume2 className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{exercise.title}</h3>
                      <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">{exercise.level}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{exercise.desc}</p>
                    <p className="text-xs text-muted-foreground">{exercise.questions} pertanyaan - {exercise.minutes} menit</p>
                  </div>
                  <PlayButton />
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.4}>
        <SectionHeader title="Cara Kerja" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { step: "1", title: "Pilih Latihan", desc: "Pilih topik yang ingin Anda latih" },
            { step: "2", title: "Dengarkan Audio", desc: "Tekan tombol putar untuk mendengarkan" },
            { step: "3", title: "Pilih Jawaban", desc: "Pilih jawaban yang paling tepat" },
          ].map((item, i) => (
            <FadeIn key={i} delay={0.4 + i * 0.05}>
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
