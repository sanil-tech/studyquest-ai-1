# PRODUCTION IMPLEMENTATION PLAN: StudyQuest AI

## 1. Goal Description
The objective is to fix the critical security and structural issues identified in the Production Architecture Audit, specifically addressing the P0 access invariants and legacy code paths, without breaking existing production functionality.

## 2. Proposed Changes

### Component: Core Functions

#### [MODIFY] `base44/functions/getLearningPackage/entry.ts`
- **Issue**: Currently falls back to returning the most recently updated `LessonVersion` if a published version isn't found. This breaks the P0 invariant that students should never see draft/unpublished content.
- **Fix**: Remove the fallback logic. If no `published` `LessonVersion` is found, return a strict `404` or `{ success: false, error: "No published lesson found." }`.

#### [MODIFY] `base44/functions/getLessonContent/entry.ts`
- **Issue**: Leaks `correct_answer` to the client.
- **Fix**: Map over the retrieved questions and explicitly remove or `undefined` the `correct_answer` field before returning the payload to the client.

#### [MODIFY] `base44/functions/publishLessonVersion/entry.ts`
- **Issue**: `force_publish` bypasses the AI Quality Shield and Preview Approval.
- **Fix**: Restrict `force_publish` to true admins only (`user.is_admin === true`) or remove it entirely. This ensures teachers cannot accidentally bypass quality gates.

### Component: Frontend UI

#### [MODIFY] `src/components/AdminContentStudio.jsx`
- **Issue**: Dual V1/V2 generation paths exist. V1 violates deterministic curriculum rules.
- **Fix**: Visually deprecate the V1 path. We will add a "Legacy (Deprecated)" badge and disable its default execution, guiding users to the V2 path. We won't delete V1 until we are 100% sure it's unused.

## 3. User Review Required
> [!IMPORTANT]
> - Do you agree with restricting `force_publish` to `is_admin === true`, or should we remove the `force_publish` flag entirely?
> - Returning a strict 404/Error for unpublished lessons will mean any currently live courses that rely on the draft fallback will stop working for students. Is this acceptable?

## 4. Verification Plan
### Automated Tests
- Run `npm run lint` or standard project checks if available.
### Manual Verification
- Attempt to fetch an unpublished lesson package using a mock student payload to ensure it blocks access.
- Attempt to fetch `getLessonContent` and inspect the network response for `correct_answer`.
- Attempt to use `force_publish` with a mock teacher account to ensure it is rejected.
