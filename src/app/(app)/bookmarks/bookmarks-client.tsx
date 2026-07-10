"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { Bookmark, BookOpen, FileText, BrainCircuit, Trash2 } from "lucide-react";
import { removeBookmark } from "@/server/actions/bookmark.actions";
import Link from "next/link";

interface BookmarkItem {
  id: string;
  content_type: string;
  content_id: string;
  created_at: string;
  // Content fields loaded separately
  expression?: string;
  reading?: string;
  meaning_id?: string;
  meaning_en?: string;
  kanji?: string;
  grammar_point?: string;
  romaji?: string;
}

interface BookmarksClientProps {
  bookmarks: BookmarkItem[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; href: string }> = {
  vocabulary: { label: "Kosakata", icon: BookOpen, href: "/vocabulary" },
  kanji: { label: "Kanji", icon: FileText, href: "/kanji" },
  grammar: { label: "Tata Bahasa", icon: BrainCircuit, href: "/grammar" },
};

export function BookmarksClient({ bookmarks }: BookmarksClientProps) {
  const [items, setItems] = useState(bookmarks);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await removeBookmark(id);
    setItems(prev => prev.filter(b => b.id !== id));
    setDeleting(null);
  };

  if (items.length === 0) {
    return (
      <FadeIn>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Bookmark className="mx-auto h-10 w-10 opacity-30" />
            <p className="mt-3">Belum ada penanda.</p>
            <p className="text-sm">Tandai kosakata, kanji, atau tata bahasa untukeasily kembali.</p>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const config = TYPE_CONFIG[item.content_type] || TYPE_CONFIG.vocabulary;
        const Icon = config.icon;
        const isKanji = item.content_type === "kanji";
        const isGrammar = item.content_type === "grammar";

        return (
          <FadeIn key={item.id} delay={i * 0.03}>
            <Card className="transition-shadow duration-150 hover:shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  {isKanji && item.kanji ? (
                    <>
                      <p className="text-2xl font-semibold">{item.kanji}</p>
                      <p className="text-sm text-muted-foreground">{item.meaning_id || item.meaning_en}</p>
                    </>
                  ) : isGrammar && item.grammar_point ? (
                    <>
                      <p className="text-lg font-medium">{item.grammar_point}</p>
                      <p className="text-sm text-muted-foreground">{item.meaning_id || item.meaning_en}</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold">{item.expression}</p>
                      </div>
                      {item.reading && <p className="text-sm text-muted-foreground">{item.reading}</p>}
                      <p className="text-sm text-muted-foreground">{item.meaning_id || item.meaning_en}</p>
                    </>
                  )}
                  <span className="mt-1 inline-block rounded bg-surface px-2 py-0.5 text-xs text-muted-foreground">
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={config.href}>
                    <Button size="sm" variant="ghost">Buka</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="text-error hover:bg-error/10"
                    aria-label="Hapus penanda"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        );
      })}
    </div>
  );
}
