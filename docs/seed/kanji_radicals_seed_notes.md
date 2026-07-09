# Kanji Radicals Seed Notes

Generated files:

1. `kanji_radicals_214_seed.csv`
   - 214 canonical Kangxi radicals adapted for Japanese-learning app data.
   - Uses normal kanji/base forms where practical, plus `kangxi_radical_symbol`.

2. `kanji_radical_variants_seed.csv`
   - Common radical variants/components such as `亻`, `扌`, `忄`, `氵`, `艹`, `辶`, `礻`, `⻊`, `⻗`.

3. `jlpt_n5_kanji_radical_map_seed.csv`
   - Maps the existing N5 kanji seed file to canonical radical IDs.
   - Includes `radical_form_used`, `canonical_radical`, and `radical_position_guess`.

## Why three files?

Radicals are messy. A kanji has one dictionary radical, but the visual form used inside a kanji may be a variant:
- `人` can appear as `亻`.
- `水` can appear as `氵`.
- `艸` often appears as `艹`.
- `辵` often appears as `辶`.
- `示` often appears as `礻`.

So the master table handles the concept, the variant table handles visual/input matching, and the N5 map handles your kanji lesson UI.

## Recommended app usage

For kanji lesson page:
```txt
join jlpt_n5_kanji_radical_map_seed.radical_id
  -> kanji_radicals_214_seed.id
```

For search by component:
```txt
normalize user input with kanji_radical_variants_seed
then match canonical_radical
```

For beginner quiz:
```txt
kanji_radicals_214_seed.n5_relevant=true
```

For all radical reference:
```txt
kanji_radicals_214_seed.radical_system=kangxi_214_japanese
```

## Caveats

- Radical assignments can vary by dictionary. KanjiVG explicitly supports multiple radical choices such as `general` and `nelson`.
- Some radical glyphs/variants are not reliably supported by common fonts. For UI, prefer showing `base_radical` and keep variants as searchable metadata.
- Some traditional forms differ from modern Japanese simplified forms, e.g. `齊/斉`, `齒/歯`, `龜/亀`, `黑/黒`, `黃/黄`, `麥/麦`.

## Source basis

- Kanji Alive 214 radicals page and Japanese radical CSV:
  https://kanjialive.com/214-traditional-kanji-radicals/
  https://github.com/kanjialive/kanji-data-media/blob/master/language-data/japanese-radicals.csv
- Kangxi radicals overview:
  https://en.wikipedia.org/wiki/Kangxi_radicals
- KanjiVG radical assignment notes:
  https://kanjivg.tagaini.net/radicals.html
