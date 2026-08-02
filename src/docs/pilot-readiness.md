# Production Pilot Readiness System

## Overview
StudyQuest's MVP is architecturally complete. However, before deploying to real Malaysian families, we must institute operational controls. The Pilot Readiness System governs the economics, device performance, and human QA workflows required for a safe launch.

## 1. AI Content Economics
Because StudyQuest relies on Large Language Models (LLMs) to generate lessons, costs can scale linearly with usage.
- The `AICostMonitor.jsx` tracks API tokens consumed by the AI Content Engine.
- By caching generated lessons in the Base44 repository, subsequent students requesting the same SP Code do not incur new token costs. The monitor visualizes the ratio of Generated vs Cached lessons, ensuring financial sustainability.

## 2. Device Performance Verification
Targeting Malaysian primary students means accommodating lower-end hardware (e.g., standard iPads or budget Android tablets).
- `DevicePerformanceTest.jsx` simulates loading times across devices.
- If the mobile browser load time exceeds the 3000ms threshold (as defined in `pilotReadinessRules.json`), the system issues a WARNING, alerting engineering to optimize asset delivery before launch.

## 3. Human QA & Lesson Versioning
While AI generates the content, humans must have the final say on pedagogy and language nuance (Bahasa Melayu).
- **Versioning**: `LessonVersionManager.jsx` tracks lessons through states: `DRAFT` -> `TESTING` -> `APPROVED` -> `ARCHIVED`.
- **QA Sign-Off**: The `LessonPreviewTester.jsx` forces an administrator to manually verify lesson flow, interactive widgets, and AI Tutor responsiveness before a version can transition to `APPROVED`.

## 4. Master Go / No-Go Decision
The `PilotLaunchChecklist.jsx` aggregates all telemetry. If any subsystem (System, Content, Assessment, AI Tutor, Device) fails, the "Initiate Pilot Launch" button is hardware-locked. Only when all tests pass can StudyQuest open its doors to the public.
