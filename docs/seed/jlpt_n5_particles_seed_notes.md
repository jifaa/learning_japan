# JLPT N5 Particles Seed Notes

File: `jlpt_n5_particles_seed.csv`

Rows: 42

## Design

Data ini dibuat sebagai seed DB app belajar Jepang. Satu partikel bisa punya beberapa fungsi, jadi formatnya **one row per particle usage**, bukan one row per character.

Contoh:
- `に` punya usage untuk tujuan, lokasi keberadaan, waktu spesifik, recipient, dan tujuan aktivitas.
- `で` punya usage untuk lokasi aksi, alat/cara, kelompok/scope, dan cause/reason opsional.
- `は`, `へ`, `を` punya kolom `romaji_alt` karena bacaan partikel berbeda dari bacaan kana biasa.

## Recommended filters

Core lesson N5:
```txt
is_core_n5=true
```

Quiz utama:
```txt
recommended_for_quiz=true
```

Combo parser/search only:
```txt
set_type=combo_practice
```

Extended but useful:
```txt
set_type=extended_n5_grammar OR extended_n5_useful
```

## Set type

- `core_n5_essential`: 15 partikel dasar beginner/N5.
- `core_n5_grammar`: usage yang sering muncul sebagai grammar point N5.
- `core_n5_useful`: usage praktis yang sangat umum untuk N5.
- `extended_n5_grammar`: particle-like grammar N5 seperti `だけ`, `くらい`, `より`, `ので`.
- `extended_n5_useful`: usage tambahan beginner yang bagus tapi bisa ditunda.
- `combo_practice`: gabungan partikel untuk parser, search, dan reading support.

## Source basis

Primary references:
- MLC Japanese N5 Particles Guide: https://www.mlcjapanese.co.jp/n5_01_30.html
- Japanesetest4you JLPT N5 Grammar List: https://japanesetest4you.com/jlpt-n5-grammar-list/
- Tae Kim / Guide to Japanese particles: https://guidetojapanese.org/learn/grammar/particlesintro and https://www.guidetojapanese.org/particles2.html
- JapanesePod101 particles overview: https://www.japanesepod101.com/japanese-particles/

## Caveat

JLPT modern tidak menerbitkan daftar resmi vocabulary/kanji/grammar lengkap untuk tiap level. Jadi dataset ini adalah **study-list seed**, bukan klaim official list dari JLPT.
