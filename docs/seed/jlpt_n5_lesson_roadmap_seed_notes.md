# JLPT N5 Lesson / Roadmap Tree Seed Notes

Generated files:

1. `jlpt_n5_lesson_roadmap_tree_seed.csv`
   - Main hierarchy tree.
   - Rows: 136
   - Node types: course, phase, module, lesson.
   - Use this for sidebar navigation, roadmap page, progress checklist, unlock system, and dashboard target.

2. `jlpt_n5_lesson_content_map_seed.csv`
   - Maps each lesson to datasets and item filters.
   - Rows: 204
   - Use this to query kana/vocab/grammar/kanji/counter/example/quiz content without hardcoding frontend logic.

3. `jlpt_n5_lesson_prerequisites_seed.csv`
   - Dependency edges.
   - Rows: 100
   - Use for unlock logic and recommended order.

4. `jlpt_n5_roadmap_milestones_seed.csv`
   - Milestones for dashboard, badges, XP, and roadmap progress.
   - Rows: 11

## Suggested app model

Hierarchy:
```txt
course
  phase
    module
      lesson
```

Completion logic:
```txt
lesson.complete = content done OR quiz score threshold
module.complete = required lessons >= 80%
phase.complete = required lessons >= 85%
course.complete = all required phases complete + full mock done
```

Recommended dashboard queries:
```txt
Current lesson:
WHERE node_type='lesson' AND completion < 100
ORDER BY unlock_order ASC
LIMIT 1

Daily target:
Pick 1 new lesson + SRS due + 1 quiz section

Roadmap percent:
completed_required_lessons / total_required_lessons
```

## MVP phases

1. Getting Started
2. Kana Foundation
3. Sentence Foundation
4. Core Vocabulary
5. Verb & Adjective System
6. Kanji & Radicals
7. Numbers, Time & Counters
8. Daily Communication
9. Reading & Listening
10. Review & Mock Test

## Why this order?

The roadmap is designed for app usability:
- Kana and input normalization before sentence practice.
- Basic sentence + particles before large vocab drills.
- Vocab categories before grammar-heavy reading.
- Verb/adjective conjugation before te-form patterns and scenario dialogs.
- Kanji after basic reading confidence.
- Counters/time before shopping/schedule/listening tasks.
- Reading/listening near the end, then mock test.

## Source basis

- JLPT official test sections/time and item categories: https://www.jlpt.jp/sp/e/guideline/testsections.html
- JLPT official sample-question page: https://www.jlpt.jp/e/samples/forlearners.html
- JLPT official guidebook note that vocabulary/kanji/grammar lists are not published for the new test: https://www.jlpt.jp/reference/pdf/guidebook_s_e.pdf
- MLC N5 topic hub used as a public beginner/N5 topic reference: https://www.mlcjapanese.co.jp/n5.html

## Caveat

This is a practical learning-app roadmap seed. It is not an official JLPT syllabus. Modern JLPT does not publish official lists of vocabulary, kanji, and grammar, so this roadmap is intentionally tied to your local seed datasets and transparent source metadata.
