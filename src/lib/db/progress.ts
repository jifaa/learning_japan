/**
 * Progress tracking database access helpers.
 * All functions scope data by authenticated user.
 */

import { createClient } from "@/lib/supabase/server";
import type { UserProgress, DailyStats, LessonProgress, StreakInfo, ProgressSummary } from "@/types/progress";
import { calculateLevel, LEVEL_CONFIG } from "@/types/progress";
import type { JLPTLevel } from "@/types/common";

// ============================================
// User Progress
// ============================================

/**
 * Get or create user progress record.
 */
export async function getOrCreateUserProgress(userId: string) {
  const supabase = await createClient();

  // Try to get existing progress
  const { data: existing, error: selectError } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing) {
    return existing as UserProgress;
  }

  // If error is NOT "no rows" (PGRST116), something went wrong
  if (selectError && selectError.code !== "PGRST116") {
    console.warn("[getOrCreateUserProgress] select failed:", selectError.message);
    // Return default progress instead of throwing
    return {
      user_id: userId, total_xp: 0, level: 1, streak: 0, longest_streak: 0,
      last_activity_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    } as UserProgress;
  }

  // Create new progress record
  const { data, error: insertError } = await supabase
    .from("user_progress")
    .insert({
      user_id: userId,
      total_xp: 0,
      level: 1,
      streak: 0,
      longest_streak: 0,
    })
    .select()
    .single();

  if (insertError) {
    console.warn("[getOrCreateUserProgress] insert failed:", insertError.message);
    // Return default if insert fails (maybe table doesn't exist)
    return {
      user_id: userId, total_xp: 0, level: 1, streak: 0, longest_streak: 0,
      last_activity_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    } as UserProgress;
  }

  return data as UserProgress;
}

/**
 * Add XP to user progress.
 */
export async function addXP(userId: string, amount: number) {
  const supabase = await createClient();

  // Get current progress
  const current = await getOrCreateUserProgress(userId);
  const newXP = current.total_xp + amount;
  const newLevel = calculateLevel(newXP);

  const { data, error } = await supabase
    .from("user_progress")
    .update({
      total_xp: newXP,
      level: newLevel.level,
      last_activity_date: new Date().toISOString().split("T")[0],
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProgress;
}

/**
 * Update streak.
 */
export async function updateStreak(userId: string) {
  const supabase = await createClient();

  const current = await getOrCreateUserProgress(userId);
  const today = new Date().toISOString().split("T")[0];
  const lastActivity = current.last_activity_date;

  let newStreak = current.streak;
  let newLongest = current.longest_streak;

  // Calculate actual days since last activity
  let diffDays = 0;
  if (lastActivity) {
    const lastDate = new Date(lastActivity);
    const todayDate = new Date(today);
    diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  if (!lastActivity) {
    // First activity ever
    newStreak = 1;
  } else if (diffDays === 0) {
    // Already active today - keep streak as is
    // No change needed
  } else if (diffDays === 1) {
    // Active yesterday - continue streak
    newStreak = current.streak + 1;
  } else {
    // Gap of 2+ days - reset streak to 1
    newStreak = 1;
  }

  if (newStreak > newLongest) {
    newLongest = newStreak;
  }

  const { data, error } = await supabase
    .from("user_progress")
    .update({
      streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: today,
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProgress;
}

/**
 * Get streak info.
 */
export async function getStreakInfo(userId: string): Promise<StreakInfo> {
  try {
    const progress = await getOrCreateUserProgress(userId);
    const today = new Date().toISOString().split("T")[0];
    const lastActivity = progress.last_activity_date;

    // Calculate if streak is active today
    let streakActiveToday = false;
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      streakActiveToday = diffDays === 0;
    }

    return {
      current_streak: progress.streak,
      longest_streak: progress.longest_streak,
      last_activity_date: progress.last_activity_date,
      streak_active_today: streakActiveToday,
    };
  } catch (err) {
    console.warn("[getStreakInfo] failed:", err);
    return {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      streak_active_today: false,
    };
  }
}

// ============================================
// Daily Stats
// ============================================

/**
 * Get or create today's stats.
 */
export async function getOrCreateTodayStats(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Check for existing
  const { data: existing } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (existing) {
    return existing as DailyStats;
  }

  // Create new
  const { data, error } = await supabase
    .from("daily_stats")
    .insert({
      user_id: userId,
      date: today,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DailyStats;
}

/**
 * Update daily stats with activity.
 */
export async function recordDailyActivity(
  userId: string,
  activity: {
    xp?: number;
    lessonsCompleted?: number;
    timeMinutes?: number;
    accuracy?: number;
  }
) {
  const supabase = await createClient();
  const stats = await getOrCreateTodayStats(userId);

  const updates: Partial<DailyStats> = {};

  if (activity.xp !== undefined) {
    updates.xp_earned = (stats.xp_earned ?? 0) + activity.xp;
  }
  if (activity.lessonsCompleted !== undefined) {
    updates.lessons_completed = (stats.lessons_completed ?? 0) + activity.lessonsCompleted;
  }
  if (activity.timeMinutes !== undefined) {
    updates.time_spent_minutes = (stats.time_spent_minutes ?? 0) + activity.timeMinutes;
  }
  if (activity.accuracy !== undefined) {
    // Weighted average
    const current = stats.accuracy ?? 0;
    const count = stats.lessons_completed ?? 1;
    updates.accuracy = ((current * (count - 1)) + activity.accuracy) / count;
  }

  const { data, error } = await supabase
    .from("daily_stats")
    .update(updates)
    .eq("id", stats.id)
    .select()
    .single();

  if (error) throw error;
  return data as DailyStats;
}

/**
 * Get weekly stats.
 */
export async function getWeeklyStats(userId: string) {
  const supabase = await createClient();

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", userId)
    .gte("date", weekAgo.toISOString().split("T")[0])
    .lte("date", today.toISOString().split("T")[0])
    .order("date");

  // Gracefully handle missing table or RLS issues
  if (error) {
    console.warn("[getWeeklyStats] failed:", error.message);
    return {
      week_start: weekAgo.toISOString().split("T")[0],
      week_end: today.toISOString().split("T")[0],
      total_xp: 0,
      total_lessons: 0,
      total_time_minutes: 0,
      average_accuracy: 0,
      days_active: 0,
      daily_stats: [],
    };
  }

  const stats = (data || []) as DailyStats[];

  return {
    week_start: weekAgo.toISOString().split("T")[0],
    week_end: today.toISOString().split("T")[0],
    total_xp: stats.reduce((sum, s) => sum + (s.xp_earned ?? 0), 0),
    total_lessons: stats.reduce((sum, s) => sum + (s.lessons_completed ?? 0), 0),
    total_time_minutes: stats.reduce((sum, s) => sum + (s.time_spent_minutes ?? 0), 0),
    average_accuracy: stats.length > 0
      ? stats.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) / stats.length
      : 0,
    days_active: stats.length,
    daily_stats: stats,
  };
}

// ============================================
// Lesson Progress
// ============================================

/**
 * Get lesson progress for user.
 */
export async function getLessonProgress(userId: string, lessonId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as LessonProgress | null;
}

/**
 * Update lesson progress.
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  lessonType: string,
  isCompleted: boolean = false,
  progressPercent: number = 0
) {
  const supabase = await createClient();

  const updates: Partial<LessonProgress> = {
    progress_percent: progressPercent,
    is_completed: isCompleted,
  };

  if (isCompleted) {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      lesson_type: lessonType,
      ...updates,
    }, {
      onConflict: "user_id,lesson_id",
    })
    .select()
    .single();

  if (error) throw error;
  return data as LessonProgress;
}

/**
 * Get completed lessons count.
 */
export async function getCompletedLessonsCount(userId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_completed", true);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Get user's progress summary.
 */
export async function getProgressSummary(userId: string): Promise<ProgressSummary> {
  const [progress, streak, completedLessons] = await Promise.all([
    getOrCreateUserProgress(userId),
    getStreakInfo(userId),
    getCompletedLessonsCount(userId),
  ]);

  const level = calculateLevel(progress.total_xp);
  const nextLevelXP = LEVEL_CONFIG.find(l => l.level === level.level + 1)?.xp_required;

  return {
    user_id: userId,
    level,
    xp: progress.total_xp,
    xp_to_next_level: nextLevelXP ? nextLevelXP - progress.total_xp : null,
    streak,
    vocabulary: {
      total: 0, // Would be fetched from content tables
      learned: 0,
      learning: 0,
      mastered: 0,
      by_level: {} as Record<JLPTLevel, { total: number; learned: number }>,
    },
    kanji: {
      total: 0,
      learned: 0,
      by_level: {} as Record<JLPTLevel, { total: number; learned: number }>,
    },
    grammar: {
      total: 0,
      learned: 0,
      by_level: {} as Record<JLPTLevel, { total: number; learned: number }>,
    },
    lessons: {
      total: 0,
      completed: completedLessons,
      by_type: {} as Record<string, { total: number; completed: number }>,
    },
    quizzes: {
      total_attempts: 0,
      average_score: 0,
      best_score: 0,
      by_type: {},
    },
  };
}

/**
 * Get user kana progress.
 */
export async function getKanaProgress(userId: string, script: "hiragana" | "katakana") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_kana_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("script", script);

  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
      console.warn("[getKanaProgress] table missing from schema cache");
      return [];
    }
    throw error;
  }
  return data || [];
}
