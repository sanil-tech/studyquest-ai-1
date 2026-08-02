# Alpha Incident Review Process

Bugs during the 14-day Alpha are expected. This document dictates exactly how the engineering team responds to telemetry alerts or user reports.

## Priority 0 (P0): Critical Stop
- **Definition**: Data corruption, inability to log in, infinite loading loops in the lesson engine, or Base44 database outages.
- **Action**: STOP THE PILOT. 
  1. Ping the `alpha-alerts` channel.
  2. Implement a maintenance screen if necessary.
  3. Deploy hotfix immediately.
  4. Manually contact affected families and apologize.

## Priority 1 (P1): Degraded Learning Experience
- **Definition**: The platform is functional, but the pedagogical value is compromised. (e.g., Cikgu AI is hallucinating incorrect math, a widget's drag-and-drop hitboxes are broken on iPads).
- **Action**: Fix within 24 hours.
  1. Do not stop the pilot.
  2. The assigned engineer must push a patch to the Alpha branch and deploy before the next morning.

## Priority 2 (P2): Minor / Cosmetic
- **Definition**: The system works as intended, but with friction (e.g., typos in Parent Dashboard, slight animation lag, "nice to have" feature requests).
- **Action**: Log to the backlog.
  1. Do not fix during the 14-day Alpha to avoid unnecessary code churn and risk of regression.
  2. Batch all P2s for the "Beta Polish" phase.
