# JLPT N5 Example Sentences Seed Notes

Generated files:

1. `jlpt_n5_example_sentences_seed.csv`
   - Main curated sentence bank.
   - Rows: 293
   - Contains grammar-derived examples plus original curated N5 sentences.
   - Recommended for user-facing flashcards, quiz prompts, listening scripts, and reading snippets.

2. `jlpt_n5_vocab_example_sentences_autogen.csv`
   - One generated fallback example per vocabulary item.
   - Rows: 718
   - Purpose: guarantee every vocab item has at least one sentence.
   - Important: `review_status=auto_generated_needs_human_review`.

3. `jlpt_n5_vocabulary_seed_with_examples.csv`
   - Patched vocabulary seed with example sentence columns filled.
   - Rows: 718
   - Adds `example_sentence_romaji`, `example_sentence_review_status`, and `example_sentence_source`.

## Recommended app usage

Use the curated sentence bank first:
```txt
jlpt_n5_example_sentences_seed.csv
WHERE recommended_for_flashcard=true
```

For vocabulary pages:
```txt
Use curated examples when target_vocab_ids contains vocab.id.
Fallback to jlpt_n5_vocab_example_sentences_autogen.csv by vocab_id.
```

For production:
```txt
review_status IN ('curated_original', 'curated_seed_reviewed_lightly')
```

For internal coverage / staging:
```txt
review_status='auto_generated_needs_human_review'
```

## Why not only scrape a corpus?

Open sentence corpora are useful, but beginner-learning apps need controlled sentence length, known vocabulary, known grammar, and safe content. Tatoeba itself recommends filtering/proofreading sentences before using them in language-learning materials. This seed therefore uses curated/generated beginner examples and keeps corpus references as source-basis guidance, not as copied bulk text.

## Source basis

- Tatoeba corpus licensing/usage guidance: CC-BY 2.0 FR text sentences; recommends filtering and proofreading for learning materials.
- Tanaka Corpus historical/public-domain basis via EDRDG documentation.
- MLC N5 material hub for beginner topics: grammar, vocabulary, particles, dates, counters, listening.
- JLPT official sample-question page confirms sample questions are organized by N1-N5 and show item formats.

## Caveat

The vocabulary fallback examples are mechanically generated. They are grammatically conservative but not all are ideal natural usage examples. Keep them for coverage and review workflow, not as final polished content.
