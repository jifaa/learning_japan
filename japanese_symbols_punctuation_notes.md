# Japanese Symbols / Punctuation Seed Data

File: `japanese_symbols_punctuation_seed.csv`  
Encoding: UTF-8 with BOM (`utf-8-sig`) supaya aman dibuka di Excel/Google Sheets.

## Ringkasan

- Total rows: 116
- Core CJK block: U+3000 sampai U+303F
- Tambahan praktis: `・`, `ー`, dakuten/handakuten, fullwidth punctuation, halfwidth punctuation, dan ASCII aliases untuk validasi input.
- Kolom `is_common`, `n5_relevant`, dan `recommended_for_quiz` bisa dipakai untuk filter materi pemula.
- Kolom `suggested_normalized_to` dibuat untuk normalisasi jawaban user saat quiz typing.

## Rekomendasi pemakaian di app

Untuk materi utama N5/beginner:
- Filter: `is_common=true`
- Untuk quiz punctuation: `recommended_for_quiz=true`
- Untuk normalisasi input: pakai `suggested_normalized_to` + `normalized_nfkc`

Untuk halaman advanced/reference:
- Tampilkan semua row, termasuk `set_type=cjk_symbols_punctuation_block`

## Count by set_type

- ascii_input_alias: 6
- cjk_symbols_punctuation_block: 64
- core_japanese_punctuation: 3
- core_japanese_symbol: 1
- extended_japanese_mark: 5
- extended_japanese_punctuation: 1
- fullwidth_bracket: 6
- fullwidth_punctuation: 9
- fullwidth_symbol: 9
- halfwidth_normalization: 8
- input_normalization: 4

## Count by category

- bracket: 26
- mark: 25
- number_symbol: 13
- punctuation: 25
- quotation: 3
- space: 3
- symbol: 21

## Sumber utama

- Unicode CJK Symbols and Punctuation: https://www.unicode.org/charts/PDF/U3000.pdf
- Unicode Halfwidth and Fullwidth Forms: https://www.unicode.org/charts/nameslist/n_FF00.html
- W3C Japanese Layout Requirements: https://www.w3.org/TR/jlreq/?lang=en
- Unicode Katakana: https://www.unicode.org/charts/PDF/U30A0.pdf
- Unicode Hiragana: https://www.unicode.org/charts/PDF/U3040.pdf
