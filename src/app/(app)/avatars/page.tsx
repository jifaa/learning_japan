import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateUserProgress } from "@/lib/db/progress";
import { getCoinBalance, getUserAvatars, getCurrentAvatar, getAvailableAvatars, purchaseAvatar, equipAvatar } from "@/lib/db/coins-avatars";
import { AvatarSelector } from "@/components/gamification/avatar-selector";

export const metadata: Metadata = { title: "Avatar" };

export default async function AvatarsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [progress, coinBalance, userAvatars, currentAvatar, allAvatars] = await Promise.all([
    getOrCreateUserProgress(user.id),
    getCoinBalance(user.id),
    getUserAvatars(user.id),
    getCurrentAvatar(user.id),
    getAvailableAvatars(),
  ]);

  const ownedIds = userAvatars.map((ua) => ua.avatar_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Avatar</h1>
        <p className="text-sm text-muted-foreground">
          Kumpulkan dan pakai avatar untuk profil Anda
        </p>
      </div>

      <AvatarSelectorWrapper
        avatars={allAvatars}
        ownedIds={ownedIds}
        currentAvatarId={progress.current_avatar_id}
        userCoins={coinBalance}
        userLevel={progress.level}
        userId={user.id}
      />
    </div>
  );
}

// Client wrapper for interactions
import { AvatarSelectorWrapper } from "./avatar-selector-wrapper";
