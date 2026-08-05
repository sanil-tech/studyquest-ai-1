# StudyQuest AI — Product Vision & System Understanding Brief

## Role
You are assisting the development of **StudyQuest AI**, an AI-powered gamified learning platform designed for Malaysian students.

Your role is to understand the product vision, architecture goals, and long-term direction before making technical recommendations or code changes.

---

# 1. Product Vision

StudyQuest AI is a **personalised AI learning adventure platform** that transforms traditional textbook-based learning into an interactive, game-inspired experience.

The goal is:
> Make Malaysian students enjoy learning while mastering the national curriculum through personalised AI tutoring, gamification, and adaptive learning.

StudyQuest AI combines:
* AI tutor
* Curriculum-aligned lesson generation
* Gamified learning adventure
* Interactive activities
* Assessment intelligence
* Student progress tracking
* Parent monitoring

---

# 2. Target Users

## Primary Users

### Students
Age groups:

#### Junior Mode
* Preschool
* Year 1–3 (KSSR)

#### Senior Mode
* Year 4–6 (KSSR)
* Secondary (KSSM)

Students should experience learning as:
`Mission → Learn → Practice → Challenge → Reward → Progress`

---

## Teachers / Content Creators
Teachers use StudyQuest AI to:
* generate curriculum-aligned lessons
* review AI-generated content
* approve lessons
* assign lessons to students
* monitor mastery

---

## Parents
Parents can:
* monitor learning progress
* view achievements
* support learning goals
* manage child accounts

---

# 3. Educational Philosophy

StudyQuest AI follows:

## Malaysian Curriculum Alignment
All learning content must follow:
* KSSR Semakan
* KSSM
* DSKP Standard Kandungan (SK)
* Standard Pembelajaran (SP)
* Pentaksiran Bilik Darjah (PBD)

---

## Learning Model
Lessons should not be just text.

Each lesson should include:
`Story Hook → Concept Introduction → Visual Explanation → Worked Example → Interactive Activity → Knowledge Check → Assessment → Reward`

---

# 4. Gamification System

StudyQuest AI uses a learning adventure system.
Students are guided by mascot companions.

Example:
## Otan 🦧
Main StudyQuest companion.

Role:
* motivate students
* explain concepts
* celebrate achievements
* guide missions

Learning progression:
`World → Adventure Map → Mission → Learning Activity → Challenge → Reward → Unlock Progress`

Rewards:
* XP
* Coins (Syiling)
* Badges
* Avatar progression
* Unlockable items

Rewards must always be connected to meaningful learning activities.

---

# 5. Core System Architecture

The platform uses:

- **Frontend:** React + Vite
- **Backend:** Base44 Serverless Functions (RPCs)
- **AI:** Gemini Models
- **Database:** Base44 Entities

---

# 6. Content Architecture

The source of truth is:
`Lesson → LessonVersion → LessonBlock (LearningActivity, QuestionBank, Flashcard, AIExplanation, TeacherGuide)`

Important rule:
## LessonVersion is the canonical learning snapshot.
Published lessons must never change directly.

Flow:
`Draft Version → AI Generation → Quality Review → Approval → Published Version → Students`

---

# 7. AI Content Generation Objective

AI generation is not random.
The AI must act as:
* Malaysian curriculum expert
* instructional designer
* child learning specialist
* gamification designer

Generated lessons must consider:
* student age
* learning difficulty
* cognitive development
* curriculum standards
* misconceptions
* assessment objectives

---

# 8. Current Development Priority

Current completed area:
## Admin Content Studio
Status:
✅ Production workflow implemented

Flow:
`Admin selects DSKP target → Create Lesson → Create LessonVersion → generateModularLessonContent() → Quality Shield → publishLessonVersion()`

---

# 9. Current Verification Goal

The next priority is verifying the complete learning cycle:
`Teacher creates lesson → AI generates content → Lesson published → Student opens lesson → Student completes activities → Assessment submitted → XP / Coins awarded → Progress recorded`

---

# 10. Development Principles

When analysing or modifying code, always prioritize:
1. Production reliability
2. Data integrity
3. Security
4. Maintainability
5. Student experience
6. Curriculum accuracy

Avoid:
* duplicate systems
* temporary mock workflows
* client-side database authority
* client-side AI generation
* bypassing backend validation

---

# Final Understanding

StudyQuest AI is not a simple AI content generator.

It is intended to become:
> "A Malaysian AI-powered learning adventure ecosystem where every student receives personalised curriculum-based learning journeys."
