# SRS Config Seed Notes

Generated files:

1. `srs_rating_options_seed.csv`
   - 4 rating buttons: Again, Hard, Good, Easy.
   - Use this for flashcard UI and keyboard shortcuts.

2. `srs_algorithm_presets_seed.csv`
   - Scheduler presets:
     - `mvp_fixed_v1`: recommended for first launch.
     - `sm2_like_v1`: optional multiplier-based upgrade.
     - `fsrs_ready_v1`: metadata for future FSRS migration.

3. `srs_deck_configs_seed.csv`
   - Per-deck limits for kana, vocabulary, kanji, grammar, particles, counters, sentences, listening, reading.
   - Includes new-card/day, review/day, target retention, leech thresholds, and card templates.

4. `srs_state_transition_rules_seed.csv`
   - How each card state changes after Again/Hard/Good/Easy.
   - States: `new`, `learning`, `review`, `relearning`.

5. `srs_card_templates_seed.csv`
   - Card generator templates for kana/vocab/kanji/grammar/particles/counters/sentences/listening.
   - These are not rendered cards yet; they are templates for generating cards from your seed datasets.

6. `srs_queue_rules_seed.csv`
   - Queue behavior for daily review:
     - learning due first,
     - overdue review second,
     - new cards last,
     - pause new cards when backlog is high,
     - bury siblings,
     - leech tagging.

7. `srs_user_card_state_schema_seed.csv`
   - Suggested DB fields for user card progress and review logs.

## Recommended MVP scheduler

Use:
```txt
preset_key=mvp_fixed_v1
```

Simple behavior:
```txt
New/Learning:
Again -> 10 minutes
Hard  -> 1 day
Good  -> 3 days
Easy  -> 7 days

Review:
Again -> relearning, 10 minutes, interval roughly x0.25
Hard  -> interval x1.2
Good  -> interval x2.5
Easy  -> interval x3.5
```

## Important UX rule

If user forgot, they must press `Again`, not `Hard`.
`Hard` means they remembered correctly but with effort.

## Suggested due queue order

```txt
1. learning/relearning due
2. overdue reviews
3. new cards
```

## Source basis

- Anki manual deck options:
  https://docs.ankiweb.net/deck-options.html
- Anki official description:
  https://apps.ankiweb.net/
- FSRS tutorial:
  https://github.com/open-spaced-repetition/fsrs4anki/blob/main/docs/tutorial.md
- Open Spaced Repetition:
  https://open-spaced-repetition.github.io/
  https://github.com/open-spaced-repetition

## Caveat

This is an app seed, not a perfect clone of Anki. The MVP fixed scheduler is intentionally simple so it can be implemented quickly and debugged easily. Store enough review logs now, then upgrade to FSRS later when user data exists.
