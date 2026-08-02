# Student Motivation & Adventure Experience (Gamification Layer)

## Overview
To keep 7-year-old Malaysian students engaged, StudyQuest masks its technical intelligence layers (Recommendation, Mastery, Assessment) behind an adventure-based narrative. Instead of "studying lessons," students "explore worlds" and complete "quests."

## The World Map Progression
Students progress through predefined "Worlds" based on their DSKP Mastery.
- **World 1: Kampung Nombor** (Focus: Nombor Bulat, Nilai Tempat)
- **World 2: Bandar Matematik** (Focus: Tambah, Tolak, Wang)
- **World 3: Pulau Sains** (Focus: Masa, Bentuk, Pecahan)

The `AdventureMap` component reads from `worldMap.json`. A world is only unlocked when the student achieves the required mastery threshold in the prerequisite topic (e.g., hitting 80% in "Nilai Tempat" unlocks World 2).

## Narrative Quests ("Cabaran Hari Ini")
The `RecommendationEngine` outputs raw SP codes (e.g., SP 2.1.2). The `gamificationService` intercepts this and translates it into an engaging mission string using a mapping table.
- **Technical**: `SP 2.1.2`
- **Narrative**: `"Kira jumlah kenderaan di Bandar Matematik."`

This is rendered using the new `QuestCard` component, replacing the clinical task list.

## Reward System (XP & Stars)
Upon completing a lesson block, the `gamificationService` calculates rewards based on `gamificationRules.json`:
- **Lesson Completion**: +100 XP, +1 Star
- **Widget Success**: +50 XP per successful interactive interaction
- **Mastery Improvement**: +200 XP, +2 Stars
- **Daily Streak**: +50 XP, +1 Star

These rewards trigger the `RewardPopup` animation and fill the persistent `LevelProgress` bar at the top of the student's screen.

## Integration Note
This gamification layer **does not** contain any learning logic. It is purely a visual and narrative wrapper that reads data from the existing `MasteryEngine` and `RecommendationEngine`.
