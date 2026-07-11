import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { FileText, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getReadingPassages } from "@/lib/db/content";

export const metadata: Metadata = { title: "Bacaan" };

export default async function ReadingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const passages = await getReadingPassages("N5" as any);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Bacaan</h1>
          <p className="text-sm text-muted-foreground">Latihan membaca teks bahasa Jepang</p>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="space-y-3">
          {passages.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="mx-auto h-10 w-10 opacity-30" />
                <p className="mt-3">Tidak ada bacaan tersedia.</p>
              </CardContent>
            </Card>
          )}
          {passages.map((p, i) => (
            <FadeIn key={p.id} delay={0.1 + i * 0.05}>
              <Card className="transition-shadow duration-150 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{p.title_id || p.title_en || "Teks"}</h3>
                    <p className="text-sm text-muted-foreground truncate">{p.topic || "Teks N5"}</p>
                    {p.character_count && <p className="text-xs text-muted-foreground">{p.character_count} karakter</p>}
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/reading/${p.id}`}>
                      Baca <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
