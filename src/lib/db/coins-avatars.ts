/**
 * Coin and Avatar database access helpers.
 * Uses browser client to avoid server-only dependencies.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { CoinTransactionType, Avatar, UserAvatar } from "@/types/coins-avatars";
import { DEFAULT_AVATARS } from "@/types/coins-avatars";

// Browser-safe Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type { CoinTransactionType, Avatar, UserAvatar };
export { DEFAULT_AVATARS };

// ============================================
// Coin Balance
// ============================================

export async function getCoinBalance(userId: string): Promise<number> {
  const { data } = await supabase
    .from("user_progress")
    .select("coin_balance")
    .eq("user_id", userId)
    .single();

  return data?.coin_balance ?? 0;
}

// ============================================
// Coin Transaction
// ============================================

export async function recordCoinTransaction(
  userId: string,
  amount: number,
  type: CoinTransactionType,
  description: string
): Promise<void> {
  await supabase.from("coin_transactions").insert({
    user_id: userId,
    amount,
    type,
    description,
  });
}

// ============================================
// Avatars
// ============================================

export function getAvailableAvatars(): Avatar[] {
  return DEFAULT_AVATARS;
}

export interface UserAvatarWithDetails extends UserAvatar {
  avatar: Avatar;
}

export async function getUserAvatars(userId: string): Promise<UserAvatarWithDetails[]> {
  const { data } = await supabase
    .from("user_avatar")
    .select("*")
    .eq("user_id", userId);

  if (!data) return [];

  return data
    .map((ua) => {
      const avatar = DEFAULT_AVATARS.find((a) => a.id === ua.avatar_id);
      return avatar ? { ...avatar, ...ua } : null;
    })
    .filter(Boolean) as UserAvatarWithDetails[];
}

export async function userOwnsAvatar(userId: string, avatarId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_avatar")
    .select("id")
    .eq("user_id", userId)
    .eq("avatar_id", avatarId)
    .single();
  return !!data;
}

export async function purchaseAvatar(
  userId: string,
  avatarId: string
): Promise<{ success: boolean; error?: string }> {
  const avatar = DEFAULT_AVATARS.find((a) => a.id === avatarId);
  if (!avatar) {
    return { success: false, error: "Avatar tidak ditemukan" };
  }

  // Check coins first
  const balance = await getCoinBalance(userId);
  if (balance < avatar.coin_cost) {
    return { success: false, error: `Koin tidak cukup` };
  }

  // Deduct coins
  await supabase
    .from("user_progress")
    .update({ coin_balance: balance - avatar.coin_cost })
    .eq("user_id", userId);

  // Grant avatar
  const { error } = await supabase.from("user_avatar").insert({
    user_id: userId,
    avatar_id: avatarId,
  });

  if (error) {
    // Refund coins
    await supabase
      .from("user_progress")
      .update({ coin_balance: balance })
      .eq("user_id", userId);
    return { success: false, error: "Gagal membeli avatar" };
  }

  return { success: true };
}

// ============================================
// Equip Avatar
// ============================================

export async function equipAvatar(
  userId: string,
  avatarId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if user owns the avatar
  const ownsAvatar = await userOwnsAvatar(userId, avatarId);
  if (!ownsAvatar) {
    return { success: false, error: "Anda belum memiliki avatar ini" };
  }

  // Unequip all avatars first
  await supabase
    .from("user_avatar")
    .update({ is_equipped: false })
    .eq("user_id", userId);

  // Equip the selected avatar
  const { error } = await supabase
    .from("user_avatar")
    .update({ is_equipped: true })
    .eq("user_id", userId)
    .eq("avatar_id", avatarId);

  if (error) {
    return { success: false, error: "Gagal mengenakkan avatar" };
  }

  return { success: true };
}

// ============================================
// Get Current Avatar
// ============================================

export async function getCurrentAvatar(userId: string): Promise<Avatar | null> {
  const { data } = await supabase
    .from("user_avatar")
    .select("avatar_id")
    .eq("user_id", userId)
    .eq("is_equipped", true)
    .single();

  if (!data) {
    // Return default avatar if none equipped
    return DEFAULT_AVATARS.find((a) => a.is_default) || DEFAULT_AVATARS[0];
  }

  return DEFAULT_AVATARS.find((a) => a.id === data.avatar_id) || null;
}
