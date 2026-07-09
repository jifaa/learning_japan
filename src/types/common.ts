/**
 * Common types used throughout the application.
 * This file re-exports from specialized type modules.
 */

// Re-export JLPT level for convenience
export type { JLPTLevel } from "./content";


// ============================================
// Utility Types
// ============================================

/**
 * Make all properties optional recursively.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract the element type from an array.
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * String keys of an object.
 */
export type StringKeys<T> = T extends object ? (keyof T extends string ? keyof T : never) : never;

// ============================================
// API Types
// ============================================

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

/**
 * API error structure.
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Pagination params.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================
// User & Auth Types
// ============================================

/**
 * User profile (extends Supabase user).
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

/**
 * User preferences.
 */
export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  dailyGoal?: number;
  notifications?: boolean;
  soundEffects?: boolean;
}
