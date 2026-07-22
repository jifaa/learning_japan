/**
 * Quiz database access helpers.
 * All functions scope data by authenticated user.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  QuizResult,
  QuizQuestion,
  QuizType,
  QuizSummary,
} from "@/types/quiz";

// ============================================
// Quiz Results
// ============================================

/**
 * Save a quiz result.
 */
export async function saveQuizResult(
  userId: string,
  result: {
    quiz_type: QuizType;
    score: number;
    total_points: number;
    correct_answers: number;
    total_questions: number;
    time_spent_seconds: number;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_results")
    .insert({
      user_id: userId,
      quiz_type: result.quiz_type,
      score: result.score,
      total_points: result.total_points,
      correct_answers: result.correct_answers,
      total_questions: result.total_questions,
      time_spent_seconds: result.time_spent_seconds,
    })
    .select()
    .single();

  if (error) throw error;
  return data as QuizResult;
}

/**
 * Get quiz result by ID.
 */
export async function getQuizResult(resultId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("id", resultId)
    .single();

  if (error) throw error;
  return data as QuizResult;
}

/**
 * Get user's quiz history.
 */
export async function getQuizHistory(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    quizType?: QuizType;
  }
) {
  const supabase = await createClient();

  let query = supabase
    .from("quiz_results")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (options?.quizType) {
    query = query.eq("quiz_type", options.quizType);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as QuizResult[];
}

/**
 * Get quiz summary by type.
 */
export async function getQuizSummary(
  userId: string,
  quizType?: QuizType
): Promise<QuizSummary> {
  const supabase = await createClient();

  let query = supabase
    .from("quiz_results")
    .select("*")
    .eq("user_id", userId);

  if (quizType) {
    query = query.eq("quiz_type", quizType);
  }

  const { data, error } = await query;

  if (error) throw error;

  const results = data as QuizResult[];

  if (results.length === 0) {
    return {
      quiz_type: quizType ?? "mixed",
      total_attempts: 0,
      average_score: 0,
      best_score: 0,
      last_attempt: null,
    };
  }

  const scores = results.map(r => r.score);
  const lastAttempt = results[0]?.completed_at ?? null;

  return {
    quiz_type: quizType ?? "mixed",
    total_attempts: results.length,
    average_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    best_score: Math.max(...scores),
    last_attempt: lastAttempt,
  };
}

/**
 * Get quiz performance by type.
 */
export async function getQuizPerformanceByType(userId: string) {
  const types: QuizType[] = ["vocabulary", "grammar", "kanji", "reading", "mixed"];

  const summaries = await Promise.all(
    types.map(type => getQuizSummary(userId, type))
  );

  const byType: Record<string, { attempts: number; average: number }> = {};

  summaries.forEach((summary, index) => {
    byType[types[index]] = {
      attempts: summary.total_attempts,
      average: summary.average_score,
    };
  });

  return byType;
}

/**
 * Check if user got perfect quiz.
 */
export async function hasPerfectQuiz(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_results")
    .select("id")
    .eq("user_id", userId)
    .eq("score", 100)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

// ============================================
// Quiz Session (in-progress)
// ============================================
// Note: For MVP, we use a simple approach without dedicated session storage.
// For production, consider adding a quiz_sessions table.

/**
 * Quiz session state (managed client-side or in dedicated table).
 */
export interface ActiveQuizSession {
  id: string;
  user_id: string;
  quiz_type: QuizType;
  questions: QuizQuestion[];
  answers: Map<string, string>;
  started_at: Date;
  current_index: number;
}

/**
 * Create a new quiz session (client-side helper).
 */
export function createQuizSession(
  userId: string,
  quizType: QuizType,
  questions: QuizQuestion[]
): ActiveQuizSession {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    quiz_type: quizType,
    questions,
    answers: new Map(),
    started_at: new Date(),
    current_index: 0,
  };
}

/**
 * Calculate quiz result from session.
 */
export function calculateQuizResult(
  session: ActiveQuizSession,
  _timeSpentSeconds: number
): {
  score: number;
  total_points: number;
  correct_answers: number;
  total_questions: number;
} {
  let correct = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  session.questions.forEach(question => {
    const userAnswer = session.answers.get(question.id);
    const isCorrect = userAnswer?.toLowerCase() === question.correct_answer.toLowerCase();

    if (isCorrect) {
      correct++;
      earnedPoints += question.points;
    }

    totalPoints += question.points;
  });

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    score,
    total_points: totalPoints,
    correct_answers: correct,
    total_questions: session.questions.length,
  };
}

// ============================================
// Quiz History Analysis
// ============================================

/**
 * Get improvement trend (last N quizzes).
 */
export async function getScoreTrend(userId: string, lastN: number = 10) {
  const results = await getQuizHistory(userId, { limit: lastN });

  return results
    .slice(0, lastN)
    .reverse()
    .map((r, index) => ({
      attempt: index + 1,
      score: r.score,
      date: r.completed_at,
    }));
}

/**
 * Get average accuracy by question type.
 */
export async function getAccuracyByType(userId: string) {
  // This would require more complex analysis
  // For MVP, return simple summary
  const summary = await getQuizSummary(userId);
  return {
    overall: summary.average_score,
    vocabulary: 0,
    grammar: 0,
    kanji: 0,
    reading: 0,
  };
}

/**
 * Get total study time from quizzes.
 */
export async function getTotalQuizTime(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_results")
    .select("time_spent_seconds")
    .eq("user_id", userId);

  if (error) throw error;

  const results = data ?? [];
  return results.reduce((sum, r) => sum + r.time_spent_seconds, 0);
}

// ============================================
// Streak Tracking (Quiz specific)
// ============================================

/**
 * Get consecutive quiz days.
 */
export async function getQuizStreak(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_results")
    .select("completed_at")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) throw error;

  const results = data ?? [];
  if (results.length === 0) return 0;

  // Get unique dates
  const dates = new Set(
    results.map(r => r.completed_at.split("T")[0])
  );
  const sortedDates = Array.from(dates).sort().reverse();

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Check if most recent is today or yesterday
  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
    return 0;
  }

  // Count consecutive days starting from the most recent
  let streak = 0;
  const expectedDate = new Date(sortedDates[0]);

  for (const dateStr of sortedDates) {
    const expectedDateStr = expectedDate.toISOString().split("T")[0];

    if (dateStr === expectedDateStr) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
