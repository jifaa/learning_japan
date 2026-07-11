import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { ArrowLeft, Clock, Type } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getReadingPassageById } from "@/lib/db/content";
import { ReadingPassageClient } from "./reading-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const passage = await getReadingPassageById(id);
    return { title: passage.title_id || passage.title_en || "Bacaan" };
  } catch (e) {
    return { title: "Bacaan Tidak Ditemukan" };
  }
}

export default async function ReadingPassagePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  let passage;
  try {
    passage = await getReadingPassageById(id);
  } catch (e) {
    notFound();
  }

  if (!passage) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <FadeIn>
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2 text-muted-foreground">
            <Link href="/reading">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar
            </Link>
          </Button>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {passage.jlpt_level || "N5"}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {passage.topic || "Latihan Membaca"}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {passage.title_id || passage.title_en || "Teks Bacaan"}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              {passage.character_count && (
                <div className="flex items-center gap-1.5">
                  <Type className="h-4 w-4" />
                  <span>{passage.character_count} karakter</span>
                </div>
              )}
              {passage.estimated_reading_seconds && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{Math.ceil(passage.estimated_reading_seconds / 60)} menit</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <ReadingPassageClient passage={passage} />
      </FadeIn>
    </div>
  );
}
