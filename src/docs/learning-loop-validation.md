# Learning Loop Validation System

## Overview
The Learning Loop Validation System is the ultimate proving ground for StudyQuest's AI architecture. Before we subject real students to the platform, we must mathematically prove that the interconnected engines hand off data correctly.

## The AI Pipeline Cascade
The core loop consists of 5 sequential hand-offs:
1. **Recommendation Engine**: Analyzes prerequisite mastery and selects the optimal Standard Pembelajaran (SP).
2. **AI Content Engine**: Loads the lesson structure and scales the difficulty based on the student's historical speed.
3. **AI Tutor**: Monitors live widget interaction. If a student struggles, it intervenes with conceptual hints.
4. **Assessment Engine**: Grades the final learning verification.
5. **Mastery Engine**: Translates the raw assessment score into a state transition (`NOT_STARTED` -> `LEARNING` -> `MASTERED`).

## Simulation Methodology
We created `studentSimulationProfiles.json` to inject virtual learners into the engine.

### 1. Fast Learner
- **Behavior**: High accuracy (95%), fast completion.
- **Expected Outcome**: Skips AI Tutor intervention. Quickly transitions mastery state to `MASTERED`.

### 2. Normal Learner
- **Behavior**: Average accuracy (75%), occasional common mistakes.
- **Expected Outcome**: Occasional AI Tutor hint. Transitions mastery state to `LEARNING`, requiring further practice.

### 3. Struggling Learner
- **Behavior**: Low accuracy (40%), frequent mistakes.
- **Expected Outcome**: Heavy AI Tutor intervention. Fails assessment threshold. Mastery state downgrades to `REVIEW_REQUIRED`, forcing the Recommendation Engine to route them to a remedial path.

## Admin Controls
The `LearningLoopSimulator.jsx` allows administrators to select a virtual learner, execute the pipeline, and read the `LearningFlowReport.jsx` to verify every engine fired correctly in sequence.
