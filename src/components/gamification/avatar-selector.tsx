"use client";

import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FadeIn } from "@/components/motion/fade-in";
import { Coins, Lock, Check, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RARITY_COLORS, RARITY_LABELS, type Avatar, type AvatarRarity } from "@/types/coins-avatars";

interface AvatarSelectorProps {
  avatars: Avatar[];
  ownedIds: string[];
  currentAvatarId: string | null;
  userCoins: number;
  onPurchase: (avatarId: string) => Promise<void>;
  onEquip: (avatarId: string) => Promise<void>;
  loading: boolean;
}

const RARITY_ORDER: AvatarRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

export function AvatarSelector({
  avatars,
  ownedIds,
  currentAvatarId,
  userCoins,
  onPurchase,
  onEquip,
  loading,
}: AvatarSelectorProps) {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);

  const ownedSet = new Set(ownedIds);

  // Group avatars by rarity
  const groupedAvatars = RARITY_ORDER.reduce((acc, rarity) => {
    acc[rarity] = avatars.filter((a) => a.rarity === rarity);
    return acc;
  }, {} as Record<AvatarRarity, Avatar[]>);

  const handlePurchase = async (avatarId: string) => {
    setPurchasing(avatarId);
    try {
      await onPurchase(avatarId);
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (avatarId: string) => {
    setEquipping(avatarId);
    try {
      await onEquip(avatarId);
    } finally {
      setEquipping(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Coins Balance */}
      <FadeIn>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{userCoins}</p>
                <p className="text-sm text-muted-foreground">Koin Tersedia</p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Kumpulkan koin dengan:</p>
              <p>• Menyelesaikan kuis</p>
              <p>• Streak harian</p>
              <p>• Membuka achievement</p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Avatar Grid by Rarity */}
      {RARITY_ORDER.map((rarity) => {
        const rarityAvatars = groupedAvatars[rarity];
        if (rarityAvatars.length === 0) return null;

        return (
          <FadeIn key={rarity}>
            <SectionHeader
              title={
                <span className={cn("flex items-center gap-2", RARITY_COLORS[rarity])}>
                  {rarity === "legendary" && <Crown className="h-5 w-5" />}
                  {rarity === "epic" && <Sparkles className="h-5 w-5" />}
                  {RARITY_LABELS[rarity]}
                </span>
              }
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rarityAvatars.map((avatar) => {
                const isOwned = ownedSet.has(avatar.id);
                const isEquipped = currentAvatarId === avatar.id;
                const canAfford = userCoins >= avatar.coin_cost;
                const isPurchasing = purchasing === avatar.id;
                const isEquipping = equipping === avatar.id;

                return (
                  <Card
                    key={avatar.id}
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isEquipped && "ring-2 ring-primary",
                      !isOwned && avatar.rarity !== "common" && "opacity-75"
                    )}
                  >
                    {/* Avatar Image Placeholder */}
                    <div
                      className={cn(
                        "relative flex h-32 items-center justify-center bg-gradient-to-br",
                        rarity === "common" && "from-gray-100 to-gray-200",
                        rarity === "uncommon" && "from-green-100 to-emerald-200",
                        rarity === "rare" && "from-blue-100 to-indigo-200",
                        rarity === "epic" && "from-purple-100 to-violet-200",
                        rarity === "legendary" && "from-amber-100 to-orange-200"
                      )}
                    >
                      {/* Avatar emoji placeholder */}
                      <span className="text-5xl">
                        {avatar.category === "animal" && (avatar.id.includes("cat") ? "🐱" : avatar.id.includes("rabbit") ? "🐰" : avatar.id.includes("fox") ? "🦊" : "🐾")}
                        {avatar.category === "character" && (avatar.id.includes("samurai") ? "⛩️" : avatar.id.includes("maiko") ? "👘" : "👤")}
                        {avatar.category === "mascot" && (avatar.id.includes("tanuki") ? "🦝" : avatar.id.includes("kitsune") ? "🦊" : "🎭")}
                        {avatar.category === "starter" && "😊"}
                      </span>

                      {/* Equipped badge */}
                      {isEquipped && (
                        <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                          Dipakai
                        </div>
                      )}

                      {/* Rarity badge */}
                      <div
                        className={cn(
                          "absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium",
                          rarity === "common" && "bg-gray-200 text-gray-600",
                          rarity === "uncommon" && "bg-green-200 text-green-700",
                          rarity === "rare" && "bg-blue-200 text-blue-700",
                          rarity === "epic" && "bg-purple-200 text-purple-700",
                          rarity === "legendary" && "bg-amber-200 text-amber-700"
                        )}
                      >
                        {RARITY_LABELS[rarity]}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-medium">{avatar.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{avatar.description}</p>

                      <div className="mt-3 flex items-center justify-between">
                        {isOwned ? (
                          <>
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <Check className="h-4 w-4" />
                              Dimiliki
                            </span>
                            <Button
                              size="sm"
                              variant={isEquipped ? "outline" : "default"}
                              disabled={isEquipping || isEquipped}
                              onClick={() => handleEquip(avatar.id)}
                            >
                              {isEquipped ? "Dipakai" : isEquipping ? "Memakai..." : "Pakai"}
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex items-center gap-1 text-sm">
                              <Coins className="h-4 w-4 text-amber-500" />
                              {avatar.coin_cost}
                            </span>
                            <Button
                              size="sm"
                              disabled={!canAfford || isPurchasing || loading}
                              onClick={() => handlePurchase(avatar.id)}
                            >
                              {isPurchasing ? "Membeli..." : canAfford ? "Beli" : "Koin Kurang"}
                            </Button>
                          </>
                        )}
                      </div>

                      {!isOwned && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Level {avatar.level_required} untuk membuka
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
