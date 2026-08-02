# Student Retention & Pilot Experience System

## Overview
During the first 30-day MVP Pilot, keeping 7-year-old Malaysian students returning daily is critical. The **Retention System** wraps the gamification layer with behavioural hooks (Streaks, Goals, and Motivation) designed to build a daily learning habit.

## Core Features

### 1. Daily Goals
Students are presented with a simple, achievable daily target (e.g., "Selesaikan 1 Cabaran hari ini"). The `DailyGoal` component tracks this progress visually. Meeting the goal solidifies the daily habit.

### 2. The Streak System
The `retentionService` tracks consecutive active days. Milestone rewards are configured in `retentionRules.json`:
- **3 Days**: Konsisten (+100 XP)
- **7 Days**: Pejuang (+300 XP)
- **14 Days**: Lagenda (+700 XP)
- **30 Days**: Juara (+2000 XP)

The `StreakCard` visually represents this on the student's dashboard using a pulsating flame icon when active.

### 3. Contextual Motivation
The `MotivationMessage` component renders dynamic speech bubbles based on the student's current state:
- **Success**: E.g., "Hebat! Kamu semakin dekat untuk membuka tahap baru!"
- **Comeback** (Returning after a missed day): E.g., "Selamat datang kembali! Misi baru sedang menunggu."
- **Struggling**: E.g., "Jangan putus asa! Cuba lagi sekali."

### 4. Admin Pilot Analytics
The `RetentionDashboard` provides administrators with high-level stickiness KPIs to measure the pilot's success:
- Daily Active Students
- Returning Students
- Average Streak
- 7-Day & 30-Day Retention Rates

## Integration with Demo Mode
In `RetentionDashboard`, the initial state simulates data using `demoStudents.json`. 
- **Adam (Strong)** simulates a 14+ day streak and 30-day retention.
- **Bella (Average)** simulates a 3-day streak and 10-day retention.
- **Carl (Struggling)** simulates 0 streaks and 2-day retention, highlighting where manual intervention or system adjustments might be necessary.
