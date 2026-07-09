"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarSelector } from "@/components/gamification/avatar-selector";
import { purchaseAvatar, equipAvatar as equipAvatarDb, getAvailableAvatars, getUserAvatars, getCoinBalance } from "@/lib/db/coins-avatars";
import type { Avatar } from "@/types/coins-avatars";

interface AvatarSelectorWrapperProps {
  avatars: Avatar[];
  ownedIds: string[];
  currentAvatarId: string | null;
  userCoins: number;
  userLevel: number;
  userId: string;
}

export function AvatarSelectorWrapper({
  avatars,
  ownedIds,
  currentAvatarId,
  userCoins,
  userLevel,
  userId,
}: AvatarSelectorWrapperProps) {
  const router = useRouter();
  const [coins, setCoins] = useState(userCoins);
  const [owned, setOwned] = useState(ownedIds);
  const [equipped, setEquipped] = useState(currentAvatarId);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (avatarId: string) => {
    setLoading(true);
    try {
      const result = await purchaseAvatar(userId, avatarId);
      if (result.success) {
        // Refresh data
        const [newBalance, newOwned, newAvatars] = await Promise.all([
          getCoinBalance(userId),
          getUserAvatars(userId).then((ua) => ua.map((a) => a.avatar_id)),
          getAvailableAvatars(),
        ]);
        setCoins(newBalance);
        setOwned(newOwned);
        router.refresh();
      } else {
        alert(result.error || "Gagal membeli avatar");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Terjadi kesalahan saat membeli avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (avatarId: string) => {
    setLoading(true);
    try {
      const result = await equipAvatarDb(userId, avatarId);
      if (result.success) {
        setEquipped(avatarId);
        router.refresh();
      } else {
        alert(result.error || "Gagal memakai avatar");
      }
    } catch (err) {
      console.error("Equip error:", err);
      alert("Terjadi kesalahan saat memakai avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AvatarSelector
      avatars={avatars}
      ownedIds={owned}
      currentAvatarId={equipped}
      userCoins={coins}
      onPurchase={handlePurchase}
      onEquip={handleEquip}
      loading={loading}
    />
  );
}
