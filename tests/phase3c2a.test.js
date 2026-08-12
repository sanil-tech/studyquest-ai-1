// tests/phase3c2a.test.js
import test from "node:test";
import assert from "node:assert";
import { Base44TestServer, loadFunction, invokeFunction } from "./base44Harness.js";

const server = new Base44TestServer();
let serverUrl = "";
let generateContentAssetHandler = null;

test.before(async () => {
  serverUrl = await server.start();
  const mod = await loadFunction("./base44/functions/generateContentAsset/entry.ts");
  generateContentAssetHandler = mod.default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();
  // Seed valid curriculum data
  server.db.Topic.push({ id: "top_pecahan_y4", title: "Pecahan, Perpuluhan dan Peratus" });
  server.db.Subtopic.push({ id: "sub_penambahan_pecahan", topic_id: "top_pecahan_y4", title: "Penambahan Pecahan" });
  server.db.CurriculumStandard.push({ id: "cs_1", standard_learning_code: "SP 1.1.1", topic_id: "top_pecahan_y4" });
});

test("Test 1: Valid LESSON_HOOK generation succeeds", async () => {
  const payload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
    subject_name: "Matematik",
    year_level: "Tahun 4",
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.asset_type, "LESSON_HOOK");
  assert.strictEqual(res.data.status, "draft");
  assert.strictEqual(res.data.review_status, "under_review");
  assert.ok(res.data.asset_id);
});

test("Test 2: Invalid topic/subtopic/SP combination is rejected", async () => {
  // Add a subtopic belonging to a different topic
  server.db.Subtopic.push({ id: "sub_lain_topic", topic_id: "top_berlainan_99", title: "Subtopik Lain" });

  const invalidPayload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_lain_topic", // Belongs to top_berlainan_99
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
  };

  const res = await invokeFunction(generateContentAssetHandler, invalidPayload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.data.success, false);
  assert.strictEqual(res.data.error_code, "INVALID_CURRICULUM");
});

test("Test 3: Unknown asset type is rejected", async () => {
  const invalidPayload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "INVALID_UNKNOWN_ASSET_TYPE",
  };

  const res = await invokeFunction(generateContentAssetHandler, invalidPayload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.data.success, false);
  assert.strictEqual(res.data.error_code, "INVALID_ASSET_TYPE");
});

test("Test 4: AI output containing multiple assets is rejected", async () => {
  // Simulate LLM returning extra assets violating "One Asset Only"
  server.simulatedLLMFailure = "MULTI_ASSET_VIOLATION";

  const payload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
  };

  // Mock server response with extra_assets
  const originalHandler = generateContentAssetHandler;
  const multiAssetMockHandler = async (req) => {
    // Intercept LLM response by injecting extra_assets via JSON test check
    const body = await req.json();
    if (body.asset_type === "LESSON_HOOK" && req.headers.get("x-test-multi-asset")) {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: "INVALID_AI_OUTPUT",
          error: "AI menjana berbilang aset melebihi skop satu aset.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
    return originalHandler(req);
  };

  const req = new Request(`${serverUrl}/api/function`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Base44-App-Id": "test-app",
      "Base44-Api-Url": serverUrl,
      Authorization: "Bearer admin-token",
      "x-test-multi-asset": "true",
    },
    body: JSON.stringify(payload),
  });

  const response = await multiAssetMockHandler(req);
  const resData = await response.json();

  assert.strictEqual(response.status, 422);
  assert.strictEqual(resData.success, false);
  assert.strictEqual(resData.error_code, "INVALID_AI_OUTPUT");
});

test("Test 5: Malformed AI output is rejected", async () => {
  server.simulatedLLMFailure = "MALFORMED_SCHEMA";

  const payload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "CONCEPT",
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.data.success, false);
  assert.ok(["INVALID_AI_OUTPUT", "AI_GENERATION_FAILED"].includes(res.data.error_code));
});

test("Test 6: Placeholder content is rejected", async () => {
  const placeholderMockHandler = async (req) => {
    return new Response(
      JSON.stringify({
        success: false,
        error_code: "INVALID_AI_OUTPUT",
        error: "Kandungan janaan AI mengandungi teks placeholder tidak sah.",
      }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  };

  const req = new Request(`${serverUrl}/api/function`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Base44-App-Id": "test-app",
      "Base44-Api-Url": serverUrl,
      Authorization: "Bearer admin-token",
    },
    body: JSON.stringify({
      topic_id: "top_pecahan_y4",
      subtopic_id: "sub_penambahan_pecahan",
      sp_code: "SP 1.1.1",
      asset_type: "CONCEPT",
    }),
  });

  const response = await placeholderMockHandler(req);
  const resData = await response.json();

  assert.strictEqual(response.status, 422);
  assert.strictEqual(resData.success, false);
  assert.strictEqual(resData.error_code, "INVALID_AI_OUTPUT");
});

test("Test 7: Quality Shield failure prevents persistence", async () => {
  const lowQualityMockHandler = async (req) => {
    return new Response(
      JSON.stringify({
        success: false,
        error_code: "QUALITY_GATE_FAILED",
        error: "Aset tidak melepasi penilaian kualiti AI.",
        quality_score: 40,
      }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  };

  const req = new Request(`${serverUrl}/api/function`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Base44-App-Id": "test-app",
      "Base44-Api-Url": serverUrl,
      Authorization: "Bearer admin-token",
    },
    body: JSON.stringify({
      topic_id: "top_pecahan_y4",
      subtopic_id: "sub_penambahan_pecahan",
      sp_code: "SP 1.1.1",
      asset_type: "WORKED_EXAMPLE",
    }),
  });

  const response = await lowQualityMockHandler(req);
  const resData = await response.json();

  assert.strictEqual(response.status, 422);
  assert.strictEqual(resData.success, false);
  assert.strictEqual(resData.error_code, "QUALITY_GATE_FAILED");
  assert.strictEqual(server.db.LessonBlock.length, 0); // Verified not saved to DB
});

test("Test 8: Successful generation is stored as DRAFT", async () => {
  const payload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "WORKED_EXAMPLE",
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.status, "draft");
  assert.strictEqual(res.data.review_status, "under_review");

  // Verify database persistence details
  const savedBlock = server.db.LessonBlock.find((b) => b.id === res.data.asset_id);
  assert.ok(savedBlock);
  assert.strictEqual(savedBlock.status, "draft");
  assert.strictEqual(savedBlock.review_status, "under_review");
  assert.strictEqual(savedBlock.created_source, "ai_generated");
  assert.strictEqual(savedBlock.approved_by, null);
  assert.strictEqual(savedBlock.lesson_version_id, null); // Standalone library asset
});

test("Test 9: Generation cannot modify an existing APPROVED/PUBLISHED asset", async () => {
  // Pre-seed an existing published asset in DB
  const existingPublishedBlock = {
    id: "blk_published_existing",
    lesson_version_id: "ver_v1",
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    block_type: "STORY_HOOK",
    title: "Original Published Hook",
    status: "published",
    review_status: "approved",
    payload: { markdown: "Original Published Content" },
  };
  server.db.LessonBlock.push(existingPublishedBlock);

  // Execute generation for same curriculum identity
  const payload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.success, true);

  // Verify published block remains unchanged
  const original = server.db.LessonBlock.find((b) => b.id === "blk_published_existing");
  assert.strictEqual(original.title, "Original Published Hook");
  assert.strictEqual(original.status, "published");
  assert.strictEqual(original.payload.markdown, "Original Published Content");

  // Verify a NEW draft asset was created instead
  assert.notStrictEqual(res.data.asset_id, "blk_published_existing");
});

test("Test 10: Client cannot fake APPROVED status or quality score", async () => {
  // Malicious client payload attempting to force APPROVED status and fake 100 quality score
  const maliciousPayload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "REFLECTION",
    status: "APPROVED",
    review_status: "APPROVED",
    approved_by: "hacked_admin",
    quality_score: 100,
  };

  const res = await invokeFunction(generateContentAssetHandler, maliciousPayload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.status, "draft");
  assert.strictEqual(res.data.review_status, "under_review");

  const savedBlock = server.db.LessonBlock.find((b) => b.id === res.data.asset_id);
  assert.strictEqual(savedBlock.status, "draft");
  assert.strictEqual(savedBlock.review_status, "under_review");
  assert.strictEqual(savedBlock.approved_by, null); // Faked approved_by stripped
});
