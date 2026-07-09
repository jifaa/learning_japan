# Japanese Numbers + Counters Seed Notes

Generated files:

1. `japanese_numbers_seed.csv`
   - Base Japanese number readings: 0-100 plus common large units up to 一億.
   - Includes alternate readings for 4, 7, 9 and special readings for hundreds/thousands.

2. `japanese_counters_seed.csv`
   - Counter definitions and app metadata.
   - Includes usage categories, examples, how-many form, sound-change flag, N5/core flags.

3. `japanese_counter_forms_n5_seed.csv`
   - Concrete number + counter forms, e.g. 一本/いっぽん, 三匹/さんびき, 十分/じゅっぷん.
   - Best file for quiz generation, flashcards, and answer validation.

4. `japanese_calendar_time_n5_seed.csv`
   - Weekdays, month names, day-of-month readings, and useful time expressions.
   - Includes irregular date/month readings like ついたち, よっか, はつか, しがつ, しちがつ, くがつ.

## Suggested DB usage

- Use `japanese_numbers_seed.csv` for number lessons and number-generation UI.
- Use `japanese_counters_seed.csv` as the counter master table.
- Use `japanese_counter_forms_n5_seed.csv` for quizzes and SRS cards because it stores real pronunciations.
- Use `japanese_calendar_time_n5_seed.csv` for date/time lessons, reading exercises, and listening prompts.

## Suggested quiz filters

Core N5 counters:
```txt
is_core_n5=true
```

Common quiz items:
```txt
recommended_for_quiz=true
```

Irregular pronunciation drills:
```txt
is_irregular=true
```

Calendar drills:
```txt
calendar_type=day_of_month OR calendar_type=month_name OR calendar_type=weekday
```

## Source basis

Primary references:
- Tofugu counting guide: https://www.tofugu.com/japanese/counting-in-japanese/
- Tofugu date/time grammar: https://www.tofugu.com/japanese-grammar/date-and-time/
- MLC N5 days/dates/months: https://www.mlcjapanese.co.jp/n5_01_07.html
- MLC counter list: https://www.mlcjapanese.co.jp/cou.html
- Preply common counters overview: https://preply.com/en/blog/japanese-counters/
- JPLT basic counters N5 overview: https://jplt-dialogplus.com/n5-g-042-counters/

## Caveat

This is a curated learning-app seed dataset. JLPT modern does not publish a single official public list of every N5 number/counter item, so treat this as practical N5/beginner material, not a strict official specification.
