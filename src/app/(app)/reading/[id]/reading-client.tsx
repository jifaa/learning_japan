"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReadingPassage } from "@/types/content";

interface ReadingPassageClientProps {
  passage: ReadingPassage;
}

export function ReadingPassageClient({ passage }: ReadingPassageClientProps) {
  const [translationVisible, setTranslationVisible] = useState(false);

  const hasTranslation = passage.meaning_id && passage.meaning_id.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Japanese text */}
      {passage.passage_jp && (
        <Card className="overflow-hidden border-border bg-card shadow-sm">
          <CardContent className="p-6 sm:p-10">
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground">
              <p className="leading-relaxed text-2xl font-medium tracking-wide">
                {passage.passage_jp}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Romaji section */}
      {passage.passage_romaji && (
        <div className="rounded-xl bg-surface p-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Romaji
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {passage.passage_romaji}
          </p>
        </div>
      )}

      {/* Indonesian translation — toggle button + revealed area */}
      {hasTranslation && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTranslationVisible((v) => !v)}
              className="gap-1.5"
            >
              {translationVisible ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Sembunyikan Arti
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Tampilkan Arti
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {translationVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="rounded-xl bg-surface p-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Arti / Terjemahan
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {passage.meaning_id}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
