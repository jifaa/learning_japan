/**
 * Shared kana utilities.
 */
import type { KanaCharacter } from "@/types/content";
import type { KanaQuestion } from "@/components/kana/kana-quiz-flow";

export type KanaScript = "hiragana" | "katakana";

/**
 * Quiz learning order - rows grouped for progressive learning.
 * Each quiz group unlocks after the previous one is mastered.
 */
export const QUIZ_LEARNING_ORDER = [
  { id: "quiz_1", label: "Quiz 1", rows: ["vowel", "k", "s"] },
  { id: "quiz_2", label: "Quiz 2", rows: ["t", "n", "h"] },
  { id: "quiz_3", label: "Quiz 3", rows: ["m", "y", "r", "w", "n-final"] },
] as const;

/**
 * Kana category definitions for display.
 */
export const KANA_CATEGORIES = [
  { id: "basic", label: "Huruf Dasar", description: "Vokal dan konsonan dasar" },
  { id: "dakuon", label: "Dakuon (Tenten)", description: "Konsonan bersuara (g, z, d, b)" },
  { id: "handakuon", label: "Handakuon (Maru)", description: "Konsonan p (pa, pi, pu, pe, po)" },
  { id: "yoon", label: "Yōon", description: "Kombinasi dengan y (kyu, pyu, dll)" },
] as const;

export type KanaCategoryId = typeof KANA_CATEGORIES[number]["id"];

/**
 * Quiz item for selection UI.
 */
export interface KanaQuizItem {
  id: string;
  label: string;
  description: string;
  totalChars: number;
  masteredChars: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progressPercent: number;
  href: string;
}

/**
 * Get all quizzes with their lock/unlock status.
 * Returns quizzes in learning order with progress.
 */
export function getKanaQuizList(
  chars: KanaCharacter[],
  progressMap: Map<string, number>
): KanaQuizItem[] {
  const basicChars = chars.filter((c) => c.category === "basic");
  const dakuonChars = chars.filter((c) => c.category === "dakuon");
  const handakuonChars = chars.filter((c) => c.category === "handakuon");
  const yoonChars = chars.filter((c) => c.category === "yoon");

  // Calculate mastery for a group of chars
  const calcMastery = (categoryChars: KanaCharacter[]) => {
    const mastered = categoryChars.filter((c) => {
      const charId = c.id || c.kana;
      return (progressMap.get(charId) || 0) >= MASTERY_THRESHOLD;
    }).length;
    const percent = categoryChars.length > 0
      ? Math.round((mastered / categoryChars.length) * 100)
      : 0;
    return { mastered, percent };
  };

  // Check if a set of rows are all mastered
  const areRowsMastered = (rows: readonly string[]) => {
    return rows.every((row) => isRowMastered(basicChars, row, progressMap));
  };

  // Check if all chars in category are mastered
  const isCharsMastered = (categoryChars: KanaCharacter[]) =>
    categoryChars.length > 0 && isCategoryMastered(categoryChars, progressMap);

  // Build quiz list
  const quizzes: KanaQuizItem[] = [];

  // Quiz 1: Vowel + K + S
  const q1Chars = basicChars.filter((c) => c.row_group && ["vowel", "k", "s"].includes(c.row_group));
  const q1Mastery = calcMastery(q1Chars);
  quizzes.push({
    id: "quiz_1",
    label: "Quiz 1",
    description: "Pelajari huruf vokal dan konsonan K, S",
    totalChars: q1Chars.length,
    masteredChars: q1Mastery.mastered,
    isUnlocked: true,
    isCompleted: q1Mastery.mastered === q1Chars.length && q1Chars.length > 0,
    progressPercent: q1Mastery.percent,
    href: "/hiragana/quiz?quiz=quiz_1",
  });

  // Quiz 2: T + N + H (unlocked after Quiz 1 completed)
  const q2Chars = basicChars.filter((c) => c.row_group && ["t", "n", "h"].includes(c.row_group));
  const q2Mastery = calcMastery(q2Chars);
  const quiz1Completed = q1Mastery.mastered === q1Chars.length && q1Chars.length > 0;
  quizzes.push({
    id: "quiz_2",
    label: "Quiz 2",
    description: "Pelajari konsonan T, N, H",
    totalChars: q2Chars.length,
    masteredChars: q2Mastery.mastered,
    isUnlocked: quiz1Completed,
    isCompleted: q2Mastery.mastered === q2Chars.length && q2Chars.length > 0,
    progressPercent: q2Mastery.percent,
    href: "/hiragana/quiz?quiz=quiz_2",
  });

  // Quiz 3: M + Y + R + W + N-final (unlocked after Quiz 2 completed)
  const q3Chars = basicChars.filter((c) => c.row_group && ["m", "y", "r", "w", "n-final"].includes(c.row_group));
  const q3Mastery = calcMastery(q3Chars);
  const quiz2Completed = q2Mastery.mastered === q2Chars.length && q2Chars.length > 0;
  quizzes.push({
    id: "quiz_3",
    label: "Quiz 3",
    description: "Pelajari konsonan M, Y, R, W dan huruf ん",
    totalChars: q3Chars.length,
    masteredChars: q3Mastery.mastered,
    isUnlocked: quiz1Completed && quiz2Completed,
    isCompleted: q3Mastery.mastered === q3Chars.length && q3Chars.length > 0,
    progressPercent: q3Mastery.percent,
    href: "/hiragana/quiz?quiz=quiz_3",
  });

  // All basic completed?
  const allBasicCompleted = basicChars.length > 0 && isCharsMastered(basicChars);

  // Dakuon (unlocked after all basic quizzes completed)
  const dakuonMastery = calcMastery(dakuonChars);
  quizzes.push({
    id: "dakuon",
    label: "Dakuon (Tenten)",
    description: "Konsonan bersuara (ga, za, da, ba)",
    totalChars: dakuonChars.length,
    masteredChars: dakuonMastery.mastered,
    isUnlocked: allBasicCompleted && dakuonChars.length > 0,
    isCompleted: dakuonMastery.mastered === dakuonChars.length && dakuonChars.length > 0,
    progressPercent: dakuonMastery.percent,
    href: "/hiragana/quiz?quiz=dakuon",
  });

  // Handakuon (unlocked after Dakuon completed)
  const handakuonMastery = calcMastery(handakuonChars);
  quizzes.push({
    id: "handakuon",
    label: "Handakuon (Maru)",
    description: "Konsonan P (pa, pi, pu, pe, po)",
    totalChars: handakuonChars.length,
    masteredChars: handakuonMastery.mastered,
    isUnlocked: dakuonMastery.mastered === dakuonChars.length && dakuonChars.length > 0,
    isCompleted: handakuonMastery.mastered === handakuonChars.length && handakuonChars.length > 0,
    progressPercent: handakuonMastery.percent,
    href: "/hiragana/quiz?quiz=handakuon",
  });

  // Yoon (unlocked after Handakuon completed)
  const yoonMastery = calcMastery(yoonChars);
  quizzes.push({
    id: "yoon",
    label: "Yōon",
    description: "Kombinasi konsonan dengan Y (kyu, pyu, dll)",
    totalChars: yoonChars.length,
    masteredChars: yoonMastery.mastered,
    isUnlocked: handakuonMastery.mastered === handakuonChars.length && handakuonChars.length > 0,
    isCompleted: yoonMastery.mastered === yoonChars.length && yoonChars.length > 0,
    progressPercent: yoonMastery.percent,
    href: "/hiragana/quiz?quiz=yoon",
  });

  return quizzes;
}

/**
 * Select quiz pool by quiz ID.
 */
export function selectQuizById(
  chars: KanaCharacter[],
  progressMap: Map<string, number>,
  quizId: string
): { activePool: KanaCharacter[]; poolName: string } | null {
  const basicChars = chars.filter((c) => c.category === "basic");
  const dakuonChars = chars.filter((c) => c.category === "dakuon");
  const handakuonChars = chars.filter((c) => c.category === "handakuon");
  const yoonChars = chars.filter((c) => c.category === "yoon");

  switch (quizId) {
    case "quiz_1": {
      const qChars = basicChars.filter((c) => c.row_group && ["vowel", "k", "s"].includes(c.row_group));
      return { activePool: qChars, poolName: "Quiz 1" };
    }
    case "quiz_2": {
      const qChars = basicChars.filter((c) => c.row_group && ["t", "n", "h"].includes(c.row_group));
      return { activePool: qChars, poolName: "Quiz 2" };
    }
    case "quiz_3": {
      const qChars = basicChars.filter((c) => c.row_group && ["m", "y", "r", "w", "n-final"].includes(c.row_group));
      return { activePool: qChars, poolName: "Quiz 3" };
    }
    case "dakuon":
      return { activePool: dakuonChars, poolName: "Dakuon (Tenten)" };
    case "handakuon":
      return { activePool: handakuonChars, poolName: "Handakuon (Maru)" };
    case "yoon":
      return { activePool: yoonChars, poolName: "Yōon" };
    default:
      return null;
  }
}

/**
 * Category progress for display.
 */
export interface KanaCategoryProgress {
  categoryId: KanaCategoryId;
  label: string;
  description: string;
  totalChars: number;
  masteredChars: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progressPercent: number;
}

/**
 * Overall kana mastery stats.
 */
export interface KanaMasteryStats {
  script: KanaScript;
  totalChars: number;
  masteredChars: number;
  categories: KanaCategoryProgress[];
  currentCategory: KanaCategoryId;
  nextUnlockInfo?: {
    categoryId: KanaCategoryId;
    label: string;
    charsNeeded: number;
  };
}

/**
 * Shuffle array using Fisher-Yates algorithm.
 * Returns a new shuffled array (original unchanged).
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

  // Character is mastered after 1 correct answer (changed from 3 to 1 for faster progression)
  const MASTERY_THRESHOLD = 1;
function isRowMastered(
  chars: KanaCharacter[],
  rowGroup: string,
  progressMap: Map<string, number>
): boolean {
  const rowChars = chars.filter((c) => c.row_group === rowGroup);
  if (rowChars.length === 0) return true;
  return rowChars.every((char) => {
    const charId = char.id || char.kana;
    return (progressMap.get(charId) || 0) >= MASTERY_THRESHOLD;
  });
}

/**
 * Check if all characters in a category have mastery >= MASTERY_THRESHOLD.
 */
function isCategoryMastered(
  categoryChars: KanaCharacter[],
  progressMap: Map<string, number>
): boolean {
  if (categoryChars.length === 0) return true;
  return categoryChars.every((char) => {
    const charId = char.id || char.kana;
    return (progressMap.get(charId) || 0) >= MASTERY_THRESHOLD;
  });
}

/**
 * Bangun 4 opsi (1 benar + 3 salah) dengan label romaji yang unik.
 * Menyaring pilihan salah yang romaji-nya bentrok dengan jawaban benar
 * maupun antar pilihan salah itu sendiri.
 */
export function buildOptions(correct: KanaCharacter, pool: KanaCharacter[]) {
  // Romaji yang TIDAK BOLEH muncul di pilihan salah
  const forbidden = new Set(
    [correct.romaji, correct.romaji_alt].filter(Boolean) as string[]
  );

  // Kandidat salah: berbeda romaji dari jawaban benar
  const candidates = pool.filter(
    (c) =>
      c.id !== correct.id &&
      !forbidden.has(c.romaji) &&
      !forbidden.has(c.romaji_alt || "")
  );

  const shuffled = shuffleArray(candidates);
  const wrong: KanaCharacter[] = [];

  // Ambil max 3 pilihan salah, pastikan romaji-nya unik antar sesama pilihan
  for (const c of shuffled) {
    if (wrong.length >= MASTERY_THRESHOLD) break;
    if (!wrong.some((w) => w.romaji === c.romaji)) {
      wrong.push(c);
    }
  }

  // Edge case: pool terlalu kecil untuk 3 pilihan salah unik.
  // Fallback: ambil karakter terakhir tanpa проверка romaji uniqueness.
  while (wrong.length < 3 && shuffled.length > wrong.length) {
    const fallback = shuffled.find((c) => !wrong.includes(c));
    if (fallback) wrong.push(fallback);
    else break;
  }

  return shuffleArray([
    { romaji: correct.romaji, isCorrect: true },
    ...wrong.map((c) => ({ romaji: c.romaji, isCorrect: false })),
  ]);
}

/**
 * Select active pool of characters for quiz based on row-based learning order.
 * Unlocks in stages: vowel_k_s → t_n_h → m_y_r_w_n → all basic
 * Dakuon/Handakuon/Yoon unlock after their prerequisite category is mastered.
 */
export function selectActivePool(
  chars: KanaCharacter[],
  progressMap: Map<string, number>
): { activePool: KanaCharacter[]; poolName: string } {
  // Get basic characters
  const basicChars = chars.filter((c) => c.category === "basic");

  // Check quiz learning order for basic characters
  for (const stage of QUIZ_LEARNING_ORDER) {
    // Check if all rows in this stage are mastered
    const allRowsMastered = stage.rows.every((row) =>
      isRowMastered(basicChars, row, progressMap)
    );

    if (!allRowsMastered) {
      // Not all rows mastered yet, collect all chars from these rows for quiz
      const rowSet = new Set(stage.rows as readonly string[]);
      const stageChars = basicChars.filter((c) => c.row_group && rowSet.has(c.row_group));
      return { activePool: stageChars, poolName: stage.label };
    }
  }

  // All basic rows mastered - check if basic category is fully mastered
  if (!isCategoryMastered(basicChars, progressMap)) {
    return { activePool: basicChars, poolName: "Huruf Dasar (Review)" };
  }

  // Basic fully mastered - check dakuon
  const dakuonChars = chars.filter((c) => c.category === "dakuon");
  if (dakuonChars.length > 0 && !isCategoryMastered(dakuonChars, progressMap)) {
    return { activePool: dakuonChars, poolName: "Dakuon (Tenten)" };
  }

  // Dakuon mastered - check handakuon
  const handakuonChars = chars.filter((c) => c.category === "handakuon");
  if (handakuonChars.length > 0 && !isCategoryMastered(handakuonChars, progressMap)) {
    return { activePool: handakuonChars, poolName: "Handakuon (Maru)" };
  }

  // Handakuon mastered - check yoon
  const yoonChars = chars.filter((c) => c.category === "yoon");
  if (yoonChars.length > 0 && !isCategoryMastered(yoonChars, progressMap)) {
    return { activePool: yoonChars, poolName: "Yōon" };
  }

  // Everything mastered - review all
  return { activePool: chars, poolName: "Semua Huruf (Review)" };
}

/**
 * Bangun pertanyaan quiz dari pool karakter aktif.
 */
export function generateQuizQuestions(
  chars: KanaCharacter[],
  activePool: KanaCharacter[]
): KanaQuestion[] {
  // Use all characters in the pool for the quiz
  const shuffled = shuffleArray(activePool);

  return shuffled.map((char) => ({
    id: char.id || char.kana,
    kana: char.kana,
    romaji: char.romaji,
    options: buildOptions(char, chars),
  }));
}

/**
 * Hitung progress per kategori.
 * Mastery threshold: 3 correct answers untuk "mastered".
 *
 * Unlock logic:
 * - Basic: always unlocked
 * - Dakuon: unlocked after ALL basic rows mastered (vowel, k, s, t, n, h, m, y, r, w, n)
 * - Handakuon: unlocked after dakuon is mastered
 * - Yoon: unlocked after handakuon is mastered
 */
export function calculateCategoryProgress(
  chars: KanaCharacter[],
  progressMap: Map<string, number>
): KanaCategoryProgress[] {
  const basicChars = chars.filter((c) => c.category === "basic");
  const dakuonChars = chars.filter((c) => c.category === "dakuon");
  const handakuonChars = chars.filter((c) => c.category === "handakuon");
  const yoonChars = chars.filter((c) => c.category === "yoon");

  // Check if all basic rows are mastered (for informational purposes)
  const basicRows = ["vowel", "k", "s", "t", "n", "h", "m", "y", "r", "w", "n"];
  basicRows.every((row) => isRowMastered(basicChars, row, progressMap));

  const basicCompleted = basicChars.length > 0 && basicChars.every((c) => {
    const charId = c.id || c.kana;
    return (progressMap.get(charId) || 0) >= MASTERY_THRESHOLD;
  });

  const dakuonCompleted = dakuonChars.length > 0 && isCategoryMastered(dakuonChars, progressMap);
  const handakuonCompleted = handakuonChars.length > 0 && isCategoryMastered(handakuonChars, progressMap);
  const yoonCompleted = yoonChars.length > 0 && isCategoryMastered(yoonChars, progressMap);

  // Calculate mastery for each category
  const calcMastery = (categoryChars: KanaCharacter[]) => {
    const mastered = categoryChars.filter((c) => {
      const charId = c.id || c.kana;
      return (progressMap.get(charId) || 0) >= MASTERY_THRESHOLD;
    }).length;
    const percent = categoryChars.length > 0
      ? Math.round((mastered / categoryChars.length) * 100)
      : 0;
    return { mastered, percent };
  };

  const basicMastery = calcMastery(basicChars);
  const dakuonMastery = calcMastery(dakuonChars);
  const handakuonMastery = calcMastery(handakuonChars);
  const yoonMastery = calcMastery(yoonChars);

  // Build results - dakuon unlocks after basic is completed, not just first quiz
  const results: KanaCategoryProgress[] = [
    {
      categoryId: "basic",
      label: "Huruf Dasar",
      description: "Vokal dan konsonan dasar",
      totalChars: basicChars.length,
      masteredChars: basicMastery.mastered,
      isUnlocked: true, // Always unlocked
      isCompleted: basicCompleted,
      progressPercent: basicMastery.percent,
    },
    {
      categoryId: "dakuon",
      label: "Dakuon (Tenten)",
      description: "Konsonan bersuara (g, z, d, b)",
      totalChars: dakuonChars.length,
      masteredChars: dakuonMastery.mastered,
      isUnlocked: basicCompleted && dakuonChars.length > 0, // Only after basic is done
      isCompleted: dakuonCompleted,
      progressPercent: dakuonMastery.percent,
    },
    {
      categoryId: "handakuon",
      label: "Handakuon (Maru)",
      description: "Konsonan p (pa, pi, pu, pe, po)",
      totalChars: handakuonChars.length,
      masteredChars: handakuonMastery.mastered,
      isUnlocked: dakuonCompleted && handakuonChars.length > 0,
      isCompleted: handakuonCompleted,
      progressPercent: handakuonMastery.percent,
    },
    {
      categoryId: "yoon",
      label: "Yōon",
      description: "Kombinasi dengan y (kyu, pyu, dll)",
      totalChars: yoonChars.length,
      masteredChars: yoonMastery.mastered,
      isUnlocked: handakuonCompleted && yoonChars.length > 0,
      isCompleted: yoonCompleted,
      progressPercent: yoonMastery.percent,
    },
  ];

  return results;
}

/**
 * Dapatkan stats mastery kana lengkap.
 */
export function getKanaMasteryStats(
  chars: KanaCharacter[],
  progressMap: Map<string, number>
): KanaMasteryStats {
  const categories = calculateCategoryProgress(chars, progressMap);
  const totalChars = chars.length;
  const masteredChars = categories.reduce((sum, cat) => sum + cat.masteredChars, 0);

  // Find current active category (first unlocked but not completed)
  const activeCategory = categories.find((cat) => cat.isUnlocked && !cat.isCompleted);
  const currentCategory: KanaCategoryId = activeCategory?.categoryId || "basic";

  // Find next unlock info
  const nextUnlock = categories.find((cat) => !cat.isCompleted && !cat.isUnlocked);
  const nextUnlockInfo = nextUnlock ? {
    categoryId: nextUnlock.categoryId,
    label: nextUnlock.label,
    charsNeeded: nextUnlock.totalChars - nextUnlock.masteredChars,
  } : undefined;

  return {
    script: chars[0]?.script as KanaScript || "hiragana",
    totalChars,
    masteredChars,
    categories,
    currentCategory,
    nextUnlockInfo,
  };
}
