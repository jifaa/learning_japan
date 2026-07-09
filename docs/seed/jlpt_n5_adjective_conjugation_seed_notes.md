# JLPT N5 Adjective Conjugation Rules Seed Notes

Files:
- `jlpt_n5_adjective_conjugation_rules_seed.csv`
- `jlpt_n5_adjective_conjugation_test_cases_seed.csv`

Generated: 2026-07-01

## Row counts

- Rules: 59
- Test cases: 187

## Design

Data ini dibuat untuk app belajar Jepang dengan format **rule-engine-friendly**:
- satu row = satu aturan transformasi, exception, atau grammar pattern turunan,
- `source_form` menentukan input yang dibutuhkan,
- `operation`, `stem_change`, dan `append_text` memberi instruksi transformasi,
- `adjective_group` membedakan `i_adjective`, `na_adjective`, dan special reference,
- `used_by_grammar_points` menghubungkan rule dengan grammar/quiz.

## Recommended app flow

1. Simpan `adjective_group` di tabel vocabulary untuk setiap adjective.
2. Jangan klasifikasi hanya dari akhiran `い`.
3. Generate base forms:
   - i-adjective: `i_stem`
   - na-adjective: stem = dictionary form
4. Generate core N5 forms:
   - i-adjective: present, negative, past, past negative, polite forms, `くて`, `く`
   - na-adjective: `です`, `ではありません`, `でした`, `ではありませんでした`, `な`, `で`, `に`
5. Jalankan unit test dari `jlpt_n5_adjective_conjugation_test_cases_seed.csv`.

## Important warnings

- `いい` conjugates from stem `よ`: `よくない`, `よかった`, `よくなかった`, `よくて`, `よく`.
- Na-adjectives that end in an `i` sound are still na-adjectives: `きれい`, `丁寧`, `有名`, `嫌い`, `好き`, `得意`.
- Do not generate wrong forms like `きれくない`.
- `大きな` and `小さな` are special prenominal forms; `大きい` and `小さい` remain normal i-adjectives.

## Recommended filters

Core N5 lesson:
```txt
is_core_n5=true
```

Quiz:
```txt
recommended_for_quiz=true
```

Roadmap boundary:
```txt
set_type=boundary_reference
```

## Source basis

Primary sources used:
- Tofugu i-adjectives: https://www.tofugu.com/japanese-grammar/i-adjective/
- Tofugu na-adjectives: https://www.tofugu.com/japanese-grammar/na-adjective/
- Tofugu i-adjective negative `くない`: https://www.tofugu.com/japanese-grammar/i-adjective-negative-form-kunai/
- MLC N5 adjectives list and basic conjugation examples: https://www.mlcjapanese.co.jp/n5_02_07.html
- MLC N5 connective/adverb forms: https://www.mlcjapanese.co.jp/n5_02_08.html
- Tae Kim / Guide to Japanese plain and polite adjective tense rules: https://guidetojapanese.org/learn/category/complete-guide/page/5/

## Caveat

JLPT modern does not publish a single official public list of every grammar/conjugation item by level. Treat this as a curated **N5 study-list seed** for app data, not an official JLPT specification.
