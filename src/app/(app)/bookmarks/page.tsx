import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentUser } from "@/lib/auth";
import { getUserBookmarks } from "@/lib/db/content";
import { BookmarksClient } from "./bookmarks-client";

export const metadata: Metadata = { title: "Penanda" };

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const bookmarks = await getUserBookmarks(user.id);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Penanda</h1>
          <p className="text-sm text-muted-foreground">
            {bookmarks.length} item yang Anda tandai
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <BookmarksClient bookmarks={bookmarks} />
      </FadeIn>
    </div>
  );
}
