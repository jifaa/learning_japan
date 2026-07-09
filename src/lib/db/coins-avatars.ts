/**
 * Coin and Avatar database access helpers.
 */

import { createClient } from "@/lib/supabase/server";
import type { CoinTransaction, CoinTransactionType, UserCoinBalance, Avatar, UserAvatar, UserAvatarWithDetails } from "@/types/coins-avatars";
import { DEFAULT_AVATARS, COIN_REWARDS } from "@/types/coins-avatars";

// ============================================
// Coin Balance
// ============================================

/**
 * Get user's coin balance.
 */
export async function getCoinBalance(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_progress")
    .select("coin_balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.coin_balance ?? 0;
}

/**
 * Add coins to user balance.
 */
export async function addCoins(
  userId: string,
  amount: number,
  type: CoinTransactionType,
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  const supabase = await createClient();

  // Get current balance
  const { data: progress } = await supabase
    .from("user_progress")
    .select("coin_balance, lifetime_coins")
    .eq("user_id", userId)
    .single();

  if (!progress) {
    return { success: false, newBalance: 0 };
  }

  const currentBalance = progress.coin_balance ?? 0;
  const lifetimeCoins = progress.lifetime_coins ?? 0;
  const newBalance = currentBalance + amount;

  // Update balance
  const { error: updateError } = await supabase
    .from("user_progress")
    .update({
      coin_balance: newBalance,
      lifetime_coins: lifetimeCoins + amount,
    })
    .eq("user_id", userId);

  if (updateError) {
    return { success: false, newBalance: currentBalance };
  }

  // Log transaction
  await supabase.from("coin_transactions").insert({
    user_id: userId,
    amount,
    type,
    description,
  });

  return { success: true, newBalance };
}

/**
 * Spend coins.
 */
export async function spendCoins(
  userId: string,
  amount: number,
  type: CoinTransactionType,
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  const supabase = await createClient();

  // Get current balance
  const { data: progress } = await supabase
    .from("user_progress")
    .select("coin_balance")
    .eq("user_id", userId)
    .single();

  if (!progress) {
    return { success: false, newBalance: 0 };
  }

  const currentBalance = progress.coin_balance ?? 0;

  if (currentBalance < amount) {
    return { success: false, newBalance: currentBalance };
  }

  const newBalance = currentBalance - amount;

  // Update balance
  const { error: updateError } = await supabase
    .from("user_progress")
    .update({ coin_balance: newBalance })
    .eq("user_id", userId);

  if (updateError) {
    return { success: false, newBalance: currentBalance };
  }

  // Log transaction
  await supabase.from("coin_transactions").insert({
    user_id: userId,
    amount: -amount,
    type,
    description,
  });

  return { success: true, newBalance };
}

/**
 * Get coin transaction history.
 */
export async function getCoinTransactions(
  userId: string,
  limit = 20
): Promise<CoinTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coin_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as CoinTransaction[];
}

// ============================================
// Avatars
// ============================================

/**
 * Get all available avatars.
 */
export async function getAvailableAvatars(): Promise<Avatar[]> {
  return DEFAULT_AVATARS;
}

/**
 * Get user's owned avatars.
 */
export async function getUserAvatars(userId: string): Promise<UserAvatarWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_avatar")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  const userAvatars = data as UserAvatar[];
  const result: UserAvatarWithDetails[] = [];

  for (const ua of userAvatars) {
    const avatar = DEFAULT_AVATARS.find((a) => a.id === ua.avatar_id);
    if (avatar) {
      result.push({ ...ua, avatar });
    }
  }

  return result;
}

/**
 * Check if user owns an avatar.
 */
export async function userOwnsAvatar(userId: string, avatarId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_avatar")
    .select("id")
    .eq("user_id", userId)
    .eq("avatar_id", avatarId)
    .single();

  return !!data;
}

/**
 * Purchase avatar.
 */
export async function purchaseAvatar(
  userId: string,
  avatarId: string
): Promise<{ success: boolean; error?: string }> {
  const avatar = DEFAULT_AVATARS.find((a) => a.id === avatarId);
  if (!avatar) {
    return { success: false, error: "Avatar tidak ditemukan" };
  }

  // Check if already owned
  const owned = await userOwnsAvatar(userId, avatarId);
  if (owned) {
    return { success: false, error: "Avatar sudah dimiliki" };
  }

  // Check coins
  const balance = await getCoinBalance(userId);
  if (balance < avatar.coin_cost) {
    return { success: false, error: `Koin tidak cukup (butuh ${avatar.coin_cost})` };
  }

  // Spend coins
  const spendResult = await spendCoins(
    userId,
    avatar.coin_cost,
    "spent_avatar",
    `Membeli avatar: ${avatar.name}`
  );

  if (!spendResult.success) {
    return { success: false, error: "Gagal membeli avatar" };
  }

  // Grant avatar
  const supabase = await createClient();
  const { error } = await supabase.from("user_avatar").insert({
    user_id: userId,
    avatar_id: avatarId,
    is_equipped: false,
  });

  if (error) {
    // Refund coins
    await addCoins(
      userId,
      avatar.coin_cost,
      "refund",
      `Refund: ${avatar.name}`
    );
    return { success: false, error: "Gagal membeli avatar" };
  }

  return { success: true };
}

/**
 * Equip avatar.
 */
export async function equipAvatar(
  userId: string,
  avatarId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check ownership
  const owned = await userOwnsAvatar(userId, avatarId);
  if (!owned) {
    return { success: false, error: "Avatar belum dimiliki" };
  }

  // Unequip all avatars first
  await supabase
    .from("user_avatar")
    .update({ is_equipped: false })
    .eq("user_id", userId);

  // Equip selected avatar
  const { error } = await supabase
    .from("user_avatar")
    .update({ is_equipped: true })
    .eq("user_id", userId)
    .eq("avatar_id", avatarId);

  if (error) {
    return { success: false, error: "Gagal memasang avatar" };
  }

  // Update current avatar in user_progress
  await supabase
    .from("user_progress")
    .update({ current_avatar_id: avatarId })
    .eq("user_id", userId);

  return { success: true };
}

/**
 * Get user's current avatar.
 */
export async function getCurrentAvatar(userId: string): Promise<Avatar | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_progress")
    .select("current_avatar_id")
    .eq("user_id", userId)
    .single();

  if (!data?.current_avatar_id) {
    return DEFAULT_AVATARS[0]; // Return default avatar
  }

  const avatar = DEFAULT_AVATARS.find((a) => a.id === data.current_avatar_id);
  return avatar ?? DEFAULT_AVATARS[0];
}

/**
 * Get avatars that user can unlock.
 */
export async function getUnlockableAvatars(
  userId: string,
  userLevel: number,
  userCoins: number
): Promise<{ avatar: Avatar; canUnlock: boolean; reason: string | null }[]> {
  const owned = await getUserAvatars(userId);
  const ownedIds = new Set(owned.map((ua) => ua.avatar_id));

  return DEFAULT_AVATARS.map((avatar) => {
    if (ownedIds.has(avatar.id)) {
      return { avatar, canUnlock: false, reason: "Sudah dimiliki" };
    }
    if (userLevel < avatar.level_required) {
      return {
        avatar,
        canUnlock: false,
        reason: `Butuh Level ${avatar.level_required}`,
      };
    }
    if (userCoins < avatar.coin_cost) {
      return {
        avatar,
        canUnlock: false,
        reason: `Butuh ${avatar.coin_cost - userCoins} koin lagi`,
      };
    }
    return { avatar, canUnlock: true, reason: null };
  });
}
