# Reading N5 Seed Notes

Generated files:

1. `reading_passages_n5_seed.csv`
   - Main curated reading passage bank.
   - Rows: 41
   - Original N5-style passages for reading lessons, quiz, daily challenge, and mock mini.

2. `reading_questions_n5_seed.csv`
   - Question bank linked to passages.
   - Rows: 123
   - Includes multiple choice and true/false questions with JSON choices and answer key.

3. `reading_passage_content_map_n5_seed.csv`
   - Passage-to-content mapping.
   - Rows: 123
   - Maps passages to vocabulary, grammar, and kanji seed datasets when IDs can be matched.

4. `reading_sections_n5_seed.csv`
   - Reading quiz section blueprints.
   - Rows: 4
   - Use this to generate reading practice, notice practice, mixed quiz, and mini mock.

## Recommended app usage

For reading lesson pages:
```txt
reading_passages_n5_seed.csv
WHERE difficulty_order <= current_user_level
```

For quiz:
```txt
JOIN reading_questions_n5_seed.csv ON passage_id
```

For N5-style notice practice:
```txt
reading_format IN ('notice','memo','email','schedule','menu')
```

For mini mock:
```txt
used_in_mock_test=true
```

## Question JSON shape

`choices_json`:
```json
[
  {"id":"c1","text":"...", "is_correct":true},
  {"id":"c2","text":"...", "is_correct":false}
]
```

`correct_answer_json`:
```json
{"correct_choice_id":"c1","correct_value":"..."}
```

## Content policy / copyright

All passages and questions are original curated seed content written for this app. They are inspired by beginner/N5 reading formats, not copied from JLPT official workbooks or commercial materials.

## Source basis

- JLPT official sample questions page: https://www.jlpt.jp/e/samples/forlearners.html
- JLPT official test sections/time page: https://www.jlpt.jp/sp/e/guideline/testsections.html
- MLC N5 public topic hub: https://www.mlcjapanese.co.jp/n5.html
- Tatoeba usage guidance used only as corpus caution/reference, not as copied content: https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus

## Caveat

`review_status=curated_original_needs_native_review` means the content is designed to be conservative N5-level Japanese, but a native/pro teacher review is recommended before production release.
