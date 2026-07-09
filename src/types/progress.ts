/**
 * Progress tracking types for user learning activity.
 */

import type { JLPTLevel } from "./common";

// ============================================
// User Progress
// ============================================

/**
 * User's overall progress data.
 */
export interface UserProgress {
  user_id: string;
  total_xp: number;
  level: number;
  streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  coin_balance: number;
  lifetime_coins: number;
  current_avatar_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Level configuration.
 */
export interface LevelConfig {
  level: number;
  xp_required: number;
  title: string;
  color?: string;
}

/**
 * XP level thresholds and titles.
 */
export const LEVEL_CONFIG: LevelConfig[] = [
  { level: 1, xp_required: 0, title: "Pemula" },
  { level: 2, xp_required: 100, title: "Pelajar Baru" },
  { level: 3, xp_required: 300, title: "Pembelajar" },
  { level: 4, xp_required: 600, title: "Penjelajah" },
  { level: 5, xp_required: 1000, title: "Murid" },
  { level: 6, xp_required: 1500, title: "Cendekiawan" },
  { level: 7, xp_required: 2100, title: "Magang" },
  { level: 8, xp_required: 2800, title: "Ahli" },
  { level: 9, xp_required: 3600, title: "Ahli Bahasa" },
  { level: 10, xp_required: 4500, title: "Guru Bahasa" },
];

/**
 * Calculate level from XP.
 */
export function calculateLevel(xp: number): LevelConfig {
  let currentLevel = LEVEL_CONFIG[0];
  for (const level of LEVEL_CONFIG) {
    if (xp >= level.xp_required) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

/**
 * XP required for next level.
 */
export function getXPForNextLevel(level: number): number | null {
  const nextLevel = LEVEL_CONFIG.find((l) => l.level === level + 1);
  return nextLevel?.xp_required ?? null;
}

// ============================================
// XP Rewards
// ============================================

/**
 * XP reward amounts for different actions.
 */
export const XP_REWARDS = {
  lesson_complete: 50,
  quiz_correct: 5,
  quiz_perfect: 20,
  vocabulary_learned: 10,
  kanji_learned: 15,
  srs_review: 2,
  daily_streak_bonus: 10,
  achievement_unlocked: 25,
} as const;

/**
 * XP source types.
 */
export type XPSource =
  | "lesson_complete"
  | "quiz_correct"
  | "quiz_perfect"
  | "vocabulary_learned"
  | "kanji_learned"
  | "srs_review"
  | "daily_streak_bonus"
  | "achievement_unlocked";

// ============================================
// Streak
// ============================================

/**
 * Streak information.
 */
export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_active_today: boolean;
}

/**
 * Check if streak should continue based on dates.
 */
export function isStreakActive(
  lastActivityDate: string | null,
  timezone: string = "UTC"
): boolean {
  if (!lastActivityDate) return false;

  const today = new Date();
  const lastActivity = new Date(lastActivityDate);

  // Reset to midnight for comparison
  const todayMidnight = new Date(today.toLocaleDateString("en-US", { timeZone: timezone }));
  const lastMidnight = new Date(lastActivity.toLocaleDateString("en-US", { timeZone: timezone }));

  const diffDays = Math.floor(
    (todayMidnight.getTime() - lastMidnight.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays <= 1;
}

// ============================================
// Daily Stats
// ============================================

/**
 * Daily activity statistics.
 */
export interface DailyStats {
  id: string;
  user_id: string;
  date: string;
  xp_earned: number;
  lessons_completed: number;
  time_spent_minutes: number;
  accuracy: number | null;
  created_at: string;
}

/**
 * Weekly stats summary.
 */
export interface WeeklyStats {
  week_start: string;
  week_end: string;
  total_xp: number;
  total_lessons: number;
  total_time_minutes: number;
  average_accuracy: number;
  days_active: number;
  daily_stats: DailyStats[];
}

// ============================================
// Lesson Progress
// ============================================

/**
 * Lesson progress record.
 */
export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  lesson_type: LessonType;
  is_completed: boolean;
  progress_percent: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

import type { LessonType } from "./content";

// ============================================
// Progress Summary
// ============================================

/**
 * Overall learning progress summary.
 */
export interface ProgressSummary {
  user_id: string;
  level: LevelConfig;
  xp: number;
  xp_to_next_level: number | null;
  streak: StreakInfo;
  vocabulary: VocabularyProgress;
  kanji: KanjiProgress;
  grammar: GrammarProgress;
  lessons: LessonProgressStats;
  quizzes: QuizProgressStats;
}

/**
 * Vocabulary learning progress.
 */
export interface VocabularyProgress {
  total: number;
  learned: number;
  learning: number;
  mastered: number;
  by_level: Record<JLPTLevel, { total: number; learned: number }>;
}

/**
 * Kanji learning progress.
 */
export interface KanjiProgress {
  total: number;
  learned: number;
  by_level: Record<JLPTLevel, { total: number; learned: number }>;
}

/**
 * Grammar learning progress.
 */
export interface GrammarProgress {
  total: number;
  learned: number;
  by_level: Record<JLPTLevel, { total: number; learned: number }>;
}

/**
 * Lesson completion stats.
 */
export interface LessonProgressStats {
  total: number;
  completed: number;
  by_type: Record<LessonType, { total: number; completed: number }>;
}

/**
 * Quiz performance stats.
 */
export interface QuizProgressStats {
  total_attempts: number;
  average_score: number;
  best_score: number;
  by_type: Record<string, { attempts: number; average: number }>;
}
