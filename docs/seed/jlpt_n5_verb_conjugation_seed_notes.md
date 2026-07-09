# JLPT N5 Verb Conjugation Rules Seed Notes

Files:
- `jlpt_n5_verb_conjugation_rules_seed.csv`
- `jlpt_n5_verb_conjugation_test_cases_seed.csv`

## Row counts

- Rules: 78
- Test cases: 88

## Design

Rule CSV memakai format **rule-engine-friendly**:
- satu row = satu aturan transformasi atau pola turunan,
- `source_form` menentukan input yang dibutuhkan,
- `operation`, `stem_change`, dan `append_text` memberi instruksi transformasi,
- `example_*` memberi contoh valid,
- `used_by_grammar_points` menghubungkan rule ke materi grammar/quiz.

## Recommended app flow

1. Simpan `verb_group` di tabel vocabulary untuk setiap kata kerja.
2. Generate base forms:
   - `masu_stem`
   - `nai_form`
   - `te_form`
   - `ta_form`
3. Generate derived forms:
   - `masu_form`, `masen_form`, `mashita_form`, `masen_deshita_form`
   - `nakatta_form`
   - `te_kudasai_form`, `te_imasu_form`, `te_mo_ii_form`, dll.
4. Jalankan unit test dari `jlpt_n5_verb_conjugation_test_cases_seed.csv`.

## Important warnings

- Jangan menebak verb group hanya dari akhiran. Banyak verb berakhir `いる/える` memang ichidan, tapi ada pengecualian godan seperti `帰る`, `入る`, `走る`, `切る`, `要る`.
- Godan `う` untuk nai-form menjadi `わない`, contoh `買う -> 買わない`, bukan `買あない`.
- `行く` punya て/た exception: `行って`, `行った`.
- `来る` berubah reading tergantung bentuk: `来ます=きます`, `来ない=こない`, `来て=きて`, `来た=きた`.

## Source basis

Primary sources used:
- Tofugu verb conjugation groups: https://www.tofugu.com/japanese-grammar/verb-conjugation-groups/
- Tofugu te-form rules: https://www.tofugu.com/japanese-grammar/te-form/
- MLC JLPT N5 plain forms: https://www.mlcjapanese.co.jp/n5_06_01.html
- MLC JLPT N5-N4 verb conjugation table: https://www.mlcjapanese.co.jp/n5_04_08.html
- JLPT Sensei N5 `てください`: https://jlptsensei.com/learn-japanese-grammar/%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84-te-kudasai-meaning/
- Nihongo Ichiban N5 verb grammar overview: https://nihongoichiban.com/2011/09/08/japanese-grammar-of-verbs-for-jlpt-n5/

## Caveat

JLPT modern does not publish a single official public list of every grammar/conjugation item by level. Treat this as a curated **N5 study-list seed** for app data, not an official JLPT specification.
