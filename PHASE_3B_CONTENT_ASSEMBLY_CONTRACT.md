# PHASE 3B: CONTENT ASSEMBLY CONTRACT

This document defines the architecture, queries, sorting logic, and snapshot compilation contract for `assembleLessonFromApprovedAssets`.

---

## 1. RUNTIME ASSEMBLY SERVICE CONCEPT

The Assembly Service is an internal backend service that queries the Content Library for approved assets and compiles them into a deterministic, 8-stage DSKP `LessonVersion` snapshot.

```text
                                  CONTENT LIBRARY
                   (LessonBlock, LessonContent, LearningActivity, etc.)
                                         │
                                         ▼
           Query: WHERE topic_id = '...' AND sp_code = '...' AND review_status = 'APPROVED'
                                         │
                                         ▼
                      Sort by 8-Stage Deterministic DSKP Sequence
                                         │
                                         ▼
                 Compile into Immutable LessonVersion Snapshot Container
                                         │
                                         ▼
                       Serve to Student via getLearningPackage
```

---

## 2. ASSEMBLY SERVICE CONTRACT (`assembleLessonFromApprovedAssets`)

### Function Signature
* **Function**: `base44/functions/assembleLessonFromApprovedAssets/entry.ts`
* **Invocation**: Internal backend call or Admin trigger.
* **Input Parameters**:
  ```json
  {
    "topic_id": "top_pecahan_y4",
    "sp_code": "SP 1.1.1",
    "lesson_id": "les_pecahan_01",
    "force_new_version": true
  }
  ```

---

## 3. ASSET RETRIEVAL QUERY STRATEGY

The Assembly Service executes parallel queries to retrieve only **APPROVED** assets matching curriculum tags:

```typescript
const [blocks, activities, media, flashcards, questions] = await Promise.all([
  db.entities.LessonBlock.filter({
    topic_id: topicId,
    sp_code: spCode,
    review_status: "APPROVED"
  }),
  db.entities.LearningActivity.filter({
    topic_id: topicId,
    sp_code: spCode,
    status: "published" // or review_status = "APPROVED"
  }),
  db.entities.LessonMediaAsset.filter({
    topic_id: topicId,
    sp_code: spCode,
    status: "published"
  }),
  db.entities.Flashcard.filter({
    topic_id: topicId,
    sp_code: spCode,
    status: "published"
  }),
  db.entities.QuestionBank.filter({
    topic_id: topicId,
    sp_code: spCode,
    status: "published"
  })
]);
```

---

## 4. DETERMINISTIC 8-STAGE SORTING LOGIC

Retrieved assets are sorted into the system-owned 8-stage sequence:

```typescript
const STAGE_ORDER: Record<string, number> = {
  STORY_HOOK: 0,
  LEARNING_OBJECTIVE: 1,
  CONCEPT_CPA: 2,
  WORKED_EXAMPLE: 3,
  INTERACTIVE_PRACTICE: 4,
  KNOWLEDGE_CHECK: 5,
  KEY_TAKEAWAY: 6,
  MISSION_COMPLETE: 7
};

// Map each asset to its corresponding stage and assign order_number
const orderedBlocks = blocks.sort(
  (a, b) => (STAGE_ORDER[a.block_type] ?? 99) - (STAGE_ORDER[b.block_type] ?? 99)
);
```

If a stage asset is missing in the Content Library, the Assembler inserts a fallback system placeholder block (e.g. standard objective or generic practice) to guarantee lesson structural integrity.

---

## 5. COMPILATION INTO IMMUTABLE `LessonVersion` SNAPSHOT

Once assets are retrieved and ordered, the Assembler compiles them into an immutable `LessonVersion` snapshot:

```typescript
// 1. Create new LessonVersion record
const newVersionNumber = (existingVersions.length || 0) + 1;

const lessonVersion = await db.entities.LessonVersion.create({
  lesson_id: lessonId,
  version_number: newVersionNumber,
  status: "published",
  review_status: "published",
  preview_status: "APPROVED",
  sp_code: spCode,
  content_completion_percentage: 100,
  published_at: new Date().toISOString()
});

// 2. Bind compiled blocks to this specific lesson_version_id
for (let i = 0; i < orderedBlocks.length; i++) {
  const asset = orderedBlocks[i];
  await db.entities.LessonBlock.create({
    lesson_version_id: lessonVersion.id,
    sp_code: spCode,
    pedagogical_phase: asset.pedagogical_phase,
    cognitive_level: asset.cognitive_level,
    block_type: asset.block_type,
    title: asset.title,
    order_number: i,
    payload: asset.payload,
    status: "published",
    review_status: "published"
  });
}

// 3. Update parent Lesson to point to this published_version_id
await db.entities.Lesson.update(lessonId, {
  published_version_id: lessonVersion.id,
  status: "published"
});
```

---

## 6. PUBLISHED LESSON COMPATIBILITY & IMMUTABILITY VERIFICATION

To verify that existing published lessons are never broken:

1. **Rule of Immutability**: A student opening an existing `LessonVersion` loads blocks matching `lesson_version_id = version.id`.
2. **Content Library Isolation**: Approving or editing assets in the Content Library creates/updates Library records, but **DOES NOT** touch blocks attached to active `lesson_version_id` snapshots.
3. **Explicit Re-assembly**: Existing published lessons only incorporate updated Content Library assets when an admin explicitly triggers `assembleLessonFromApprovedAssets` to publish a new `version_number`.
