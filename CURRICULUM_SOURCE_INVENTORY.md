# Phase 7B — Curriculum Source Inventory

**Date**: 2026-08-11  
**Project**: StudyQuest AI  
**Scope**: Complete inventory of all curriculum-related entities, registries, JSON data files, adapters, and UI selectors.

---

## 1. Curriculum Source Inventory Table

| Source Location | Type | Used By | Authority Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| `base44/entities/CurriculumStandard.jsonc` | Base44 DB Entity Schema | Backend Base44 API, Data Ingestion | **PRIMARY CANONICAL DB ENTITY** | ✅ AUTHORITATIVE |
| `base44/entities/Subject.jsonc` | Base44 DB Entity Schema | Base44 Taxonomy API, Subject Navigation | Canonical DB Entity | ✅ AUTHORITATIVE |
| `base44/entities/Year.jsonc` | Base44 DB Entity Schema | Base44 Taxonomy API, Grade Level Navigation | Canonical DB Entity | ✅ AUTHORITATIVE |
| `base44/entities/Topic.jsonc` | Base44 DB Entity Schema | Unit / Topic Display Layer | StudyQuest Pedagogical Extension | ℹ️ EXTENSION |
| `base44/entities/Subtopic.jsonc` | Base44 DB Entity Schema | Lesson / Subtopic Display Layer | StudyQuest Pedagogical Extension | ℹ️ EXTENSION |
| `src/services/dskpRegistry.js` | JS Master Registry File | `taxonomyService.js`, Admin & Student UI | Canonical Memory Registry Adapter | 🔄 ALIGNED IN PHASE 7B |
| `src/services/taxonomyService.js` | JS Service Adapter | Frontend Navigation & Widget Mapping | Derived Runtime Adapter | ✅ DERIVED ADAPTER |
| `inventory_data.json` | JSON Data File | Pilot Progress Audit Scripts | Derived Audit Snapshot | ℹ️ SNAPSHOT |
| `base44/functions/generateContentAsset/entry.ts` | Server Function | Content Asset Generation Pipeline | Server Security Authority | ✅ AUTHORITATIVE |
| `base44/shared/blockPromptRegistry.ts` | Server Shared Registry | Prompt Resolution & Context Binding | Server Macro Prompt Authority | ✅ AUTHORITATIVE |
| `src/components/AdminContentStudio.jsx` | React UI Component | Lesson Builder & Curriculum Selection | UI Projection Layer | ℹ️ UI PROJECTION |

---

## 2. Taxonomy Duplication Control Strategy

- **Single Authority**: `base44/entities/CurriculumStandard.jsonc` (Database) and `src/services/dskpRegistry.js` (Memory Registry Adapter) maintain 100% strict alignment.
- **Derived Read-Only Access**: All UI components and frontend services MUST consume curriculum metadata via `taxonomyService.js` or Base44 API queries. No component may hardcode its own SP codes or curriculum text.
