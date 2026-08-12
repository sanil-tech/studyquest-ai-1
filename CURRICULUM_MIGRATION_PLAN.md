# Phase 7A — Curriculum Migration Recommendations (Phase 7B Roadmap)

**Date**: 2026-08-10  
**Project**: StudyQuest AI  

---

## Executive Migration Policy

> [!IMPORTANT]
> This migration plan is **PROPOSED ONLY**. Zero database writes, entity modifications, or code refactorings are performed during Phase 7A. All proposed changes will be scheduled for Phase 7B upon review.

---

## Itemized Migration Roadmap

### Phase 7B.1 — Full DSKP Description Alignment
- **Current State**: `dskpRegistry.js` contains truncated SP descriptions for SP 1.1.1 and other seeded SPs.
- **Official DSKP Target**: Full unabridged text from official KPM DSKP documents.
- **Action Required**: Update `CurriculumStandard` database seed with exact unabridged DSKP text.
- **Affected Files**: Base44 DB `CurriculumStandard` table, `src/services/dskpRegistry.js`.
- **Risk**: Low (Non-breaking text update).

### Phase 7B.2 — Single Canonical Taxonomy Service
- **Current State**: Frontend uses `dskpRegistry.js` hardcoded file; backend uses Base44 SDK `CurriculumStandard` entity.
- **Official DSKP Target**: Frontend `taxonomyService.js` queries `CurriculumStandard` entity dynamically via Base44 client SDK with fallback caching.
- **Action Required**: Refactor `taxonomyService.js` to fetch from `base44Client.entities.CurriculumStandard`.
- **Affected Files**: `src/services/taxonomyService.js`, `src/components/AdminContentStudio.jsx`.
- **Risk**: Low (Preserves existing interface contracts).

### Phase 7B.3 — Standard Prestasi (TP1-TP6) Rubric Seeding
- **Current State**: `tahapan_penguasaan` JSON field exists on `CurriculumStandard.jsonc` entity but contains null/empty values in legacy seeders.
- **Official DSKP Target**: Populate TP1 to TP6 assessment rubrics directly from official DSKP documents for all 17 pilot SPs.
- **Action Required**: Add TP1-TP6 structured rubrics into `CurriculumStandard` records.
- **Affected Files**: Base44 DB `CurriculumStandard` seed data.
- **Risk**: Low (Additive field population).

---

## Migration Validation Criteria
1. `npx tsx --test tests/*.test.js` regression suite passes 100% (187/187 tests).
2. All 17 SPs of Matematik Tahun 1 match 100% exact DSKP wording.
3. AI Generation Pipeline receives complete unabridged SP descriptions.
