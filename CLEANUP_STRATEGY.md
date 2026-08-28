# Strategi Pembersihan Sistem StudyQuest AI
> **Status:** Cadangan strategi (2026-08-28)
> **Prinsip:** "One Pipe, One Contract" — kunci kepada sistem yang boleh diselenggara

---

## 🎯 Prinsip Pemandu: "One Pipe, One Contract"

Sebelum bersih, kita mesti pilih **satu saluran (pipe) dan satu kontrak (contract)** untuk setiap fungsi. Bila dua paip wujud serentak, data terpecah, pepijat berlapis, dan pelajar lihat kandungan tidak konsisten.

---

## 📊 Inventori Pendua (Yang Patut Dibersihkan)

### A. Penjana Kandungan AI (DUA PAIP — pilih satu)
| Paip | Fail | Baris | Status |
|---|---|---|---|
| **LAMA** | `generateAIContent/entry.ts` | 566 | Jana ke AIExplanation, CommonMistake, TeacherGuide, LessonContent |
| **BARU** | `generateContentAsset/entry.ts` + `generateModularLessonContent/entry.ts` | ~440+~400 | Jana ke LessonBlock (8 kanonikal) + LessonVersion |

**Cadangan:** ✅ **Bersarakan `generateAIContent`** — paip lama ke entiti pertindihan. Pastikan semua panggilan dirihalih ke `generateContentAsset`.

### B. Entiti Kandungan (PERTINDIHAN — gabung ke LessonBlock)
| Entiti | Fungsi | Status |
|---|---|---|
| `AIExplanation` | Penjelasan konsep AI | ⚠️ Pertindihan dengan LessonBlock `CONCEPT_CPA` |
| `CommonMistake` | Kesilapan lazim | ⚠️ Pertindihan dengan LessonBlock `WORKED_EXAMPLE` (memuat kesilapan) |
| `TeacherGuide` | Panduan guru | ⚠️ Metadata guru — patut jadi medan dalam LessonVersion, bukan entiti |
| `LessonContent` | Kandungan versi (notes/video/audio) | ⚠️ Pertindihan dengan LessonBlock + LessonVersion medan |

**Cadangan:** ✅ **Migrasi data ke LessonBlock/LessonVersion → bersara entiti ini.**
- `AIExplanation` → LessonBlock `CONCEPT_CPA`
- `CommonMistake` → LessonBlock `WORKED_EXAMPLE.payload.common_mistakes`
- `TeacherGuide` → medan metadata dalam `LessonVersion` (e.g. `teacher_notes`)
- `LessonContent` → LessonBlock + medan `LessonVersion` (video_url, voice_script)

### C. Komponen Render (DUA RENDERER — pilih satu)
| Renderer | Fail | Baris | Block Types |
|---|---|---|---|
| **LAMA** | `BlockRenderer.jsx` | 1786 | ~30+ jenis (polimorfik, banyak alias) |
| **BARU** | `LessonShellRenderer.jsx` | ~324 | 8 kanonikal (deterministik, peringkat 5) |

**Cadangan:** ✅ **Kunci kepada `LessonShellRenderer`** — 8 blok kanonikal, 5 peringkat pedagogi. `BlockRenderer` disimpan sebagai fallback legacy untuk pelajaran lama sehingga migrasi selesai, kemudian bersara.

### D. Komponen Admin (BERLEBIHAN — audit guna)
Komponen admin yang berpotensi pertindihan:
- `AIGenerationPanel.jsx` (paip lama generateAIContent)
- `ContentHierarchy.jsx`, `ContentPreview.jsx`, `ContentFactoryDashboard.jsx`
- `LessonGenerationQueue.jsx`, `BatchGenerationRunner.jsx`
- `LessonRepairQueue.jsx`, `LessonAuditDashboard.jsx`
- `CurriculumCoverageMatrix.jsx`, `CurriculumGapReport.jsx`
- `InteractiveLessonEditor.jsx`, `LessonVersionManager.jsx`
- `FounderAcceptanceRunner.jsx`, `DevicePerformanceTest.jsx`
- `PilotAnalyticsDashboard.jsx`, `PilotFeedbackDashboard.jsx`, `PilotCommandCenter.jsx`
- `BugTriageDashboard.jsx`, `IssueTracker.jsx`, `SystemHealthDashboard.jsx`
- `AlphaLaunchDashboard.jsx`, `AlphaUserTracker.jsx`

**Cadangan:** ✅ **Audit import di `AdminDashboard.jsx`** — senaraikan yang masih digunakan. Bersara komponen yang tidak dirujuk.

### E. Dokumen Fasa (RIWAYAT HISTORIKAL — arkib)
~70+ fail `.md` laporan fasa (PHASE_2_..., PHASE_3_..., PHASE_8A_..., etc.) di root project. Ini laporan kemajuan lepas, bukan dokumentasi aktif.

**Cadangan:** ✅ **Pindahkan ke folder `docs/archive/phases/`** — jangan padam (nilai sejarah), tetapi jangan halang paparan root.

---

## 🗂️ Urutan Pembersihan (Prioriti)

### Fasa 1: Stabilkan Kontrak (Tanpa Padam)
1. **Kunci `generateContentAsset`** kepada 8 block type LessonShellRenderer
2. **Standarkan `sp_code`** format `"1.1.1"` sahaja
3. **Isi `review_status`** untuk 30 blok unknown → `draft`
4. **Baiki 9 blok payload kosong** (jana semula atau padam)
5. **Migrasi blok lama** ke 8 jenis kanonikal
6. **Ubah assembly gate 15/15 → 8/8**

### Fasa 2: Migrasi Data (Pindah, Bukan Padam)
1. **Migrasi `AIExplanation` → `LessonBlock` (CONCEPT_CPA)** — skrip satu kali
2. **Migrasi `CommonMistake` → `LessonBlock.payload` (WORKED_EXAMPLE)** — skrip satu kali
3. **Migrasi `TeacherGuide` → `LessonVersion.teacher_notes`** — tambah medan, migrasi
4. **Migrasi `LessonContent` → `LessonBlock` + `LessonVersion` medan**
5. **Sahkan tiada rujukan kod** kepada entiti lama sebelum bersara

### Fasa 3: Bersara Paip Lama (Selepas Migrasi Sah)
1. **Bersarakan `generateAIContent/entry.ts`** — tandakan deprecated, hentikan panggilan
2. **Bersarakan `BlockRenderer.jsx`** — gantikan semua import dengan `LessonShellRenderer`
3. **Bersarakan entiti** `AIExplanation`, `CommonMistake`, `TeacherGuide`, `LessonContent` (padam skema, bukan data — data sudah dimigrasi)
4. **Bersarakan komponen admin** yang tidak digunakan (lihat audit import)

### Fasa 4: Arkib Dokumen
1. **Pindah ~70 fail `.md` fasa** ke `docs/archive/phases/`
2. **Tinggalkan 3-4 dokumen induk** di root: `README.md`, `ARCHITECTURE_AUDIT.md`, `CURRICULUM_SOURCE_OF_TRUTH.md`, `CANONICAL_ARCHITECTURE_FREEZE.md`

---

## ⚠️ Peraturan Besar Pembersihan

1. **JANGAN PADAM SEBELUM MIGRASI** — semua entiti lama mesti data dimigrasi ke kontrak baru sebelum skema dibersarakan
2. **MIGRASI PADA MASA NON-PEAK** — pelajar aktif mungkin lihat kandungan lama; migrasi satu SP pada satu masa
3. **UJI SETIAP MIGRASI** — selepas migrasi SP 1.1.1, sahkan pelajar boleh lihat pelajaran tanpa ralat
4. **BACKUP DULU** — export data entiti lama ke JSON sebelum migrasi (untuk rollback)
5. **SATU PERUBAHAN SATU MASA** — jangan migrasi + bersara serentak; migrasi dulu, sahkan, baru bersara

---

## ✅ Senarai Semak Selesai

Selepas pembersihan, sistem patut ada:
- [ ] Satu penjana kandungan: `generateContentAsset` + `generateModularLessonContent`
- [ ] Satu renderer: `LessonShellRenderer` (8 blok kanonikal)
- [ ] Empat entiti kandungan: `LessonBlock`, `LessonVersion`, `QuestionBank`, `Flashcard` (bukan 8+)
- [ ] Sistem PBD berasingan: `Assessment` + `AssessmentAttempt` + `StudentSkillProfile` + `LearningRecommendation`
- [ ] Sistem ganjaran 3-tier: `lesson_complete`, `quiz_practice`, `quiz_mastery` (+ `quiz_pbd_summative` jika tambah)
- [ ] Root project bersih (3-4 dokumen induk, bukan 70+)
- [ ] Tiada kod rujuk entiti/penjana/renderer lama