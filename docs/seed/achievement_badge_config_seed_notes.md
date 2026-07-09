# Achievement / Badge Config Seed Notes

Generated files:

1. `achievement_badge_definitions_seed.csv`
   - Main badge definitions.
   - Rows: 87
   - Includes category, tier, criteria, metric trigger, reward XP/coins, cosmetic unlock key, rarity, and Open Badges compatibility metadata.

2. `achievement_trigger_rules_seed.csv`
   - Trigger/evaluation rules for badges.
   - Rows: 87
   - Use this after app events: lesson completed, quiz submitted, SRS reviewed, daily activity logged, mock submitted.

3. `xp_level_config_seed.csv`
   - Level curve from level 1 to 50.
   - Rows: 50
   - Includes XP thresholds, coin reward, daily XP caps, and unlock features.

4. `reward_catalog_seed.csv`
   - Cosmetic/title/avatar/theme reward catalog.
   - Rows: 24
   - Rewards can be unlocked by achievements or bought with coins.

5. `achievement_metric_catalog_seed.csv`
   - Metric definitions used by achievement rules.
   - Rows: 46

6. `achievement_anti_farming_rules_seed.csv`
   - Rules to prevent XP farming and unhealthy gamification.
   - Rows: 7

7. `achievement_user_state_schema_seed.csv`
   - Suggested DB schema for user achievements, rewards, and XP ledger.
   - Rows: 24

## Recommended MVP tables

Start with:
```txt
achievement_badge_definitions_seed.csv
achievement_trigger_rules_seed.csv
xp_level_config_seed.csv
reward_catalog_seed.csv
achievement_user_state_schema_seed.csv
```

Add later:
```txt
achievement_metric_catalog_seed.csv
achievement_anti_farming_rules_seed.csv
```

## Suggested award flow

```txt
1. User completes action: quiz, lesson, SRS review, daily challenge, mock test.
2. Insert event into user_event_log or domain table.
3. Recalculate affected metrics.
4. Evaluate achievement_trigger_rules where metric_key changed.
5. If threshold met, insert user_achievements row.
6. Insert XP/coin reward into user_xp_ledger.
7. Unlock reward_catalog item if reward_item_key exists.
```

## Design notes

- Badges are mostly one-time unlocks.
- XP should reward learning effort, not farming.
- Streaks motivate consistency, but do not make streak loss too punishing.
- Accuracy badges require minimum quiz item count.
- SRS badges should count due reviews, not spammed early reviews.
- Secret/fun badges are optional.

## Open Badges compatibility

The config includes fields inspired by Open Badges:
```txt
title / description / criteria / evidence / issuer-ready metadata
```

It is not a full OpenBadgeCredential issuer yet. It is an internal badge definition table designed so you can later export selected badges to Open Badges 3.0 style JSON-LD / Verifiable Credentials.

## Source basis

- 1EdTech Open Badges overview: https://www.1edtech.org/standards/open-badges
- 1EdTech Open Badges 3.0 specification: https://www.imsglobal.org/spec/ob/v3p0
- Gamification misuse warning in language-learning apps: https://arxiv.org/abs/2203.16175
- Anki deck options for SRS-related review concepts: https://docs.ankiweb.net/deck-options.html
- JLPT official test sections for N5 mock badge alignment: https://www.jlpt.jp/sp/e/guideline/testsections.html
