# JLPT N5 Grammar Seed Notes

Files:
- `jlpt_n5_grammar_seed.csv`
- `jlpt_n5_grammar_core_84_seed.csv`

Rows:
- Full seed: 113
- Core 84: 84
- Extended foundational: 29

## Why this shape?

Modern JLPT does not publish an official list of grammar/vocabulary/kanji items. Therefore this dataset is a curated study-list seed for an app, not an official JLPT specification.

The full seed keeps two layers:

```txt
set_type=core_84_common_n5
set_type=extended_foundational_n5
```

Use `core_84_common_n5` for the main N5 grammar roadmap.
Use `extended_foundational_n5` for conjugation lessons, demonstratives, approximation, and beginner grammar support.

## Recommended filters

Main grammar lesson:
```txt
set_type=core_84_common_n5
```

All app grammar search:
```txt
jlpt_level=N5
```

Quiz bank seed:
```txt
recommended_for_quiz=true
```

Avoid duplicate lesson overlap with particle module:
```txt
category_id != particle
```

## Important columns

- `grammar_point`: visible grammar title
- `structure_pattern`: formula / rumus
- `usage_explanation_id`: penjelasan Indonesia
- `example_jp`: contoh Jepang
- `example_romaji`: romaji contoh
- `example_meaning_id`: arti Indonesia
- `practice_type`: tipe latihan
- `practice_prompt_id`: soal latihan
- `practice_answer`: jawaban latihan
- `illustration_path`: placeholder gambar/ilustrasi
- `audio_path`: placeholder audio contoh
- `source_basis` and `source_url`: traceability

## Source basis

- JLPT official FAQ: JLPT no longer publishes Test Content Specifications containing list of vocabulary, kanji, and grammar items.
- JLPT official test composition: N5 includes Language Knowledge (Vocabulary), Language Knowledge (Grammar) + Reading, and Listening.
- JLPTsensei N5 grammar list: common 84-item grammar study-list.
- Japanesetest4you N5 grammar list: cross-check common N5 grammar points and missing items such as `くらい`, `な`, etc.
- Bunpro N5 Grammar deck: cross-check broader beginner grammar/conjugation/demonstrative coverage.

## Production note

`illustration_path` and `audio_path` are placeholders. Replace them with real assets or generate app-side from IDs.
