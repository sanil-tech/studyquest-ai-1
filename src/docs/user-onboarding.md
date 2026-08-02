# Real User Account & Onboarding System

## Overview
As StudyQuest prepares for the 30-day MVP pilot, the platform shifts from relying solely on mocked "demo" accounts to supporting real families. This system manages parent authentication, child profile provisioning, and the child's "First Time Experience" flow.

## 1. Parent Account Management
The `authService.js` handles parent registration and login.
- **Login/Register UI**: Clean, engaging interfaces (`LoginPage.jsx`, `RegisterPage.jsx`) designed to reassure parents.
- **Data Model**: Parents possess basic credentials (email, name) and are securely linked to their children via `parentId`.

## 2. Child Profile Provisioning
The `familyService.js` allows parents to create multiple child profiles.
- **CreateChildProfile.jsx**: A form restricted by `onboardingRules.json` to only allow currently supported curriculums (KSSR Semakan) and subjects (Matematik Tahun 1).
- **ChildSwitcher.jsx**: A dashboard component that lets the parent swap contexts between multiple children or select who is about to play.

## 3. The First Time Experience (FTE)
When a child profile is newly created and selected for the first time, they do not immediately see the standard gamified dashboard. Instead, they enter `StudentWelcome.jsx`.
- **Step 1: Welcome**: A playful animation greeting the child by name.
- **Step 2: Diagnostic**: (Simulated in MVP UI) The system runs the `diagnosticAssessmentService` to determine baseline mastery.
- **Step 3: Path Generation**: The system feeds the diagnostic results into the `MasteryEngine` and `RecommendationEngine`.
- **Step 4: Quest Unlocked**: The onboarding completes, the flag `onboardingCompleted` is set to `true`, and the child is redirected to their personalized gamified dashboard.

## Integration Notes
This system sits above the existing AI architecture. It ensures that before any recommendation or mastery logic runs, a valid student identity and baseline have been firmly established in the ecosystem.
