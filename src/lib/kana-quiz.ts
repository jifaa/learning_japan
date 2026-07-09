/**
 * Shared kana utilities.
 */
import type { KanaCharacter } from "@/types/content";
import type { KanaQuestion } from "@/components/kana/kana-quiz-flow";

export type KanaScript = "hiragana" | "katakana";

/**
 * Kana category definitions with order.
 */
export const KANA_CATEGORIES = [
  { id: "basic", label: "Huruf Dasar", description: "Vokal dan konsonan dasar" },
  { id: "dakuon", label: "Dakuon (Tenten)", description: "Konsonan bersuara (g, z, d, b)" },
  { id: "handakuon", label: "Handakuon (Maru)", description: "Konsonan p (pa, pi, pu, pe, po)" },
  { id: "yoon", label: "Yōon", description: "Kombinasi dengan y (kyu, pyu, dll)" },
] as const;

export type KanaCategoryId = typeof KANA_CATEGORIES[number]["id"];

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

/**
 * Check if all characters in a category have mastery >= 3.
 */
function isCategoryMastered(
  categoryChars: KanaCharacter[],
  progressMap: Map<string, number>
): boolean {
  if (categoryChars.length === 0) return true;
  return categoryChars.every((char) => {
    const charId = char.id || char.kana;
    return (progressMap.get(charId) || 0) >= 3;
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
    if (wrong.length >= 3) break;
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
 * Kategori yang harus diselesaikan secara berurutan.
 */
const CATEGORY_ORDER = [
  { id: "basic", label: "Huruf Dasar" },
  { id: "dakuon", label: "Dakuon (Tenten)" },
  { id: "handakuon", label: "Handakuon (Maru)" },
  { id: "yoon", label: "Yōon" },
] as const;

/**
 * Pilih pool soal aktif berdasarkan progres user.
 * Mengikuti urutan: Basic → Dakuon → Handakuon → Yoon.
 * Semua yang sebelumnya sudah mastered bisa di-review.
 */
export function selectActivePool(
  chars: KanaCharacter[],
  progressMap: Map<string, number>
): { activePool: KanaCharacter[]; poolName: string } {
  for (const cat of CATEGORY_ORDER) {
    const catChars = chars.filter((c) => c.category === cat.id);
    if (!isCategoryMastered(catChars, progressMap)) {
      return { activePool: catChars, poolName: cat.label };
    }
  }
  return { activePool: chars, poolName: "Semua Huruf (Review)" };
}

/**
 * Bangun pertanyaan quiz dari pool karakter aktif.
 */
export function generateQuizQuestions(
  chars: KanaCharacter[],
  activePool: KanaCharacter[]
): KanaQuestion[] {
  const shuffled = shuffleArray(activePool);
  const selected = shuffled.slice(0, 10);

  return selected.map((char) => ({
    id: char.id || char.kana,
    kana: char.kana,
    romaji: char.romaji,
    options: buildOptions(char, chars),
  }));
}

/**
 * Hitung progress per kategori.
 * Mastery threshold: 3 correct answers untuk "mastered".
 */
export function calculateCategoryProgress(
  chars: KanaCharacter[],
  progressMap: Map<string, number>
): KanaCategoryProgress[] {
  const categoryMap = new Map(
    KANA_CATEGORIES.map((cat) => [cat.id, { ...cat, chars: [] as KanaCharacter[] }])
  );

  // Group chars by category
  for (const char of chars) {
    const cat = categoryMap.get(char.category);
    if (cat) cat.chars.push(char);
  }

  const results: KanaCategoryProgress[] = [];
  let isUnlocked = true; // First category is always unlocked

  for (const cat of KANA_CATEGORIES) {
    const catChars = categoryMap.get(cat.id)?.chars || [];
    const masteredChars = catChars.filter((c) => {
      const charId = c.id || c.kana;
      return (progressMap.get(charId) || 0) >= 3;
    }).length;

    const isCompleted = catChars.length > 0 && masteredChars === catChars.length;
    const progressPercent = catChars.length > 0
      ? Math.round((masteredChars / catChars.length) * 100)
      : 0;

    results.push({
      categoryId: cat.id,
      label: cat.label,
      description: cat.description,
      totalChars: catChars.length,
      masteredChars,
      isUnlocked,
      isCompleted,
      progressPercent,
    });

    // Next category is unlocked if current is completed
    isUnlocked = isUnlocked && isCompleted;
  }

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
