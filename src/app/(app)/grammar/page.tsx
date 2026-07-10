import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentUser } from "@/lib/auth";
import { getCoreGrammarN5 } from "@/lib/db/content";

export const metadata: Metadata = { title: "Tata Bahasa" };

export default async function GrammarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const grammarPoints = await getCoreGrammarN5();

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Tata Bahasa</h1>
          <p className="text-sm text-muted-foreground">
            {grammarPoints.length} pola tata bahasa inti JLPT N5
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <SectionHeader title="Pola Kalimat" description="Pelajari struktur kalimat bahasa Jepang" />
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="space-y-4">
          {grammarPoints.map((point, i) => (
            <FadeIn key={point.id} delay={Math.min(i * 0.02, 0.3)}>
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {/* <p className="text-xl font-semibold">{point.grammar_point}</p> */}
                      {point.structure_pattern && (
                        <p className="text-xl font-semibold">
                          {point.structure_pattern}
                        </p>
                      )}
                    </div>
                    {point.is_core_n5 && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        N5 Inti
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{point.meaning_id || point.meaning_en}</p>
                  {point.example_jp && (
                    <div className="rounded-lg bg-surface p-3">
                      <p className="text-sm font-medium">{point.example_jp}</p>
                      {point.example_romaji && (
                        <p className="mt-1 text-xs text-muted-foreground italic">{point.example_romaji}</p>
                      )}
                      {(point.example_meaning_id || point.example_meaning) && (
                        <p className="mt-1 text-xs text-muted-foreground">{point.example_meaning_id || point.example_meaning}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      {grammarPoints.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p>Tidak ada pola tata bahasa inti yang ditemukan.</p>
        </div>
      )}
    </div>
  );
}
