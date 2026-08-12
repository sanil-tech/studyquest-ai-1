# CONTENT PRODUCTION WORKFLOW (PHASE 6A)

This document outlines the step-by-step workflow for administrators and educators creating content in StudyQuest AI.

---

## 1. TOPIC-FIRST PRODUCTION STAGES

1. **Curriculum Target Selection**:
   - Select Subject (e.g. Matematik), Year Level (e.g. Tahun 1), Topic (e.g. Banyak dan Sedikit), Subtopic (e.g. Membandingkan Kuantiti), and SP Code (e.g. SP 1.1.1).

2. **Coverage Inspection**:
   - Check the Content Coverage Panel to view status across all canonical asset types (`NOT_STARTED`, `DRAFT`, `APPROVED`, `REJECTED`).

3. **Single-Asset AI Generation**:
   - Click **"Jana Aset Seterusnya"** or select a specific asset to trigger `generateContentAsset`.
   - Generation scope is strictly **ONE REQUEST = ONE ASSET**.

4. **Live Student Preview & Quality Evaluation**:
   - Preview content in `UniversalLessonPreview`.
   - Inspect Quality Shield score breakdown (minimum threshold 75/100).

5. **Admin Review & Approval / Rejection**:
   - Click **"Luluskan Aset Ini"** (`approveContentAsset`) to approve into Content Library.
   - Click **"Tolak Aset"** to log feedback and request revision.

6. **Content Assembly**:
   - Once key assets are approved, click **"Penumpunan Pelajaran (Assemble)"** (`assembleLessonFromApprovedAssets`) to construct an immutable `LessonVersion` snapshot.

7. **Final Review & Publishing**:
   - Perform full preview of assembled lesson and publish via admin gate.
