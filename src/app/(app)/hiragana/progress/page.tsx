import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getHiragana } from "@/lib/db/content";
import { KanaProgressDetail } from "@/components/kana/kana-progress-detail";

export const metadata: Metadata = { title: "Progress Hiragana" };

export default async function HiraganaProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const chars = await getHiragana();

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <KanaProgressDetail script="hiragana" totalChars={chars.length} />
    </div>
  );
}
