import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile();

  // Extract preferences from JSONB
  const preferences = (profile?.preferences as Record<string, unknown>) || {};
  const dailyGoal = (preferences.dailyGoal as number) || 20;
  const newCardsPerDay = (preferences.newCardsPerDay as number) || 10;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
          <p className="text-sm text-muted-foreground">Kelola preferensi aplikasi Anda</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
            <CardDescription>Informasi tampilan akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingsForm
              initialName={profile?.display_name || user.email?.split("@")[0] || "Pengguna"}
              initialEmail={user.email || ""}
              initialDailyGoal={dailyGoal}
              initialNewCards={newCardsPerDay}
            />
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Akun</CardTitle>
            <CardDescription>Kelola pengaturan akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Keluar</p>
                <p className="text-xs text-muted-foreground">Keluar dari akun Anda di perangkat ini</p>
              </div>
              <SignOutButton />
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
