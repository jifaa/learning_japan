/**
 * Coin and Avatar types for gamification.
 */

// ============================================
// Coins
// ============================================

/**
 * User's coin balance and transaction history.
 */
export interface UserCoinBalance {
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  updated_at: string;
}

/**
 * Coin transaction types.
 */
export type CoinTransactionType =
  | "earned_quiz"
  | "earned_streak"
  | "earned_achievement"
  | "earned_review"
  | "earned_daily_bonus"
  | "earned_level_up"
  | "spent_avatar"
  | "spent_theme"
  | "spent_item"
  | "refund";

/**
 * Coin transaction record.
 */
export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: CoinTransactionType;
  description: string;
  created_at: string;
}

/**
 * Coin reward amounts.
 */
export const COIN_REWARDS = {
  quiz_perfect: 10,
  quiz_great: 5,
  quiz_good: 2,
  streak_daily: 5,
  streak_weekly: 20,
  achievement_bronze: 15,
  achievement_silver: 30,
  achievement_gold: 50,
  achievement_platinum: 100,
  review_complete: 1,
  daily_login: 3,
  level_up_small: 10,
  level_up_medium: 25,
  level_up_large: 50,
} as const;

// ============================================
// Avatars
// ============================================

/**
 * Avatar category.
 */
export type AvatarCategory = "starter" | "animal" | "character" | "mascot" | "seasonal" | "special";

/**
 * Avatar rarity.
 */
export type AvatarRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

/**
 * Avatar definition.
 */
export interface Avatar {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: AvatarCategory;
  rarity: AvatarRarity;
  coin_cost: number;
  level_required: number;
  is_default: boolean;
  is_available: boolean;
}

/**
 * User's owned avatar.
 */
export interface UserAvatar {
  id: string;
  user_id: string;
  avatar_id: string;
  is_equipped: boolean;
  acquired_at: string;
}

/**
 * User avatar with details.
 */
export interface UserAvatarWithDetails extends UserAvatar {
  avatar: Avatar;
}

/**
 * Avatar unlock requirements.
 */
export const AVATAR_UNLOCK_REQUIREMENTS = {
  starter: { level: 1, coins: 0 },
  animal: { level: 3, coins: 100 },
  character: { level: 5, coins: 250 },
  mascot: { level: 8, coins: 500 },
  seasonal: { level: 10, coins: 750 },
  special: { level: 15, coins: 1000 },
} as const;

/**
 * Rarity colors.
 */
export const RARITY_COLORS: Record<AvatarRarity, string> = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-amber-400",
};

/**
 * Rarity labels (Indonesian).
 */
export const RARITY_LABELS: Record<AvatarRarity, string> = {
  common: " Umum",
  uncommon: " Langka",
  rare: " Rare",
  epic: " Epic",
  legendary: " Legendaris",
};

/**
 * Default avatars available to all users.
 */
export const DEFAULT_AVATARS: Avatar[] = [
  // Starter avatars (free, level 1)
  {
    id: "avatar_student",
    name: "Pelajar Baru",
    description: "Avatar starter untuk pemula",
    image_url: "/avatars/student.svg",
    category: "starter",
    rarity: "common",
    coin_cost: 0,
    level_required: 1,
    is_default: true,
    is_available: true,
  },
  {
    id: "avatar_school_boy",
    name: "Murid Sekolah",
    description: "Murid sekolah Jepang",
    image_url: "/avatars/school-boy.svg",
    category: "starter",
    rarity: "common",
    coin_cost: 0,
    level_required: 1,
    is_default: false,
    is_available: true,
  },
  // Animal avatars
  {
    id: "avatar_cat",
    name: "Kucing Jepang",
    description: "Kucing Imut berwarna oranye",
    image_url: "/avatars/cat.svg",
    category: "animal",
    rarity: "common",
    coin_cost: 100,
    level_required: 3,
    is_default: false,
    is_available: true,
  },
  {
    id: "avatar_rabbit",
    name: "Kelinci Salju",
    description: "Kelinci putih yang menggemaskan",
    image_url: "/avatars/rabbit.svg",
    category: "animal",
    rarity: "uncommon",
    coin_cost: 200,
    level_required: 5,
    is_default: false,
    is_available: true,
  },
  {
    id: "avatar_fox",
    name: "Rubah Cerita",
    description: "Rubah mitologi Jepang",
    image_url: "/avatars/fox.svg",
    category: "animal",
    rarity: "rare",
    coin_cost: 350,
    level_required: 7,
    is_default: false,
    is_available: true,
  },
  // Character avatars
  {
    id: "avatar_samurai",
    name: "Samurai Muda",
    description: "Samurai dengan armor lengkap",
    image_url: "/avatars/samurai.svg",
    category: "character",
    rarity: "rare",
    coin_cost: 400,
    level_required: 8,
    is_default: false,
    is_available: true,
  },
  {
    id: "avatar_maiko",
    name: "Maiko",
    description: "Gadis peserta geisha",
    image_url: "/avatars/maiko.svg",
    category: "character",
    rarity: "epic",
    coin_cost: 600,
    level_required: 10,
    is_default: false,
    is_available: true,
  },
  // Mascot avatars
  {
    id: "avatar_tanuki",
    name: "Tanuki",
    description: "Rubah tanah mitologi Jepang",
    image_url: "/avatars/tanuki.svg",
    category: "mascot",
    rarity: "epic",
    coin_cost: 750,
    level_required: 12,
    is_default: false,
    is_available: true,
  },
  {
    id: "avatar_kitsune",
    name: "Kitsune",
    description: "Rubah berekor sembilan",
    image_url: "/avatars/kitsune.svg",
    category: "mascot",
    rarity: "legendary",
    coin_cost: 1000,
    level_required: 15,
    is_default: false,
    is_available: true,
  },
];

/**
 * Get avatar unlock status for a user.
 */
export function getAvatarUnlockStatus(
  avatar: Avatar,
  userLevel: number,
  userCoins: number,
  isOwned: boolean
): { canUnlock: boolean; reason: string | null } {
  if (isOwned) {
    return { canUnlock: false, reason: "Sudah dimiliki" };
  }
  if (userLevel < avatar.level_required) {
    return {
      canUnlock: false,
      reason: `Butuh Level ${avatar.level_required}`,
    };
  }
  if (userCoins < avatar.coin_cost) {
    return {
      canUnlock: false,
      reason: `Butuh ${avatar.coin_cost - userCoins} koin lagi`,
    };
  }
  return { canUnlock: true, reason: null };
}
