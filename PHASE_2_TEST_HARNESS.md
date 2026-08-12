# Phase 2 Test Harness Investigation & Strategy

## 1. Inspection Findings

### How Base44 Functions are Normally Tested
Base44 backend functions are serverless TypeScript/Deno handlers located under `base44/functions/<functionName>/entry.ts`. Each function exports a default handler function with signature `(req: Request) => Promise<Response>`.
In live deployment, Base44 edge servers invoke these handlers by forwarding incoming HTTP requests enriched with internal authentication headers (`Base44-Service-Authorization`, `Base44-App-Id`, `Base44-Api-Url`, `Base44-Functions-Version`, `Authorization`).

### `base44 dev` Local Endpoint Capabilities
`base44 dev` executes the local dev server and syncs with hosted Base44 projects. When invoked, it exposes HTTP endpoints for frontend and function invocation. However:
1. `base44 dev` requires active CLI session authentication (`base44 login`).
2. Standalone automated test execution (`npm run test`) runs in isolated Node.js environments without guaranteeing a running `base44 dev` daemon process listening on `http://localhost:4400`.
3. In local client calls (`createClient({ appId: 'test', token: 'test' })`), the client SDK sends requests as an unauthenticated or end-user role. It does **not** send `Base44-Service-Authorization` headers, because service-role tokens must never be possessed or transmitted by client-side SDK instances.

### Service-Role Execution & Server-Side Environment Requirements
Functions that execute database operations via `base44.asServiceRole` require server-side context where `createClientFromRequest(req)` extracts `Base44-Service-Authorization`.
When client code or an external test calls `generateModularLessonContent` without valid service-role headers forwarded by the Base44 function runtime, the server or handler fails with `401 Unauthorized` or missing service token errors.

### Environment Variables & Local Test Mechanisms
Node.js test runners (`node --test`) have access to standard process environment variables (`process.env`). There is no built-in Base44 offline unit-testing framework provided out of the box in `@base44/sdk` for running service-role functions without a live connection or mock harness.

### Direct Backend Function Importing & Dependency Injection
Backend function code in `base44/functions/*/entry.ts` uses ES modules and standard web standard `Request`/`Response` APIs.
By providing a controlled test harness that imports the function handler directly and supplies valid request contexts (including `Base44-Service-Authorization` headers and intercepting boundary network calls to in-memory entity stores), we can test full backend execution—including input validation, AI generation schema compliance, database graph creation, and rollback cascades—without touching production authorization rules or embedding test backdoors.

---

## 2. Chosen Strategy: Option B / Option C (Controlled Direct Backend & Boundary Harness)

We select **Option B / Option C: Direct Backend Handler Execution with Boundary Interception**.

### Architectural Boundaries
* **Production Code (`base44/functions/generateModularLessonContent/entry.ts`)**: Left 100% UNTOUCHED and unmodified. No `NODE_ENV === "test"` checks or auth bypasses exist in production.
* **Test Harness Context**: Invokes the function handler `default(req)` directly using valid `Request` objects containing simulated service headers (`Base44-App-Id`, `Base44-Service-Authorization`).
* **Entity Persistence & SDK Interception**: Boundary calls to `base44.asServiceRole.entities` (`LessonVersion`, `LessonBlock`, `Assessment`, `QuestionBank`, `QuestionOption`) and `base44.asServiceRole.integrations.CoreLLM` are handled by an in-memory test store and mock LLM engine.
* **Verification Scope**:
  1. Valid payload generates a full 15-block graph + Assessment + QuestionBank + QuestionOptions in `DRAFT` status.
  2. Invalid curriculum input returns HTTP 400 rejection.
  3. Malformed AI output triggers database error & clean rollback of all created records.
  4. Draft versions are denied for student retrieval endpoints (`getLessonContent`).
  5. Newly generated draft versions do not modify `published_version_id` on the main `Lesson`.
  6. Client attempt to inject fake `preview_status` / `quality_score` is sanitized by backend logic.
  7. Admin draft preview verification.
  8. Unauthorized user draft access rejection.
  9. Canonical single generation path check (`AdminContentStudio.jsx`).
  10. Published V1 preservation when V2 generation fails/rolls back.
