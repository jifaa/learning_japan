import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserNotes } from "@/lib/db/content";
import { NotesClient } from "./notes-client";

export const metadata: Metadata = { title: "Catatan" };

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notes = await getUserNotes(user.id);

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Catatan</h1>
          <p className="text-sm text-muted-foreground">
            {notes.length} catatan pribadi
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <NotesClient initialNotes={notes} />
      </FadeIn>
    </div>
  );
}
