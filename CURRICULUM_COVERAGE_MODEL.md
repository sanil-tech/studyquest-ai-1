# CURRICULUM COVERAGE MODEL (PHASE 6A)

This document details the database-driven coverage calculation logic implemented in StudyQuest AI.

---

## 1. DB STATUS CALCULATOR (`getAssetCoverageState`)

Coverage state for any canonical asset type is derived strictly from real-time database query results:

- `PUBLISHED`: At least 1 record has `status === "published"` or `review_status === "published"`.
- `APPROVED`: At least 1 record has `review_status === "approved"`.
- `UNDER_REVIEW` / `DRAFT`: At least 1 record has `status === "draft"` or `review_status === "under_review"`.
- `REJECTED`: At least 1 record has `review_status === "rejected"`.
- `MISSING`: No matching records found in database.

---

## 2. PROGRESS FORMULA

$$\text{Progress \%} = \left( \frac{\text{Count of APPROVED/PUBLISHED Assets}}{\text{Total Required Canonical Assets (12)}} \right) \times 100$$
