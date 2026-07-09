/**
 * Achievement and badge types for gamification.
 */

// ============================================
// Achievement Definitions
// ============================================

/**
 * Achievement badge definition.
 */
export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement_type: string;
  requirement_target: number;
  xp_reward: number;
}

/**
 * Achievement category.
 */
export type AchievementCategory =
  | "streak"    // Daily streak achievements
  | "progress"  // Learning progress achievements
  | "mastery"   // Mastery/proficiency achievements
  | "social"    // Social/community achievements
  | "special";  // Special/limited achievements

// ============================================
// User Achievements
// ============================================

/**
 * User's earned achievement.
 */
export interface UserAchievement {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

/**
 * User achievement with badge details.
 */
export interface UserAchievementWithBadge extends UserAchievement {
  badge: AchievementBadge;
}

// ============================================
// Achievement Progress
// ============================================

/**
 * Progress towards an achievement.
 */
export interface AchievementProgress {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  current: number;
  target: number;
  progress_percent: number;
  is_earned: boolean;
  earned_at: string | null;
  xp_reward: number;
}

/**
 * Achievement check result.
 */
export interface AchievementCheckResult {
  badge_id: string;
  is_new: boolean;
  badge?: AchievementBadge;
}

// ============================================
// Common Achievement Definitions
// ============================================

/**
 * Pre-defined achievement badge IDs (maps to seed data achievement_key column).
 */
export const ACHIEVEMENT_IDS = {
  // Streak
  STREAK_3: "streak_3_days",
  STREAK_7: "streak_7_days",
  STREAK_14: "streak_14_days",
  STREAK_30: "streak_30_days",
  STREAK_100: "streak_100_days",
  STREAK_365: "streak_365_days",
  // Progress
  FIRST_LESSON: "first_lesson",
  FIRST_QUIZ: "first_quiz",
  FIRST_SRS: "first_srs_review",
  LESSONS_10: "lessons_10",
  LESSONS_50: "lessons_50",
  LESSONS_100: "lessons_100",
  // Vocabulary
  VOCAB_50: "vocabulary_50",
  VOCAB_100: "vocabulary_100",
  VOCAB_500: "vocabulary_500",
  VOCAB_1000: "vocabulary_1000",
  // Kanji
  KANJI_50: "kanji_50",
  KANJI_100: "kanji_100",
  KANJI_500: "kanji_500",
  // Grammar
  GRAMMAR_10: "grammar_10",
  GRAMMAR_50: "grammar_50",
  GRAMMAR_100: "grammar_100",
  // Perfect quiz
  PERFECT_QUIZ: "perfect_quiz",
  QUIZ_STREAK_10: "quiz_streak_10",
  SPEED_DEMON: "speed_demon",
  // Special
  EARLY_BIRD: "early_bird",
  NIGHT_OWL: "night_owl",
  MARATHON: "marathon",
} as const;

// ============================================
// Default Achievement Definitions (Indonesian labels)
// ============================================

/**
 * Default achievement badges to seed.
 * Labels in Bahasa Indonesia.
 */
export const DEFAULT_ACHIEVEMENTS: AchievementBadge[] = [
  // Streak
  {
    id: ACHIEVEMENT_IDS.STREAK_3,
    name: "Streak 3 Hari",
    description: "Belajar 3 hari berturut-turut",
    icon: "flame",
    category: "streak",
    requirement_type: "streak",
    requirement_target: 3,
    xp_reward: 25,
  },
  {
    id: ACHIEVEMENT_IDS.STREAK_7,
    name: "Pejuang Mingguan",
    description: "Belajar 7 hari berturut-turut",
    icon: "flame",
    category: "streak",
    requirement_type: "streak",
    requirement_target: 7,
    xp_reward: 50,
  },
  {
    id: ACHIEVEMENT_IDS.STREAK_30,
    name: "Bulan Pertempuran",
    description: "Belajar 30 hari berturut-turut",
    icon: "trophy",
    category: "streak",
    requirement_type: "streak",
    requirement_target: 30,
    xp_reward: 200,
  },

  // Progress
  {
    id: ACHIEVEMENT_IDS.FIRST_LESSON,
    name: "Langkah Pertama",
    description: "Selesaikan pelajaran pertama",
    icon: "star",
    category: "progress",
    requirement_type: "lessons_completed",
    requirement_target: 1,
    xp_reward: 10,
  },
  {
    id: ACHIEVEMENT_IDS.LESSONS_10,
    name: "Pelajar Disiplin",
    description: "Selesaikan 10 pelajaran",
    icon: "book",
    category: "progress",
    requirement_type: "lessons_completed",
    requirement_target: 10,
    xp_reward: 50,
  },

  // Vocabulary
  {
    id: ACHIEVEMENT_IDS.VOCAB_50,
    name: "Pembuat Kosakata",
    description: "Pelajari 50 kosakata",
    icon: "book-open",
    category: "mastery",
    requirement_type: "vocabulary_learned",
    requirement_target: 50,
    xp_reward: 50,
  },
  {
    id: ACHIEVEMENT_IDS.VOCAB_100,
    name: "Kolektor Kata",
    description: "Pelajari 100 kosakata",
    icon: "book-open",
    category: "mastery",
    requirement_type: "vocabulary_learned",
    requirement_target: 100,
    xp_reward: 100,
  },
  {
    id: ACHIEVEMENT_IDS.VOCAB_500,
    name: "Ahli Kosakata",
    description: "Pelajari 500 kosakata",
    icon: "book-open",
    category: "mastery",
    requirement_type: "vocabulary_learned",
    requirement_target: 500,
    xp_reward: 250,
  },

  // Kanji
  {
    id: ACHIEVEMENT_IDS.KANJI_50,
    name: "Penjelajah Kanji",
    description: "Pelajari 50 karakter kanji",
    icon: "kanji",
    category: "mastery",
    requirement_type: "kanji_learned",
    requirement_target: 50,
    xp_reward: 75,
  },

  // Grammar
  {
    id: ACHIEVEMENT_IDS.GRAMMAR_10,
    name: "Pembuat Kalimat",
    description: "Pelajari 10 pola tata bahasa",
    icon: "brain-circuit",
    category: "mastery",
    requirement_type: "grammar_learned",
    requirement_target: 10,
    xp_reward: 40,
  },

  // Special
  {
    id: ACHIEVEMENT_IDS.PERFECT_QUIZ,
    name: "Perfeksionis",
    description: "Dapatkan nilai sempurna di kuis",
    icon: "check-circle",
    category: "special",
    requirement_type: "perfect_quiz",
    requirement_target: 1,
    xp_reward: 30,
  },
  {
    id: ACHIEVEMENT_IDS.MARATHON,
    name: "Pelari Maraton",
    description: "Tinjau 50 kartu dalam satu sesi",
    icon: "layers",
    category: "special",
    requirement_type: "reviews_session",
    requirement_target: 50,
    xp_reward: 100,
  },
];

// ============================================
// Achievement Checker
// ============================================

/**
 * Context for checking achievements.
 */
export interface AchievementCheckContext {
  user_id: string;
  lessons_completed?: number;
  vocabulary_learned?: number;
  kanji_learned?: number;
  grammar_learned?: number;
  current_streak?: number;
  quiz_score?: number;
  quiz_time_seconds?: number;
}

/**
 * Check if an achievement condition is met.
 */
export function checkAchievementCondition(
  achievement: AchievementBadge,
  context: AchievementCheckContext
): boolean {
  switch (achievement.requirement_type) {
    case "streak":
      return (context.current_streak ?? 0) >= achievement.requirement_target;
    case "lessons_completed":
      return (context.lessons_completed ?? 0) >= achievement.requirement_target;
    case "vocabulary_learned":
      return (context.vocabulary_learned ?? 0) >= achievement.requirement_target;
    case "kanji_learned":
      return (context.kanji_learned ?? 0) >= achievement.requirement_target;
    case "grammar_learned":
      return (context.grammar_learned ?? 0) >= achievement.requirement_target;
    case "perfect_quiz":
      return (context.quiz_score ?? 0) === 100;
    default:
      return false;
  }
}

/**
 * Calculate progress towards an achievement.
 */
export function calculateAchievementProgress(
  achievement: AchievementBadge,
  context: AchievementCheckContext
): number {
  let current = 0;

  switch (achievement.requirement_type) {
    case "streak":
      current = context.current_streak ?? 0;
      break;
    case "lessons_completed":
      current = context.lessons_completed ?? 0;
      break;
    case "vocabulary_learned":
      current = context.vocabulary_learned ?? 0;
      break;
    case "kanji_learned":
      current = context.kanji_learned ?? 0;
      break;
    case "grammar_learned":
      current = context.grammar_learned ?? 0;
      break;
    case "perfect_quiz":
      current = context.quiz_score === 100 ? 1 : 0;
      break;
  }

  return Math.min(current / achievement.requirement_target, 1);
}
