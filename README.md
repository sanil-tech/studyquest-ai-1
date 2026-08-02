# StudyQuest AI (RC1)

StudyQuest is a Malaysian KSSR-aligned, AI-native learning platform designed to replace traditional static tuition. Instead of a student searching for lessons, a central AI engine dynamically assesses the student's mastery and generates the exact lesson, interactive widget, and AI Tutor intervention required to close their specific learning gap.

## Architecture

This platform is not a standard CRUD app. It is composed of interacting AI learning engines:

- **KSSR Taxonomy Service**: The master mapping of all standard learning outcomes.
- **Diagnostic Engine**: Determines baseline competency.
- **AI Content Engine**: Procedurally generates full lessons (Objectives, Concept, Widgets, Practice).
- **Assessment & Mastery Engines**: Grades interactions and dynamically routes the student's next step.
- **AI Tutor Engine (Cikgu AI)**: Provides conceptual hints during widget interaction without giving away the direct answer.

## Tech Stack
- Frontend: React / Vite / TailwindCSS
- Backend/DB: Base44 (Persistence & Functions)

## Getting Started

### Local Development
1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and populate the required API keys.
4. Run `npm run dev` to start the frontend.
5. Alternatively, run `base44 dev` to run the frontend and the local Base44 backend together.

### Base44 Integration
This project relies on Base44 for backend persistence and edge functions.
- Run `base44 login` to authenticate the CLI.
- Run `base44 deploy` to push schema changes and functions to the remote Base44 environment.

## Current Status: Release Candidate 1 (RC1)
The MVP architecture has been proven via End-to-End simulations (Phase 24 Pilot Onboarding Drill). The platform is ready for the closed 5-family Alpha test.
