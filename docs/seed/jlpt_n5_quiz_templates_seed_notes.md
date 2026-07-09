# JLPT N5 Quiz Templates Seed Notes

Generated files:

1. `jlpt_n5_quiz_templates_seed.csv`
   - Master quiz template/generator table.
   - Rows: 38
   - One row = one reusable template that can generate quiz items from kana, vocab, grammar, kanji, counter, sentence, reading, or listening seed data.

2. `quiz_answer_schemas_seed.csv`
   - Answer payload and response payload schemas per interaction type.
   - Rows: 9
   - Use this to standardize frontend payloads and backend validators.

3. `jlpt_n5_quiz_sections_seed.csv`
   - Quiz section blueprints for lesson quiz, daily challenge, skill quiz, and mock test.
   - Rows: 11
   - Includes question counts, template pools, time limits, and scoring mode.

4. `jlpt_n5_quiz_item_samples_seed.csv`
   - Sample ready-to-render quiz items.
   - Rows: 27
   - These are examples of what generated items should look like.

## Recommended backend flow

1. Select a `quiz_section`.
2. Expand its `template_pool`.
3. For each template, query `source_dataset`.
4. Generate prompt/stem using `prompt_template_id` and `stem_template_*`.
5. Generate distractors using `distractor_strategy`.
6. Store rendered item using the sample item schema.
7. Validate answer using `validator_key` and `quiz_answer_schemas_seed.csv`.

## Important design decisions

- `question_type` is app-level.
- `interaction_type` follows QTI-like naming so the data model stays portable.
- `ui_component` is frontend-facing.
- `validator_key` is backend-facing.
- `distractor_strategy` keeps item generation deterministic and testable.
- `recommended_for_mvp=true` marks what should ship first.
- `is_jlpt_style=true` marks templates that resemble JLPT practice/sample formats.

## Suggested MVP quiz types

Ship these first:
```txt
kana_romaji_choice
kana_from_romaji_choice
kana_typing
vocab_meaning_choice
vocab_reading_choice
particle_gap_choice
grammar_sentence_order
verb_conjugation_choice
kanji_meaning_choice
kanji_reading_choice
counter_reading_choice
listening_sentence_choice
reading_comprehension_choice
```

## Source basis

- JLPT official sample questions page: https://www.jlpt.jp/e/samples/forlearners.html
- JLPT official test sections/time: https://www.jlpt.jp/sp/e/guideline/testsections.html
- JLPT official scoring/result sections: https://www.jlpt.jp/sp/e/guideline/results.html
- 1EdTech QTI 3 guide: https://www.imsglobal.org/spec/qti/v3p0/guide
- 1EdTech QTI implementation guide: https://www.imsglobal.org/spec/qti/v3p0/impl
- 1EdTech QTI specification hub: https://www.1edtech.org/standards/qti/index

## Caveat

These templates are seed data for a learning app, not copied official JLPT items. The official JLPT sample page explicitly says sample questions show the form of test items and gives one sample per item type, while actual test booklets may differ.
