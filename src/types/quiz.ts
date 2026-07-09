/**
 * Quiz types for the learning app.
 */

import type { JLPTLevel } from "./common";

// ============================================
// Quiz Types
// ============================================

/**
 * Quiz type categories.
 */
export type QuizType = "vocabulary" | "grammar" | "kanji" | "reading" | "mixed";

/**
 * Quiz difficulty levels.
 */
export type QuizDifficulty = "easy" | "medium" | "hard";

/**
 * Question format types.
 */
export type QuestionType = "multiple_choice" | "fill_blank" | "matching" | "listening";

// ============================================
// Quiz Structure
// ============================================

/**
 * Quiz session created for a user.
 */
export interface QuizSession {
  id: string;
  user_id: string;
  quiz_type: QuizType;
  difficulty: QuizDifficulty;
  questions: QuizQuestion[];
  current_index: number;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_points: number | null;
}

/**
 * Quiz question.
 */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  content: QuestionContent;
  options?: QuizOption[];
  correct_answer: string;
  explanation?: string;
  hint?: string;
  points: number;
}

/**
 * Question content based on type.
 */
export type QuestionContent = {
  question: string;
  context?: string; // For reading questions
  image?: string; // Optional image
};

/**
 * Quiz option (for multiple choice).
 */
export interface QuizOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

/**
 * Fill blank question structure.
 */
export interface FillBlankQuestion extends QuestionContent {
  sentence: string;
  blank_start: number;
  blank_end: number;
}

/**
 * Matching question structure.
 */
export interface MatchingQuestion extends QuestionContent {
  pairs: {
    left: string;
    right: string;
  }[];
}

// ============================================
// Quiz Results
// ============================================

/**
 * Quiz result from database.
 */
export interface QuizResult {
  id: string;
  user_id: string;
  quiz_type: QuizType;
  score: number;
  total_points: number;
  correct_answers: number;
  total_questions: number;
  time_spent_seconds: number;
  completed_at: string;
}

/**
 * User's answer to a question.
 */
export interface QuizAnswer {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_taken_ms: number;
}

/**
 * Summary of a quiz attempt.
 */
export interface QuizSummary {
  quiz_type: QuizType;
  total_attempts: number;
  average_score: number;
  best_score: number;
  last_attempt: string | null;
}

// ============================================
// Quiz Templates
// ============================================

/**
 * Quiz template configuration.
 */
export interface QuizTemplate {
  id: string;
  name: string;
  type: QuizType;
  difficulty: QuizDifficulty;
  question_count: number;
  time_limit_seconds?: number;
  allowed_attempts?: number;
}

/**
 * Quiz settings for a session.
 */
export interface QuizSettings {
  type: QuizType;
  difficulty: QuizDifficulty;
  question_count: number;
  time_limit?: number;
  shuffle_questions: boolean;
  show_hints: boolean;
  show_explanations: boolean;
}

// ============================================
// Quiz Generation
// ============================================

/**
 * Parameters for generating a quiz.
 */
export interface QuizGenerationParams {
  type: QuizType;
  difficulty?: QuizDifficulty;
  jlpt_level?: JLPTLevel;
  count?: number;
  exclude_ids?: string[];
  include_ids?: string[];
}

/**
 * Quiz generation result.
 */
export interface GeneratedQuiz {
  session: QuizSession;
  questions: QuizQuestion[];
}
