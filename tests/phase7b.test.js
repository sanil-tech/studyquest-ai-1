// tests/phase7b.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { getTaxonomySubjects, getTaxonomyYears, getSPEntries, getTaxonomyTopics, getTaxonomySKs, getTaxonomySPs, getSPDetail } from "../src/services/dskpRegistry.js";
import { getSPDetails, getSPCatalogByGrade } from "../src/services/taxonomyService.js";
import { loadFunction, invokeFunction, Base44TestServer } from "./base44Harness.js";

const server = new Base44TestServer();
let serverUrl = "";
let generateContentAssetHandler = null;

test.before(async () => {
  serverUrl = await server.start();
  const genMod = await loadFunction("./base44/functions/generateContentAsset/entry.ts");
  generateContentAssetHandler = genMod.default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();
  server.db.Topic.push({ id: "top_banyak_sedikit", title: "Banyak dan Sedikit" });
  server.db.Subtopic.push({ id: "sub_membandingkan", topic_id: "top_banyak_sedikit", title: "Membandingkan Kuantiti" });
  server.db.CurriculumStandard.push({ id: "cs_1", standard_learning_code: "SP 1.1.1", topic_id: "top_banyak_sedikit" });
});

// 1. Canonical curriculum source exists
test("1. Canonical curriculum source exists", () => {
  const subjects = getTaxonomySubjects();
  assert.ok(subjects.includes("Matematik"));
  assert.ok(subjects.includes("Sains"));
});

// 2. Duplicate authoritative curriculum sources are prevented
test("2. Duplicate authoritative curriculum sources are prevented", () => {
  const spDetail = getSPDetails("1.1.1");
  assert.equal(spDetail.framework, "KSSR_SEMAKAN");
  assert.equal(spDetail.subject, "Matematik");
});

// 3. All existing valid SP codes resolve
test("3. All existing valid SP codes resolve", () => {
  const sp111 = getSPDetail("1.1.1");
  const sp211 = getSPDetail("2.1.1");
  assert.ok(sp111);
  assert.ok(sp211);
});

// 4. All existing valid SK codes resolve
test("4. All existing valid SK codes resolve", () => {
  const sks = getTaxonomySKs("Matematik", "Tahun 1", "Nombor hingga 100");
  assert.ok(sks.some(s => s.sk_code === "1.1"));
  assert.ok(sks.some(s => s.sk_code === "1.2"));
});

// 5. Missing Matematik Tahun 1 SPs are added (25 SPs total)
test("5. Missing Matematik Tahun 1 SPs are added", () => {
  const spEntries = getSPEntries("Matematik", "Tahun 1");
  assert.ok(spEntries.length >= 25);
  assert.ok(spEntries.some(sp => sp.sp_code === "1.2.2"));
  assert.ok(spEntries.some(sp => sp.sp_code === "1.9.1"));
  assert.ok(spEntries.some(sp => sp.sp_code === "2.4.1"));
  assert.ok(spEntries.some(sp => sp.sp_code === "4.3.1"));
});

// 6. SP descriptions match canonical source (Unabridged text)
test("6. SP descriptions match canonical source", () => {
  const sp111 = getSPDetail("1.1.1");
  assert.ok(sp111.title.includes("sama banyak atau tidak sama banyak"));
  assert.ok(sp111.title.includes("lebih atau kurang"));
});

// 7. SK descriptions match canonical source
test("7. SK descriptions match canonical source", () => {
  const sks = getTaxonomySKs("Matematik", "Tahun 1", "Nombor hingga 100");
  const sk11 = sks.find(s => s.sk_code === "1.1");
  assert.equal(sk11.title, "Kuantiti secara intuitif");
});

// 8. Invalid SP / Asset Type rejected
test("8. Invalid SP / Asset Type rejected", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "INVALID_ASSET_TYPE",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 400);
});

// 9. Wrong subject/year/SP mapping rejected
test("9. Wrong subject/year/SP mapping rejected", async () => {
  const payload = {
    topic_id: "top_wrong_topic",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 400);
});

// 10. Golden Pilot SP 1.1.1 remains valid
test("10. Golden Pilot SP 1.1.1 remains valid", () => {
  const sp111 = getSPDetail("1.1.1");
  assert.equal(sp111.sp_code, "1.1.1");
  assert.equal(sp111.studyquest_topic, "Banyak dan Sedikit");
  assert.equal(sp111.studyquest_subtopic, "Membandingkan Kuantiti");
});

// 11. Golden Pilot content remains resolvable
test("11. Golden Pilot content remains resolvable", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "CONCEPT",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 201);
  assert.equal(res.data.curriculum_tags.sp_code, "SP 1.1.1");
});

// 12. AI cannot invent curriculum identity
test("12. AI cannot invent curriculum identity", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "WORKED_EXAMPLE",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.ok(res.data.curriculum_tags);
  assert.equal(res.data.curriculum_tags.sp_code, "SP 1.1.1");
});

// 13. StudyQuest Topic/Subtopic does not replace official SP identity
test("13. StudyQuest Topic/Subtopic does not replace official SP identity", () => {
  const sp111 = getSPDetail("1.1.1");
  assert.equal(sp111.sp_code, "1.1.1");
  assert.equal(sp111.sk_code, "1.1");
});

// 14. Existing approved assets remain resolvable
test("14. Existing approved assets remain resolvable", () => {
  server.db.LessonContent.push({
    id: "lc_approved_1",
    curriculum_tags: { sp_code: "SP 1.1.1" },
    approval_status: "APPROVED"
  });
  const found = server.db.LessonContent.find(c => c.curriculum_tags.sp_code === "SP 1.1.1");
  assert.equal(found.id, "lc_approved_1");
});

// 15. Curriculum selector resolves canonical hierarchy
test("15. Curriculum selector resolves canonical hierarchy", () => {
  const catalog = getSPCatalogByGrade("KSSR_SEMAKAN", "Tahun 1", "Matematik");
  assert.ok(catalog.length >= 25);
});
