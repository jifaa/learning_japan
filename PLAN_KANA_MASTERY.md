# Plan: Kana Mastery Quiz System

## Goal
Sistem quiz sederhana untuk membuktikan bahwa pengguna telah menguasai huruf Hiragana/Katakana:
- ✅ **Benar** → Progress bertambah (membuktikan penguasaan)
- ❌ **Salah** → Progress tidak bertambah (tidak ada penalti, hanya tidak dapat reward)

## Konsep Design

### Simpel & Fokus
- Quiz 10 pertanyaan per sesi
- Tidak ada sistem "unlock kategori" (nanti jika perlu)
- Tidak ada penalti untuk jawaban salah
- Focus pada "bukti penguasaan" bukan "hukuman"

### Progress System
- Setiap karakter memiliki `mastery_count` (jumlah jawaban benar kumulatif)
- Karakter dianggap "dikuasai" jika `mastery_count >= 3`
- Tidak ada level system yang rumit - cukup hitungan benar

---

## Tahap 1: Database Schema (V2 - Simplified)

### Table: `user_kana_progress` (Existing - perlu disederhanakan)

```sql
-- Sederhanakan dari yang sebelumnya:
CREATE TABLE IF NOT EXISTS user_kana_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kana_id TEXT NOT NULL,          -- ID karakter dari kana_characters
  script TEXT NOT NULL,           -- 'hiragana' atau 'katakana'
  mastery_count INTEGER DEFAULT 0, -- Hitungan jawaban benar (0-999)
  last_quizzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, kana_id)
);
```

### Table: `kana_quiz_history` (Baru - tracking history quiz)

```sql
CREATE TABLE IF NOT EXISTS kana_quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  script TEXT NOT NULL,
  kana_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Tahap 2: API Routes

### `GET /api/kana/progress`
- Ambil semua progress user untuk script tertentu
- Return: `{ mastered: 10, learning: 20, notStarted: 40 }`

### `GET /api/kana/mastery/[script]`
- Ambil progress per karakter
- Return: Map kana_id → { mastery_count, last_quizzed }

### `POST /api/kana/quiz/answer`
- Submit jawaban quiz
- Body: `{ kanaId, isCorrect }`
- Jika `isCorrect = true`, increment `mastery_count`
- Jika `isCorrect = false`, tidak ada perubahan
- Insert ke `kana_quiz_history`

### `GET /api/kana/quiz/stats`
- Statistik quiz user
- Return: `{ totalQuizzes, avgScore, totalCorrect }`

---

## Tahap 3: UI Components

### `KanaProgressCard`
```
┌─────────────────────────────────────┐
│ 📊 Progress Hiragana                │
├─────────────────────────────────────┤
│ ████████░░░░░░░░░░░░  10/71 (14%)  │
│ Dikuasai: 10  |  Sedang belajar: 15 │
│                                     │
│ [🎯 Mulai Quiz]                     │
└─────────────────────────────────────┘
```

### `KanaQuizCard`
```
┌─────────────────────────────────────┐
│              5/10                   │
│ ━━━━━━━━━━━━━━━━━━━━━━░░░░░░       │
│                                     │
│              あ                      │
│          [🔊 Dengarkan]              │
│                                     │
│    Pilih romaji yang benar:         │
│  ┌─────────┐  ┌─────────┐          │
│  │    a    │  │    i    │          │
│  └─────────┘  └─────────┘          │
│  ┌─────────┐  ┌─────────┐          │
│  │    u    │  │    e    │          │
│  └─────────┘  └─────────┘          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✅ Benar! +1 ke progress        │ │
│ └─────────────────────────────────┘ │
│                                     │
│          [ Lanjut → ]               │
└─────────────────────────────────────┘
```

### `KanaQuizResult`
```
┌─────────────────────────────────────┐
│            ⭐ PERFECT! ⭐            │  ← Bonus visual untuk 10/10
│                                     │
│              🏆                     │
│                                     │
│            100%                      │
│         10 dari 10                   │
│                                     │
│    ✅ Benar: 10   ❌ Salah: 0       │
│                                     │
│         +30 XP (+20 bonus!)         │  ← Bonus XP
│                                     │
│    Karakter baru dikuasai: 7        │
│                                     │
│  [🔄 Quiz Lagi]  [📊 Lihat Progress]│
└─────────────────────────────────────┘
```

### Bonus XP System
- Jawaban benar: +2 XP per karakter
- Bonus sempurna (10/10): +20 XP extra
- Total max: 40 XP per quiz

---

## Tahap 4: Halaman Quiz

### `/hiragana/quiz`
- Halaman quiz Hiragana
- Pilih 10 karakter random dari database
- Generate 4 pilihan jawaban (1 benar + 3 salah random)
- Quiz flow: Question → Answer → Feedback → Next → Result

### `/katakana/quiz`
- Sama dengan Hiragana tapi untuk Katakana

### `/hiragana/progress`
- Lihat progress detail per karakter
- Highlight karakter yang sudah dikuasai
- Filter: Semua / Dikuasai / Belum

### `/hiragana` (Update Chart)
```
┌─────────────────────────────────────┐
│ あ ⭐  |  い    |  う ⭐  |  え    |  お  │
│ (dikuasai)                          │
└─────────────────────────────────────┘
```
- Karakter dengan `mastery_count >= 3` tampilkan badge ⭐
- Tooltip saat hover: "Dikuasai! (3x benar)"

---

## Tahap 5: Logic Detail

### Question Generation
1. Ambil 10 karakter random dari `kana_characters`
2. Untuk setiap karakter:
   - Satu jawaban benar: romaji karakter tersebut
   - Tiga jawaban salah: romaji karakter lain (random)
3. Shuffle opsi jawaban

### Progress Update (hanya jika benar)
```typescript
async function recordAnswer(userId, kanaId, script, isCorrect) {
  if (!isCorrect) return; // Tidak ada perubahan

  // Increment mastery_count
  await supabase.rpc('increment_kana_mastery', {
    p_user_id: userId,
    p_kana_id: kanaId,
    p_script: script
  });
}
```

### Database Function (PostgreSQL)
```sql
CREATE OR REPLACE FUNCTION increment_kana_mastery(
  p_user_id UUID,
  p_kana_id TEXT,
  p_script TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO user_kana_progress (user_id, kana_id, script, mastery_count, last_quizzed_at, updated_at)
  VALUES (p_user_id, p_kana_id, p_script, 1, NOW(), NOW())
  ON CONFLICT (user_id, kana_id)
  DO UPDATE SET
    mastery_count = user_kana_progress.mastery_count + 1,
    last_quizzed_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### Kriteria "Dikuasai"
- `mastery_count >= 3` → Karakter dianggap dikuasai
- Tampilkan badge/beda pada karakter yang dikuasai di chart

---

## File yang Perlu Dibuat/Diubah

### Database
- [ ] `supabase/migrations/003_kana_mastery_v2.sql` - Schema baru (simplified)

### API Routes
- [ ] `src/app/api/kana/progress/route.ts` - GET progress
- [ ] `src/app/api/kana/mastery/[script]/route.ts` - GET per karakter
- [ ] `src/app/api/kana/quiz/answer/route.ts` - POST jawaban
- [ ] `src/app/api/kana/quiz/stats/route.ts` - GET stats

### Library
- [ ] `src/lib/kana-quiz.ts` - Helper functions

### UI Components
- [ ] `src/components/kana/kana-progress-card.tsx`
- [ ] `src/components/kana/kana-quiz-flow.tsx` (update existing)
- [ ] `src/components/kana/kana-quiz-result.tsx`

### Pages
- [ ] `src/app/(app)/hiragana/quiz/page.tsx` - Quiz page
- [ ] `src/app/(app)/katakana/quiz/page.tsx` - Quiz page
- [ ] `src/app/(app)/hiragana/page.tsx` - Update dengan progress card & badge
- [ ] `src/app/(app)/hiragana/progress/page.tsx` - Halaman detail progress (BARU)

---

## Estimasi Effort

1. **Database Migration**: 30 menit
2. **API Routes**: 1 jam
3. **UI Components**: 1.5 jam
4. **Pages Integration**: 1 jam
5. **Testing**: 30 menit

**Total**: ~4.5 jam

---

## Pertanyaan untuk User

1. ~~Apakah kamu ingin menggunakan sistem "streak" (menjawab benar berturut-turut)?~~ → **Tidak perlu**
2. ~~Apakah kamu ingin ada bonus XP untuk quiz sempurna (10/10)?~~ → **Ya! Bonus visual + XP**
3. ~~Apakah kamu ingin halaman `/hiragana/progress` untuk melihat detail progress?~~ → **Ya! Di chart + halaman**

